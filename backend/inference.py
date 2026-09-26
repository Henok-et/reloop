"""
ReLoop Inference Module
Loads the YOLO model once and provides inference on uploaded images.
"""

import os
from pathlib import Path
from typing import Any

from ultralytics import YOLO

# Official GIZ E-Waste class mapping (Phase 1 model)
CLASS_MAP: dict[int, str] = {
    0: "ACs",
    1: "Compressors",
    2: "Computers",
    3: "Fridges",
    4: "Laptops",
    5: "Microwave",
    6: "TV",
}

MODEL_PATH = os.getenv("RELOOP_MODEL_PATH", str(Path(__file__).parent / "ReLoop_best.pt"))
DEFAULT_CONFIDENCE = float(os.getenv("RELOOP_CONFIDENCE", "0.50"))
DEFAULT_IOU = float(os.getenv("RELOOP_IOU_THRESHOLD", "0.45"))


class ReLoopModel:
    """Singleton-style wrapper for the YOLO detection model."""

    def __init__(self) -> None:
        self.model: YOLO | None = None

    def load(self) -> None:
        """Load the YOLO model from disk. Called once at startup."""
        if not Path(MODEL_PATH).exists():
            raise FileNotFoundError(
                f"Model file not found at {MODEL_PATH}. "
                "Ensure ReLoop_best.pt is in the backend directory."
            )
        import torch

        torch.set_num_threads(1)
        self.model = YOLO(MODEL_PATH)

    def predict(
        self,
        image_path: str,
        confidence: float = DEFAULT_CONFIDENCE,
        iou: float = DEFAULT_IOU,
    ) -> dict[str, Any]:
        """
        Run inference on a single image.

        Returns:
            Dict with 'detections' list and 'image_dimensions'.
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load() first.")

        results = self.model(image_path, conf=confidence, iou=iou, imgsz=640, verbose=False)
        result = results[0]

        detections = []
        boxes = result.boxes

        if boxes is not None and len(boxes) > 0:
            for box in boxes:
                class_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                detections.append(
                    {
                        "class_id": class_id,
                        "class_name": CLASS_MAP.get(class_id, f"Unknown-{class_id}"),
                        "confidence": round(conf, 4),
                        "bbox": {
                            "x1": round(x1, 1),
                            "y1": round(y1, 1),
                            "x2": round(x2, 1),
                            "y2": round(y2, 1),
                        },
                    }
                )

        orig_shape = result.orig_shape  # (height, width)

        return {
            "detections": detections,
            "image_width": orig_shape[1],
            "image_height": orig_shape[0],
            "confidence_threshold": confidence,
            "iou_threshold": iou,
        }


# Module-level singleton
model = ReLoopModel()
