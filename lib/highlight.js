/*
  Content script for highlighting phrases on a webpage.
  When a phrase from the dictionary is found, it is wrapped in a span
  with a yellow background. Hover over it to see the explanation.
*/

// Insert CSS for the highlighted text.
const style = document.createElement("style")
style.textContent = `
  .highlight {
    background-color: #F1AE55;
    cursor: pointer;
  }
  
  .bias-popup {
    color: black;
    background-color: white;
    border-radius: 10px;
    padding: 10px;
    padding-bottom: 0px;
    box-shadow: 0px 3px 6px rgba(0,0,0,0.3);
    z-index: -9999;
    position: absolute;
    font-size: 16px;
    opacity: 0;
    display: block;
    transition: opacity ease-in-out 0.2s;
    max-width: 400px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, sans-serif;
  }
  
  .bias-popup > div {
    margin: 10px 0px;
  }

  .loading-container {
    position: fixed;
    bottom: 0px;
    right: 0px;
    display: flex;
    box-shadow: 0px 3px 6px rgba(0,0,0,0.3);
    align-items: center;
    gap: 10px;
    background: white;
    max-width: 400px;
    color: black;
    background: #F1AE55;
    padding: 8px 12px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, sans-serif;
    border-top-left-radius: 8px;
    font-size: 16px;
    z-index: 10000000000;
  }

  .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid white;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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
