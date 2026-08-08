"use client";

import { useState, useEffect } from "react";

export const IntroScreen = () => {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    // If reduced motion is preferred, use a much shorter duration
    const displayDuration = prefersReducedMotion ? 600 : 600;
    const fadeDuration = prefersReducedMotion ? 0 : 400;

    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(() => setShow(false), fadeDuration);
    }, displayDuration);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        // Use the background color of the page so it matches the theme perfectly
        // Fallback to dark if the variable isn't available
        backgroundColor: "var(--page-background, #000)", 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        opacity: fade ? 0 : 1,
        transition: fade ? "opacity 0.4s ease-in-out" : "none",
        pointerEvents: fade ? "none" : "auto", // Block interactions while showing, but allow while fading
      }}
      role="presentation"
      aria-hidden="true"
    >
      <div 
        style={{
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          justifyContent: "center",
          padding: "2rem"
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo/luverse_animation.svg"
          alt="" // Decorative
          className="intro-logo"
          style={{
            width: "100%",
            height: "auto",
            maxWidth: "320px",
          }}
        />
        <style>{`
          :root[data-theme="dark"] .intro-logo {
            filter: invert(1);
          }
        `}</style>
      </div>
    </div>
  );
};
