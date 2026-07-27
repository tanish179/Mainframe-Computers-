import { createFileRoute } from "@tanstack/react-router";
import { MainframePage } from "./mainframe";

export const Route = createFileRoute("/")({
  component: MainframePage,
  head: () => ({
    meta: [
      {
        title: "Mainframe Computers — Revive Your Tech, Restore Your Life",
      },
      {
        name: "description",
        content:
          "Mainframe Computers is Kolhapur's trusted computer sales & service center. Laptop repair, custom PC building, CCTV installation, network setup & IT solutions.",
      },
    ],
  }),
});
