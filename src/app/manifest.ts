import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Journal 999", short_name: "J999", description: "The world's press, one newsstand.",
    start_url: "/", display: "standalone", background_color: "#f6f3ec", theme_color: "#0d1228",
    icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }]
  };
}
