import { useEffect, useRef, useState } from "react";
import { Project, MenuItem } from "@shared/schema";
import { renderMenuToCanvas, renderScreenToCanvas } from "@/lib/oled-utils";

interface OLEDPreviewProps {
  project: Project;
  selectedMenuItem?: MenuItem | null;
}

export default function OLEDPreview({ project, selectedMenuItem }: OLEDPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = project.width;
  const height = project.height;
  const animationRef = useRef<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation loop for smooth scrolling
  const animate = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Only animate menu view with scrolling text (not screen editor view)
    if (!selectedMenuItem && project.menuItems.length > 0) {
      renderMenuToCanvas(ctx, project.menuItems, project.selectedIndex, width, height, timestamp);
      // Request next animation frame but wait until this frame completes
      if (typeof window !== 'undefined') {
        animationRef.current = window.requestAnimationFrame(animate);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    // Initial render based on what's selected
    if (selectedMenuItem) {
      // In screen editor view, just render once
      renderScreenToCanvas(ctx, selectedMenuItem.screenElements, width, height);
      
      // Cancel any ongoing animations
      if (animationRef.current && typeof window !== 'undefined') {
        window.cancelAnimationFrame(animationRef.current);
        setIsAnimating(false);
      }
    } else {
      // In menu view, start animation if there are menu items
      if (project.menuItems.length > 0) {
        // First immediate render
        renderMenuToCanvas(ctx, project.menuItems, project.selectedIndex, width, height);
        
        // Then start animation for scrolling
        if (!isAnimating) {
          setIsAnimating(true);
          animationRef.current = requestAnimationFrame(animate);
        }
      } else {
        // No menu items, just render empty state
        ctx.fillStyle = "white";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText("No Menu Items", width / 2, height / 2);
        ctx.textAlign = "left";
      }
    }

    // Cleanup animation on unmount
    return () => {
      if (animationRef.current && typeof window !== 'undefined') {
        window.cancelAnimationFrame(animationRef.current);
        setIsAnimating(false);
      }
    };
  }, [project, selectedMenuItem, width, height, isAnimating]);

  return (
    <div className="flex flex-col items-center">
      <div className="oled-display p-2 rounded-md" style={{ 
          background: '#111', 
          boxShadow: '0 0 0 2px #444, 0 0 8px rgba(255,255,255,0.1) inset',
          padding: '12px'
        }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #050505, #111)',
          position: 'relative',
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: '0 0 20px rgba(0,0,255,0.05) inset'
        }}>
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="block"
            style={{ 
              width: `${width * 3}px`, 
              height: `${height * 3}px`,
              imageRendering: 'pixelated',
              filter: 'brightness(1.1) contrast(1.2)'
            }}
          />
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'linear-gradient(rgba(0,0,50,0.03), rgba(0,0,50,0.01))',
            pointerEvents: 'none',
            boxShadow: '0 0 10px rgba(100,175,255,0.05) inset'
          }}></div>
        </div>
      </div>
      <div className="mt-4 text-xs text-muted-foreground text-center">
        <p className="font-semibold text-sm text-primary mb-1">{width}x{height} OLED Display</p>
        {selectedMenuItem ? (
          <p>Viewing: {selectedMenuItem.label} Screen</p>
        ) : (
          <p>Viewing: Menu (Use arrows to navigate)</p>
        )}
      </div>
    </div>
  );
}
