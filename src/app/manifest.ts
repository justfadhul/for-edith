import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "For Edith: Obs & Gyn",
    short_name: "For Edith",
    description: "Obstetrics & Gynaecology study companion",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7f5",
    theme_color: "#a4264f",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
