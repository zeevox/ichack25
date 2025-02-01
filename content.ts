// content.ts
import { Readability } from "@mozilla/readability"
import TurndownService from "turndown"

// Export config so Plasmo knows on which pages to run this script.
export const config = {
    matches: ["<all_urls>"],
    run_at: "document_idle"
}

// Function to extract and log the article markdown.
const extractArticleMarkdown = () => {
    // Use DOMParser to parse a cloned version of the document's HTML.
    const parser = new DOMParser()
    const docClone = parser.parseFromString(
        document.documentElement.outerHTML,
        "text/html"
    )

    const reader = new Readability(docClone)
    const article = reader.parse()

    if (article) {
        // Convert the extracted article HTML to Markdown.
        const turndownService = new TurndownService()
        const markdown = turndownService.turndown(article.content)

        console.log(markdown)
    } else {
        console.log("No article content was found by Readability.")
    }
}

// Run the extraction function once the DOM is loaded.
if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
) {
    extractArticleMarkdown()
} else {
    document.addEventListener("DOMContentLoaded", extractArticleMarkdown)
}

// Ensure this file is treated as a module.
export {}
