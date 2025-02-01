import { extractArticleMarkdown } from "~lib/extract"

// Export config so Plasmo knows on which pages to run this script.
export const config = {
  matches: ["<all_urls>"],
  run_at: "document_idle"
}

// Run the extraction function once the DOM is loaded.
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  let markdownContent = extractArticleMarkdown()
  console.log(markdownContent);
} else {
  document.addEventListener("DOMContentLoaded", extractArticleMarkdown)
}

// Ensure this file is treated as a module.
export {}
