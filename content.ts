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
    const biasedLanguageAnalysis = await analyzeBiasedLanguage(markdownContent)
    console.log("Biased/Sensationalist Language Analysis:")
    for (const [phrase, explanation] of Object.entries(
      biasedLanguageAnalysis
    )) {
      console.log(`\n"${phrase}":`, explanation)
    }
    highlightPhrases(biasedLanguageAnalysis, document.body)
  } catch (error) {
    console.error("Failed to analyze article:", error)
  }
}

// Run the analysis
main()

export {}
