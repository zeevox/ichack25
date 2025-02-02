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
    border-radius: 5px;
    padding: 10px;
    box-shadow: 4px 4px 12px rgba(0,0,0,0.5);
    z-index: 9999;
    position: absolute;
    display: none;
  }
  
  /* Base styling for the target word */
.tooltip-target {
  position: relative; /* establishes a positioning context for the tooltip */
  cursor: pointer;
  /* Optionally add some highlight effect */
  color: #0077cc;
}

/* The tooltip box – hidden by default */
.tooltip-popup {
  position: absolute;
  top: 120%; /* positions the box just below the word */
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: #fff;
  padding: 10px 15px;
  border-radius: 4px;
  z-index: 10;
  display: none; /* hide by default */
  white-space: nowrap;

}

/* Optionally style an icon inside the tooltip */
.tooltip-popup .icon-info {
  margin-right: 5px;
  /* Assume you have an icon font or similar – adjust as needed */
}

/* Show the tooltip on hover */
.tooltip-target:hover .tooltip-popup {
  display: block;
  opacity: 1;
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
