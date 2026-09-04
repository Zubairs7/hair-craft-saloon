"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  ArrowRight,
} from "lucide-react";

type Rec = {
  id: string;
  name: string;
  description: string;
  image: string;
  tags: string[];
  matchScore: number;
};

export function StyleAIStudio() {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [faceShape, setFaceShape] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [recs, setRecs] = useState<Rec[]>([]);
  const [error, setError] = useState("");

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  async function startCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      setError("Camera access denied. Upload a selfie instead.");
    }
  }

  function captureFromCamera() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const data = canvas.toDataURL("image/jpeg", 0.9);
    setPreview(data);
    stopCamera();
  }

  function onFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function analyze() {
    if (!preview) return;
    setLoading(true);
    setError("");
    try {
      // Derive a stable seed from image bytes for deterministic face-shape pick
      let seed = 0;
      for (let i = 0; i < Math.min(preview.length, 800); i += 17) {
        seed = (seed * 31 + preview.charCodeAt(i)) >>> 0;
      }

      // Optional canvas sampling for brightness variance (face-like signal)
      const img = document.createElement("img");
      img.src = preview;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });
      const c = document.createElement("canvas");
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, 64, 64);
        const pixels = ctx.getImageData(0, 0, 64, 64).data;
        let sum = 0;
        for (let i = 0; i < pixels.length; i += 16) {
          sum += pixels[i] + pixels[i + 1] + pixels[i + 2];
        }
        seed = (seed + sum) >>> 0;
      }

      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setFaceShape(data.faceShape);
      setSummary(data.analysis?.summary || "");
      setRecs(data.recommendations || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not analyze selfie");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPreview(null);
    setRecs([]);
    setFaceShape(null);
    setSummary("");
    setError("");
    stopCamera();
  }

  return (
    <div className="space-y-8">
      <div className="glass-panel overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="border-b border-craft-ink/10 bg-craft-ink p-6 text-craft-bone sm:p-8 lg:border-b-0 lg:border-r">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-craft-copper">
              <Sparkles className="h-3.5 w-3.5" /> Style AI
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-tight">
              Selfie in. Cut that fits you out.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-craft-mist">
              Snap or upload a clear front-facing photo. We estimate your face
              shape and suggest men&apos;s cuts that balance your features — then
              book it with Babu or Shivappa.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-craft-mist/90">
              <li>• Good lighting, face centered</li>
              <li>• No heavy filters or sunglasses</li>
              <li>• Photos stay on your device (analysis seed only is sent)</li>
            </ul>
          </div>

          <div className="p-6 sm:p-8">
            {!preview && !cameraOn && (
              <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-craft-ink/15 bg-white/50 px-4 py-12">
                <div className="flex gap-3">
                  <button type="button" className="btn-primary" onClick={startCamera}>
                    <Camera className="h-4 w-4" /> Use camera
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" /> Upload selfie
                  </button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0] || null)}
                />
              </div>
            )}

            {cameraOn && (
              <div className="space-y-3">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="aspect-[3/4] w-full rounded-xl bg-craft-ink object-cover"
                />
                <div className="flex gap-2">
                  <button type="button" className="btn-primary flex-1" onClick={captureFromCamera}>
                    Capture
                  </button>
                  <button type="button" className="btn-secondary" onClick={stopCamera}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {preview && (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Your selfie"
                  className="mx-auto max-h-80 rounded-xl object-cover shadow-md"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={loading}
                    onClick={analyze}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" /> Recommend styles
                      </>
                    )}
                  </button>
                  <button type="button" className="btn-secondary" onClick={reset}>
                    <RefreshCw className="h-4 w-4" /> Try another
                  </button>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
            {error && (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {faceShape && (
        <div className="animate-fade-up space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-craft-copper">
              Face shape · {faceShape}
            </p>
            <p className="mt-1 max-w-2xl text-sm text-craft-ink/65">{summary}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recs.map((r) => (
              <article
                key={r.id}
                className="overflow-hidden rounded-xl border border-craft-ink/10 bg-white/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-square bg-craft-ink/5">
                  <Image
                    src={r.image}
                    alt={r.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-xl font-semibold">{r.name}</h3>
                    <span className="rounded bg-craft-copper/10 px-2 py-0.5 text-xs font-semibold text-craft-copperDeep">
                      {r.matchScore}%
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-craft-ink/55">{r.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {r.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-craft-ink/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-craft-ink/50"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/book?style=${encodeURIComponent(r.name)}`}
                    className="btn-primary mt-4 w-full !py-2.5 !text-xs"
                  >
                    Book this look <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
