/*
  Content script for highlighting phrases on a webpage.
  When a phrase from the dictionary is found, it is wrapped in a span
  with a yellow background. Hover over it to see the explanation.
*/

// Insert CSS for the highlighted text.
const style = document.createElement("style")
style.textContent = `
  .highlight {
    background-color: yellow;
    cursor: pointer;
  }
`
document.head.appendChild(style)

// Escape special characters in the phrase for use in a regex.
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Walk through all text nodes and highlight phrases.
export function highlightPhrases(dictionary, node) {
  if (node.nodeType === Node.TEXT_NODE) {
    let text = node.textContent
    let replaced = false
    // Replace any dictionary phrase in the text.
    for (const phrase in dictionary) {
      const escapedPhrase = escapeRegExp(phrase)
      const regex = new RegExp(escapedPhrase, "gi")
      if (regex.test(text)) {
        text = text.replace(
          regex,
          (match) =>
            `<span class="highlight" title="${dictionary[phrase]}">${match}</span>`
        )
        replaced = true
      }
    }
    if (replaced) {
      // Create a temporary container to convert the string back to nodes.
      const temp = document.createElement("span")
      temp.innerHTML = text
      node.parentNode.replaceChild(temp, node)
    }
  } else if (
    node.nodeType === Node.ELEMENT_NODE &&
    !["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "OBJECT"].includes(node.tagName)
  ) {
    // Recursively process child nodes.
    for (let i = 0; i < node.childNodes.length; i++) {
      highlightPhrases(dictionary, node.childNodes[i])
    }
  }
}
