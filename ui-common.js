/**
 * Shared UI helpers used across modular sections.
 */
export async function loadSection(container, path) {
  const res = await fetch(path);
  const html = await res.text();
  container.insertAdjacentHTML('beforeend', html);
}

export function appendHTML(container, html) {
  container.insertAdjacentHTML('beforeend', html);
}
