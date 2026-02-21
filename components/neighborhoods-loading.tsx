"use client";

import React, { useEffect, useState } from "react";
import neighborhoodsSvg from "@/public/Neighborhoods.svg";

const SVG_CLASS_NAME = "neighborhoods-svg";

type AnimationVariant = "pulseTrace" | "neonBreathe" | "scanline" | "sparkle";

interface NeighborhoodsLoadingProps {
  variant?: AnimationVariant;
}

export function NeighborhoodsLoading({
  variant = "neonBreathe",
}: NeighborhoodsLoadingProps) {
  const [svgMarkup, setSvgMarkup] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    fetch(neighborhoodsSvg.src)
      .then((response) => response.text())
      .then((text) => {
        if (!isMounted) {
          return;
        }

        const normalized = text
          .replace(/<\?xml[^>]*\?>\s*/i, "")
          .replace(/<!DOCTYPE[^>]*>\s*/i, "")
          .replace(/\s(width|height)="[^"]*"/gi, "")
          .replace(/<svg\b([^>]*)>/i, `<svg$1 class="${SVG_CLASS_NAME}">`);

        setSvgMarkup(normalized);
      })
      .catch(() => {
        if (isMounted) {
          setSvgMarkup("");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative neighborhoods-loader variant-${variant}`}>
        <style>{`
          @keyframes pulseStroke {
            0%, 100% {
              stroke: #ef4444;
              opacity: 0.4;
            }
            50% {
              stroke: #3b82f6;
              opacity: 1;
            }
          }

          @keyframes traceStroke {
            0% {
              stroke-dashoffset: 1200;
            }
            100% {
              stroke-dashoffset: 0;
            }
          }

          .neighborhoods-loader svg {
            width: 100%;
            height: 100%;
            display: block;
            max-width: 100%;
            max-height: 100%;
          }

          .neighborhoods-loader .${SVG_CLASS_NAME} path {
            fill: none;
            stroke-width: 1.5;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .neighborhoods-loader.variant-pulseTrace .${SVG_CLASS_NAME} path {
            stroke-dasharray: 120 1080;
            stroke-dashoffset: 1200;
            filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.4));
            animation: pulseStroke 2.4s ease-in-out infinite,
              traceStroke 2.8s linear infinite;
          }

          .neighborhoods-loader.variant-neonBreathe .${SVG_CLASS_NAME} path {
            stroke: #22d3ee;
            opacity: 0.7;
            filter: drop-shadow(0 0 10px rgba(34, 211, 238, 0.5));
            animation: pulseStroke 3.2s ease-in-out infinite;
          }

          .neighborhoods-loader.variant-scanline .${SVG_CLASS_NAME} path {
            stroke: #f97316;
            stroke-dasharray: 8 8;
            stroke-dashoffset: 0;
            filter: drop-shadow(0 0 4px rgba(249, 115, 22, 0.5));
            animation: traceStroke 1.6s linear infinite;
          }

          .neighborhoods-loader.variant-sparkle .${SVG_CLASS_NAME} path {
            stroke: #a855f7;
            opacity: 0.6;
            filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.5));
            animation: pulseStroke 1.4s ease-in-out infinite,
              traceStroke 3.2s linear infinite;
          }
        `}</style>

        {svgMarkup ? (
          <div
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        ) : (
          <div className="h-full w-full rounded-full border border-red-400/40 animate-pulse" />
        )}
      </div>
    </div>
  );
}
