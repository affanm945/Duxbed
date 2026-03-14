export function extractPageContent(html) {
  if (!html) return "";

  const marker = '<div class="page-content">';
  const start = html.indexOf(marker);
  if (start === -1) {
    return html;
  }

  // Start at the opening of page-content
  let slice = html.slice(start);

  // Try to cut off before closing body/html/scripts if present
  const endMarkers = ["<!-- FOOTER END -->", "<!-- JAVASCRIPT  FILES", "</body>", "</html>"];
  let endIndex = slice.length;

  for (const m of endMarkers) {
    const idx = slice.indexOf(m);
    if (idx !== -1 && idx < endIndex) {
      endIndex = idx;
    }
  }

  return slice.slice(0, endIndex).trim();
}


