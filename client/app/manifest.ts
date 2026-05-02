import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SpendWise",
    short_name: "SpendWise",
    description: "Aplicación de finanzas personales para usuarios hispanohablantes.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#041016",
    theme_color: "#041016",
    icons: [
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
