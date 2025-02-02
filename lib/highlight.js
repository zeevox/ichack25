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
  
  .bias-popup {
    color: black;
    background-color: white;
    border-radius: 6px;
    padding: 10px;
    box-shadow: 2px 2px 6px rgba(0,0,0,0.5);
    z-index: -9999;
    position: absolute;
    opacity: 0;
    display: block;
    transition: opacity ease-in-out 0.2s;
    max-width: 400px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, sans-serif;
  }
  
  .bias-popup > div {
    margin: 10px 0px;
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
          (match) => `<span class="highlight">${match}</span>`
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
