"""
ReLoop FastAPI Backend
AI-Assisted E-Waste Detection Service
"""

import os

# The free Render instance has one small CPU and 512 MB of RAM.
# Limit math libraries before PyTorch is imported so inference does not spawn
# a thread pool large enough to run the process out of memory.
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")

import asyncio
import tempfile
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps

from inference import model

# ── Configuration ──────────────────────────────────────────────────────────────

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
# Longest side passed to YOLO. The model runs at 640px, and a full phone
# photo (around 12 megapixels) gets the 512 MB instance killed mid-request.
MAX_INFERENCE_EDGE = int(os.getenv("RELOOP_MAX_EDGE", "1280"))
CONFIDENCE_THRESHOLD = float(os.getenv("RELOOP_CONFIDENCE", "0.50"))
NMS_IOU_THRESHOLD = float(os.getenv("RELOOP_IOU_THRESHOLD", "0.45"))


# ── App Lifecycle ──────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the YOLO model once at startup."""
    print("⏳ Loading ReLoop YOLO model...")
    try:
        model.load()
        print("✅ Model loaded successfully.")
    except FileNotFoundError as e:
        print(f"❌ {e}")
        raise
    yield
    print("🛑 Shutting down ReLoop API.")


app = FastAPI(
    title="ReLoop Inference API",
    description="AI-Assisted E-Waste Detection — Phase 1",
    version="1.0.0",
    lifespan=lifespan,
)


# ── CORS ───────────────────────────────────────────────────────────────────────

DEFAULT_ORIGINS = [
    "https://reloop-flame.vercel.app",
    "https://reloop-two.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# RELOOP_CORS_ORIGINS="https://a.vercel.app,https://b.vercel.app" overrides the defaults.
ALLOWED_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.getenv("RELOOP_CORS_ORIGINS", ",".join(DEFAULT_ORIGINS)).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ────────────────────────────────────────────────────────────────────

def prepare_image(src_path: str, dest_path: str) -> tuple[int, int]:
    """Apply EXIF orientation and cap the longest side before inference."""
    with Image.open(src_path) as img:
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")
        img.thumbnail((MAX_INFERENCE_EDGE, MAX_INFERENCE_EDGE), Image.Resampling.LANCZOS)
        width, height = img.size
        img.save(dest_path, format="JPEG", quality=85)
    return width, height


def validate_image(file: UploadFile) -> None:
    """Validate uploaded file type and size."""
    if file.filename is None:
        raise HTTPException(status_code=400, detail="No filename provided.")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": model.model is not None,
        "service": "ReLoop Inference API",
        "version": "1.0.0",
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Run YOLO inference on an uploaded e-waste image.

    Accepts: JPG, JPEG, PNG, WebP (max 10 MB)
    Returns: Detections with bounding boxes, confidence scores, and image dimensions.
    """
    validate_image(file)

    # Read and check file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)} MB.",
        )

    # Write to temp file for YOLO inference
    ext = os.path.splitext(file.filename or "image.jpg")[1].lower()
    tmp_path = None
    prepared_path = None

    try:
        with tempfile.NamedTemporaryFile(
            delete=False, suffix=ext, prefix="reloop_"
        ) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        prepared_path = f"{tmp_path}.jpg"
        width, height = prepare_image(tmp_path, prepared_path)
        print(f"Predicting on {width}x{height} image")

        result = await asyncio.to_thread(
            model.predict,
            prepared_path,
            confidence=CONFIDENCE_THRESHOLD,
            iou=NMS_IOU_THRESHOLD,
        )

        return {
            "success": True,
            "session_id": str(uuid.uuid4()),
            **result,
        }

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    finally:
        for path in (tmp_path, prepared_path):
            if path and os.path.exists(path):
                try:
                    os.unlink(path)
                except OSError:
                    pass
