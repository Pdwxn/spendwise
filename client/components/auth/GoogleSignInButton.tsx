"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

type GoogleSignInButtonProps = {
  onToken: (token: string) => Promise<void> | void;
};

const SCRIPT_ID = "google-identity-services";

export function GoogleSignInButton({ onToken }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onTokenRef = useRef(onToken);
  const [isReady, setIsReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    const nextClientId = clientId as string;

    if (!nextClientId) {
      return;
    }

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    function initialize() {
      const google = window.google?.accounts?.id;

      if (!google || !containerRef.current) {
        return;
      }

      google.initialize({
        client_id: nextClientId,
        callback: ({ credential }) => {
          if (credential) {
            void onTokenRef.current(credential);
          }
        },
      });

      containerRef.current.innerHTML = "";
      google.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: "100%",
      });
      setIsReady(true);
    }

    if (existingScript) {
      if (window.google?.accounts?.id) {
        initialize();
      } else {
        existingScript.addEventListener("load", initialize, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initialize;
    document.head.appendChild(script);
  }, [clientId]);

  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-medium text-cyan-50/50"
      >
        Google no configurado
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} />
      {!isReady ? <p className="text-xs text-cyan-100/45">Cargando Google...</p> : null}
    </div>
  );
}
