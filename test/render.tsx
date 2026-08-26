import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/**
 * Renders a component tree to HTML.
 *
 * Server Components are async functions returning an element tree, so they can
 * be awaited and rendered in plain Node — no DOM needed. Client Components
 * render their first frame the same way, which is what the browser receives
 * before hydration. Event handlers and effects do not run under this renderer;
 * anything that depends on them is left uncovered rather than faked.
 */
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

/**
 * Strips tags and unescapes entities, so assertions match the copy an editor
 * typed into the CMS rather than its HTML-escaped form.
 */
export function text(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:amp|lt|gt|quot|#x27|#39);/g, (entity) => ENTITIES[entity])
    .replace(/\s+/g, " ")
    .trim();
}
