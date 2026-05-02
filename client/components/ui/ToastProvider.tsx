"use client";

import { ToastContainer } from "react-toastify";

const toastStyles = {
  default: "border-cyan-300/20 bg-slate-950/95 text-cyan-50 shadow-[0_18px_50px_rgba(0,0,0,0.38)] before:bg-cyan-300",
  success: "border-emerald-300/25 bg-slate-950/95 text-cyan-50 shadow-[0_18px_50px_rgba(0,0,0,0.38)] before:bg-emerald-300",
  error: "border-rose-300/25 bg-slate-950/95 text-cyan-50 shadow-[0_18px_50px_rgba(0,0,0,0.38)] before:bg-rose-300",
  info: "border-sky-300/25 bg-slate-950/95 text-cyan-50 shadow-[0_18px_50px_rgba(0,0,0,0.38)] before:bg-sky-300",
  warning: "border-amber-300/25 bg-slate-950/95 text-cyan-50 shadow-[0_18px_50px_rgba(0,0,0,0.38)] before:bg-amber-300",
} as const;

const progressStyles = {
  default: "bg-cyan-300",
  success: "bg-emerald-300",
  error: "bg-rose-300",
  info: "bg-sky-300",
  warning: "bg-amber-300",
} as const;

export function ToastProvider() {
  return (
    <ToastContainer
      position="bottom-center"
      autoClose={1800}
      hideProgressBar={false}
      closeButton={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss={false}
      pauseOnHover={false}
      draggable={false}
      limit={3}
      toastClassName={({ type } = { type: "default" }) =>
        [
          "relative mx-2 mb-4 w-[calc(100vw-1rem)] max-w-sm overflow-hidden rounded-[1.1rem] border px-3 py-3 pl-4 text-[13px] leading-5 backdrop-blur-xl before:absolute before:left-0 before:top-0 before:h-full before:w-1 sm:mx-4 sm:mb-20 sm:w-auto sm:max-w-md sm:px-4 sm:py-3 sm:pl-5 sm:text-sm sm:leading-6",
          toastStyles[type ?? "default"],
        ].join(" ")
      }
      progressClassName={({ type } = { type: "default" }) => progressStyles[type ?? "default"]}
    />
  );
}
