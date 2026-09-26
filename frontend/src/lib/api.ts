/**
 * ReLoop API Client
 */

import type { PredictionResponse, HealthResponse } from "./types";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const API_URL = (
  configuredApiUrl || (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "")
).replace(/\/+$/, "");

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "APIError";
  }
}

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

/**
 * Send an image to the inference API for YOLO detection.
 * Pass an AbortSignal to let the worker cancel a slow request.
 */
export async function predictImage(file: File, signal?: AbortSignal): Promise<PredictionResponse> {
  const formData = new FormData();
  formData.append("file", file);

  if (!API_URL) {
    throw new APIError(
      "The inference API is not configured. Set NEXT_PUBLIC_API_URL in your Vercel project to the public FastAPI URL."
    );
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      body: formData,
      signal,
    });
  } catch (err) {
    if (isAbortError(err)) throw err;
    throw new APIError(
      "Could not reach the detection service. Check your connection and try again."
    );
  }

  if (!response.ok) {
    let detail = "Detection service returned an error.";
    try {
      const err = await response.json();
      if (err.detail) detail = err.detail;
    } catch {
      // ignore parse error
    }

    if (response.status === 413) {
      throw new APIError("File too large. Maximum size is 10 MB.", 413);
    }
    if (response.status === 400) {
      throw new APIError(detail, 400);
    }
    if (response.status === 503) {
      throw new APIError(
        "The detection service is still starting up. Wait a minute and try again.",
        503
      );
    }
    if (response.status === 502 || response.status === 504) {
      throw new APIError(
        "The detection service did not answer in time. It may be waking up; try again in a minute.",
        response.status
      );
    }

    throw new APIError(detail, response.status);
  }

  const data: PredictionResponse = await response.json();

  if (!data.success) {
    throw new APIError("Inference failed. Please try again.");
  }

  return data;
}

/**
 * Check the health of the inference API.
 */
export async function checkHealth(): Promise<HealthResponse> {
  if (!API_URL) {
    throw new APIError(
      "The inference API is not configured. Set NEXT_PUBLIC_API_URL in your Vercel project to the public FastAPI URL."
    );
  }

  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new APIError("Health check failed", response.status);
    }
    return await response.json();
  } catch {
    throw new APIError("Detection service unavailable.");
  }
}
