"use client";

import { useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "right";
}

export function Tooltip({ content, children, side = "right" }: TooltipProps) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const show = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    if (side === "right") {
      setCoords({ top: rect.top + rect.height / 2, left: rect.right + 8 });
    }
  }, [side]);

  const hide = useCallback(() => setCoords(null), []);

  return (
    <>
      <div ref={triggerRef} onMouseEnter={show} onMouseLeave={hide}>
        {children}
      </div>

      {coords &&
        createPortal(
          <div
            role="tooltip"
            style={{ top: coords.top, left: coords.left }}
            className="pointer-events-none fixed z-[9999] -translate-y-1/2 whitespace-nowrap rounded-lg border border-border/60 bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-lg"
          >
            <span className="absolute top-1/2 -left-[5px] h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-b border-l border-border/60 bg-foreground" />
            {content}
          </div>,
          document.body
        )}
    </>
  );
}
