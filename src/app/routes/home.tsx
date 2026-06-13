import { HomePage } from "@pages/home/ui/home-page";

import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Demo UI Kit" },
    { name: "description", content: "Стартовый UI-kit для демо-экзамена" },
  ];
}

export default HomePage;
