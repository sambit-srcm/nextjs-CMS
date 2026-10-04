import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/** Renders a component to an HTML string. Click handlers do not run. */
export function render(element: ReactElement): string {
  return renderToStaticMarkup(element);
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
};

/** Strips tags and decodes entities, to compare against plain CMS text. */
export function text(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:amp|lt|gt|quot|#x27|#39);/g, (entity) => ENTITIES[entity])
    .replace(/\s+/g, " ")
    .trim();
}
