"use client";

import { ToastContainer } from "react-toastify";

export function ToastProvider() {
  return (
    <ToastContainer
      position="bottom-center"
      autoClose={2500}
      hideProgressBar
      closeButton={false}
      newestOnTop
      pauseOnFocusLoss={false}
      toastClassName="mx-4 mb-20 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white shadow-lg"
    />
  );
}
