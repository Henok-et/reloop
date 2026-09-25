# ReLoop — AI-Assisted E-Waste Tracking & Circular Guidance

**Phase 1 Prototype** | Built on the official GIZ E-Waste Database

ReLoop is an AI-assisted workflow for identifying, verifying, and routing electronic waste using YOLO object detection.

> AI assists workers in identifying e-waste → Workers verify the identification → The system provides contextual guidance → Verified items enter a traceable workflow.

---

## Architecture

```
Frontend (Next.js / TypeScript / Tailwind CSS)
    ↓ POST /predict (multipart image)
FastAPI Inference Service
    ↓ YOLO inference
ReLoop_best.pt (YOLOv11n)
    ↓ Detection JSON
Frontend renders bounding boxes + verification UI
```

The frontend and AI inference service are fully separated. The YOLO model can be upgraded without changing the frontend.

---

## Model Classes (GIZ Official)

| ID | Class       |
|----|-------------|
| 0  | ACs         |
| 1  | Compressors |
| 2  | Computers   |
| 3  | Fridges     |
| 4  | Laptops     |
| 5  | Microwave   |
| 6  | TV          |

---

## Project Structure

```
ReLoop/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── inference.py          # YOLO model wrapper
│   ├── requirements.txt      # Python dependencies
│   └── ReLoop_best.pt        # YOLO model weights
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx    # Root layout + metadata
│   │   │   ├── page.tsx      # Landing page
│   │   │   ├── globals.css   # Design system
│   │   │   └── scan/
│   │   │       └── page.tsx  # Detection workspace
│   │   ├── components/
│   │   │   └── reloop/
│   │   │       ├── DetectionWorkspace.tsx
│   │   │       ├── ImageUploader.tsx
│   │   │       ├── CameraCapture.tsx
│   │   │       ├── DetectionCanvas.tsx
│   │   │       ├── DetectionSummary.tsx
│   │   │       ├── VerificationPanel.tsx
│   │   │       ├── GuidancePanel.tsx
│   │   │       ├── RecordPanel.tsx
│   │   │       ├── ProcessingState.tsx
│   │   │       └── EmptyDetection.tsx
│   │   └── lib/
│   │       ├── api.ts        # API client
│   │       ├── types.ts      # TypeScript types
│   │       └── constants.ts  # GIZ classes, guidance
│   ├── .env.local            # API URL config
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## Setup & Development

### Prerequisites

- **Node.js** 18+ (for Next.js frontend)
- **Python** 3.10+ (for FastAPI backend)
- **pip** or **conda** (for Python dependencies)

### 1. Install Backend

```bash
cd backend
pip install -r requirements.txt
```

> Ensure `ReLoop_best.pt` is in the `backend/` directory.

### 2. Start FastAPI

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.

Verify it works:
```bash
curl http://localhost:8000/health
```

### 3. Install Frontend

```bash
cd frontend
npm install
```

### 4. Start Next.js

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### 5. Test Upload

1. Open `http://localhost:3000`
2. Click **Upload Image**
3. Select an image containing e-waste (laptops, TVs, fridges, etc.)
4. Click **Analyze Image**
5. Verify detections, review guidance, record items

### 6. Test Camera

1. Open `http://localhost:3000` on your phone (same network)
2. Click **Scan with Camera**
3. Grant camera permission
4. Capture a photo of e-waste
5. Complete the detection workflow

---

## API Documentation

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "service": "ReLoop Inference API",
  "version": "1.0.0"
}
```

### `POST /predict`

Run YOLO inference on an uploaded e-waste image.

**Request:** `multipart/form-data` with field `file` (JPG, JPEG, PNG, WebP — max 10 MB)

**Response:**
```json
{
  "success": true,
  "session_id": "uuid-v4",
  "detections": [
    {
      "class_id": 4,
      "class_name": "Laptops",
      "confidence": 0.91,
      "bbox": {
        "x1": 120.0,
        "y1": 80.0,
        "x2": 420.0,
        "y2": 350.0
      }
    }
  ],
  "image_width": 1920,
  "image_height": 1080
}
```

**Error Responses:**
- `400` — Invalid file format or missing file
- `413` — File too large (>10 MB)
- `500` — Model inference error

---

## Environment Variables

### Frontend (`.env.local`)

| Variable             | Description                      | Default                  |
|----------------------|----------------------------------|--------------------------|
| `NEXT_PUBLIC_API_URL` | FastAPI inference service URL    | `http://localhost:8000` locally; required in Vercel |

### Backend (Environment)

| Variable                | Description                | Default                    |
|-------------------------|----------------------------|----------------------------|
| `RELOOP_MODEL_PATH`     | Path to YOLO model file    | `./ReLoop_best.pt`        |
| `RELOOP_CONFIDENCE`     | Minimum confidence threshold | `0.25`                   |
| `RELOOP_CORS_ORIGINS`   | Allowed CORS origins (comma-separated) | `http://localhost:3000,http://127.0.0.1:3000` |

---

## Vercel Deployment

### Frontend Deployment

1. Push the `frontend/` directory to a Git repository
2. Connect to Vercel
3. Set root directory to `frontend`
4. Set environment variable:
   - `NEXT_PUBLIC_API_URL` = your production FastAPI URL
5. Deploy

### Backend Deployment

The Python inference service must be hosted separately (e.g., Railway, Render, fly.io, or a VPS). It cannot run inside Vercel's serverless environment.

1. Deploy the `backend/` directory to your hosting provider
2. Ensure `ReLoop_best.pt` is included in the deployment
3. Set `RELOOP_CORS_ORIGINS` to your Vercel frontend URL, for example `https://your-app.vercel.app`
4. Start with: `uvicorn main:app --host 0.0.0.0 --port 8000`

### Fixing "Detection service unavailable" on Vercel

The Vercel frontend cannot reach `localhost:8000`; that address refers to the
visitor's own computer. Deploy the FastAPI backend separately, then add this
environment variable in Vercel under **Project Settings → Environment Variables**:

```text
NEXT_PUBLIC_API_URL=https://your-public-backend.example.com
```

Apply it to the Production environment and redeploy. The backend must allow the
Vercel origin through `RELOOP_CORS_ORIGINS`, and its `/health` endpoint should
return `model_loaded: true` before testing an upload.

---

## Phase 1 Known Limitations

- **No authentication** — No user accounts or access control
- **No persistent database** — Session records stored in browser localStorage
- **No image storage** — Uploaded images are not permanently saved
- **Single model** — YOLO11n Phase 1 model with 7 classes only
- **No batch processing** — One image at a time
- **No offline mode** — Requires network connectivity to the inference API
- **No audit trail** — Records are session-local, not server-side
- **No multi-language** — English-only interface
- **Detection limitations** — AI detection cannot determine hazardous substances, refrigerant presence, battery condition, electrical safety, or recyclability certification

---

## Product Principles

ReLoop is not simply an image classifier. The product workflow is:

1. **AI assists** workers in identifying e-waste
2. **Workers verify** the identification
3. **The system provides** contextual guidance
4. **Verified items** can enter a traceable workflow

The current model is a Phase 1 prototype trained on the GIZ E-Waste Database. It should not be treated as an authoritative classification system.

---

## License

Phase 1 Prototype — Internal Use
