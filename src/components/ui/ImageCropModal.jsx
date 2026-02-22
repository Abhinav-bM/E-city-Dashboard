"use client";
import React, { useState, useRef, useCallback } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Crop, RotateCcw, Check, ImageIcon, Maximize2 } from "lucide-react";

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

const ASPECTS = [
  { label: "Free", value: undefined },
  { label: "1 : 1", value: 1 },
  { label: "4 : 3", value: 4 / 3 },
  { label: "16 : 9", value: 16 / 9 },
  { label: "3 : 4", value: 3 / 4 },
];

export default function ImageCropModal({ src, onConfirm, onClose }) {
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [aspect, setAspect] = useState(1);
  const [isCropping, setIsCropping] = useState(false);

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
    setAspect(1);
  }, []);

  const handleSkipCrop = async () => {
    const res = await fetch(src);
    const blob = await res.blob();
    onConfirm(blob);
  };

  const handleReset = () => {
    setCrop(undefined);
    setCompletedCrop(null);
  };

  const handleApplyCrop = async () => {
    if (!completedCrop || !imgRef.current) {
      handleSkipCrop();
      return;
    }
    setIsCropping(true);
    try {
      const image = imgRef.current;
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      canvas.toBlob(
        (blob) => {
          if (blob) onConfirm(blob);
          else handleSkipCrop();
        },
        "image/jpeg",
        0.95,
      );
    } catch {
      handleSkipCrop();
    } finally {
      setIsCropping(false);
    }
  };

  return (
    /* ── Backdrop ── */
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 dark:bg-black/85 backdrop-blur-md">
      {/* ── Modal card ── */}
      <div
        className="relative w-full max-w-3xl flex flex-col rounded-2xl overflow-hidden shadow-2xl max-h-[92vh]
                      bg-white dark:bg-[#0f1117]
                      border border-slate-200 dark:border-white/[0.07]"
      >
        {/* Ambient glow — dark mode only */}
        <div
          className="hidden dark:block absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          className="hidden dark:block absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          }}
        />

        {/* ── HEADER ── */}
        <div
          className="relative flex items-center justify-between px-6 py-4 shrink-0
                        border-b border-slate-200 dark:border-white/[0.07]
                        bg-slate-50 dark:bg-transparent"
        >
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500">
              <Crop size={15} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide">
                Crop &amp; Adjust
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">
                Drag to set crop area
              </p>
            </div>
            <span
              className="ml-2 text-[10px] font-semibold uppercase tracking-widest
                             text-indigo-500 dark:text-indigo-400
                             bg-indigo-50 dark:bg-indigo-400/10
                             px-2 py-0.5 rounded-full
                             border border-indigo-200 dark:border-indigo-400/20"
            >
              Optional
            </span>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all
                       text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white
                       bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10"
            title="Cancel"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── CROP CANVAS ── */}
        <div
          className="relative flex-1 overflow-auto min-h-0 flex items-center justify-center p-6"
          style={{
            /* Light: soft grey checkerboard. Dark: near-invisible white squares */
            background:
              "repeating-conic-gradient(var(--checker-a) 0% 25%, var(--checker-b) 0% 50%) 0 0 / 20px 20px",
          }}
        >
          {/* CSS variables for the checker colours, scoped by color scheme */}
          <style>{`
            :root { --checker-a: rgba(0,0,0,0.04); --checker-b: rgba(0,0,0,0.08); }
            .dark { --checker-a: rgba(255,255,255,0.02); --checker-b: transparent; }
          `}</style>

          <div
            className="relative rounded-xl overflow-hidden shadow-2xl
                          border border-slate-200 dark:border-white/10"
          >
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              className="max-w-full block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={src}
                alt="Crop preview"
                onLoad={onImageLoad}
                className="block"
                style={{
                  maxHeight: "48vh",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            </ReactCrop>
          </div>
        </div>

        {/* ── TOOLBAR ── */}
        <div
          className="relative shrink-0 px-6 py-3 flex items-center gap-3 flex-wrap
                        border-t border-b border-slate-200 dark:border-white/[0.07]
                        bg-slate-50 dark:bg-white/[0.02]"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mr-1">
            Ratio
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            {ASPECTS.map((a) => {
              const active = aspect === a.value;
              return (
                <button
                  key={a.label}
                  onClick={() => setAspect(a.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 ${
                    active
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                      : "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  {a.label}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="w-px h-5 mx-1 bg-slate-200 dark:bg-white/10" />

          {/* Reset */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-medium transition-all px-3 py-1.5 rounded-lg
                       text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white
                       bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07]
                       hover:bg-slate-200 dark:hover:bg-white/10"
          >
            <RotateCcw size={11} />
            Reset
          </button>

          {/* Select All */}
          <button
            onClick={() => {
              if (imgRef.current) {
                const { width, height } = imgRef.current;
                setCrop(
                  aspect
                    ? centerAspectCrop(width, height, aspect)
                    : { unit: "%", x: 0, y: 0, width: 100, height: 100 },
                );
              }
            }}
            className="flex items-center gap-1.5 text-xs font-medium transition-all px-3 py-1.5 rounded-lg
                       text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white
                       bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07]
                       hover:bg-slate-200 dark:hover:bg-white/10"
            title="Fill entire image"
          >
            <Maximize2 size={11} />
            Select All
          </button>
        </div>

        {/* ── FOOTER ── */}
        <div
          className="relative flex items-center justify-between px-6 py-4 shrink-0
                        bg-slate-50 dark:bg-transparent"
        >
          {/* Use Original */}
          <button
            onClick={handleSkipCrop}
            className="flex items-center gap-2 text-sm font-medium transition-all px-4 py-2.5 rounded-xl
                       text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white
                       bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07]
                       hover:bg-slate-100 dark:hover:bg-white/10 shadow-sm"
          >
            <ImageIcon size={14} />
            Use Original
          </button>

          <div className="flex items-center gap-3">
            {/* Dimensions hint */}
            <span className="text-xs text-slate-400 dark:text-slate-600">
              {completedCrop
                ? `${Math.round(completedCrop.width)} × ${Math.round(completedCrop.height)} px`
                : "No crop selected"}
            </span>

            {/* Apply */}
            <button
              onClick={handleApplyCrop}
              disabled={isCropping}
              className="flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-xl transition-all
                         text-white disabled:opacity-50
                         bg-gradient-to-r from-indigo-500 to-violet-500
                         shadow-[0_0_20px_rgba(99,102,241,0.35)] disabled:shadow-none"
            >
              {isCropping ? (
                <>
                  <svg
                    className="animate-spin"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Processing…
                </>
              ) : (
                <>
                  <Check size={14} />
                  Apply &amp; Crop
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
