import Anthropic from "@anthropic-ai/sdk"

import { extractArticleMarkdown } from "~lib/extract"
import { highlightPhrases } from "~lib/highlight"

// Export config so Plasmo knows on which pages to run this script.
export const config = {
  matches: ["<all_urls>"],
  run_at: "document_idle"
}

let markdownContent: string = extractArticleMarkdown()
console.log(markdownContent)

const anthropic = new Anthropic({
  apiKey:
    "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",
  dangerouslyAllowBrowser: true
})

async function analyzeBiasedLanguage(
  articleText: string
): Promise<Record<string, string>> {
  const prompt = `Please analyze the following article for sensationalist and biased language. For each biased or sensationalist word or phrase you identify, explain why it demonstrates bias or sensationalism. Format your response as a JSON object where each key is the biased word or phrase, and each value is a brief explanation of why it's biased or sensationalist.

Article text:
${articleText}

Please respond with only the JSON object, no other text.`

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }]
    })

    // Parse the response as JSON
    return JSON.parse(message.content[0]["text"])
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`API Error: ${error.message}`)
    } else {
      console.error(`Error: ${error}`)
    }
    throw error
  }
}

// Example usage:
async function main() {
  try {
    // const biasedLanguageAnalysis = await analyzeBiasedLanguage(markdownContent)
    // console.log(biasedLanguageAnalysis)
    const biasedLanguageAnalysis = {
      "shocking scenes":
        "Sensationalist language that implies extreme drama without objective description",
      nightmare:
        "Emotionally charged word that suggests trauma without providing specific context",
      "endured months":
        "Biased phrasing that implies suffering without neutral reporting",
      "narrowness of the graves":
        "Emotionally provocative metaphorical language that introduces bias",
      "deeply concerned":
        "Vague, subjective language that implies emotional state without factual basis",
      catastrophic:
        "Sensationalist descriptor that exaggerates conditions without precise measurement",
      "impossible for them to be in Gaza":
        "Emotionally charged statement that presents a subjective perspective as objective fact",
      "pure happiness":
        "Subjective, sensationalist description of emotional state",
      "bitter moment":
        "Emotionally loaded phrase that introduces personal perspective into reporting"
    }
    console.log("Biased/Sensationalist Language Analysis:")
    for (const [phrase, explanation] of Object.entries(
      biasedLanguageAnalysis
    )) {
      console.log(`\n"${phrase}":`, explanation)
    }
    highlightPhrases(biasedLanguageAnalysis, document.body)
    const popup = document.createElement("div")
    popup.classList.add("bias-popup")
    popup.textContent = "information"
    document.body.appendChild(popup)

    document.querySelectorAll(".highlight").forEach((el) => {
      el.addEventListener("mouseover", (event) => {
        // const popup = document.createElement("div")
        // popup.classList.add("bias-popup")
        // popup.textContent = "important material"
        // el.after(popup)
        const rect = el.getBoundingClientRect()
        popup.style.left = `${rect.right + window.scrollX + 10}px`
        popup.style.top = `${rect.top + window.scrollY}px`
        popup.style.display = "block"
        popup.innerHTML = biasedLanguageAnalysis[el.textContent]
        console.log("we appended important material")
      })
      el.addEventListener("mouseout", (event) => {
        popup.style.display = "none"
      })
    })
  } catch (error) {
    console.error("Failed to analyze article:", error)
  }
}

// Run the analysis
main()

export {}
