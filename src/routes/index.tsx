import { createFileRoute } from "@tanstack/react-router";
import { GridPopApp } from "@/components/game/app";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <GridPopApp />;
}
