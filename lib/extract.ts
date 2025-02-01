import { Readability } from "@mozilla/readability"
import TurndownService from "turndown"





export const extractArticleMarkdown: () => string = () => {
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
    return turndownService.turndown(article.content)
  } else {
    console.error("No article content was found by Readability.")
    return null
  }
}
