import Anthropic from "@anthropic-ai/sdk"

import { extractArticleMarkdown } from "~lib/extract"
import { highlightPhrases } from "~lib/highlight"

// Export config so Plasmo knows on which pages to run this script.
export const config = {
  matches: ["<all_urls>"],
  run_at: "document_idle"
}

type OurResponse = {
  quoted_phrase: string
  bias_explanation: string
  rephrased_phrase: string
  prompt_question: string
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
): Promise<Array<OurResponse>> {
  const prompt = `
Article text:
${articleText}

Find words or phrases in this article which are biased or sensationalist
Give short explanation why the phrase is biased or sensationalist
Rewrite the word/phrase with synonym to be neutral without bias or sensationalism
Ask a short question prompting the user to do one of the following:
* consider if this would sound fair if applied to the other side
* consider what emotions this wording is meant to evoke
* consider whether the language frames one side as good or bad
* consider who benefits from this phrasing
* check if the claim is backed by evidence
* check if this phrase omits important context

{
  "name": "biased_phrases",
  "schema": {
    "type": "object",
    "properties": {
      "phrases": {
        "type": "array",
        "description": "A list of objects containing biased phrases and their analysis.",
        "items": {
          "type": "object",
          "properties": {
            "quoted_phrase": {
              "type": "string",
              "description": "The directly quoted phrase from the article text."
            },
            "bias_explanation": {
              "type": "string",
              "description": "An explanation of why the phrase is biased or sensationalist."
            },
            "rephrased_phrase": {
              "type": "string",
              "description": "A rephrasing or rewriting of the phrase to remove bias."
            },
            "prompt_question": {
              "type": "string",
              "description": "A question that prompts the user to ponder the biased phrase."
            }
          },
          "required": [
            "quoted_phrase",
            "bias_explanation",
            "rephrased_phrase",
            "prompt_question"
          ],
          "additionalProperties": false
        }
      }
    },
    "required": [
      "phrases"
    ],
    "additionalProperties": false
  },
  "strict": true
}

Please respond with only the JSON object with the provided schema, and no other text.`

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }]
    })

    // Parse the response as JSON
    return JSON.parse(message.content[0]["text"])["phrases"]
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
    console.log(biasedLanguageAnalysis)

    /*
    const biasedLanguageAnalysis = [
      {
        quoted_phrase:
          "Hamas claimed that they had been killed by an Israeli air strike early on in the ensuing war",
        bias_explanation:
          "The phrasing implies Hamas's claim is unverified, casting doubt without providing conclusive evidence about the fate of the Bibas family.",
        rephrased_phrase:
          "The status of the Bibas family remains unconfirmed, with conflicting claims about their survival",
        prompt_question:
          "What evidence exists to substantiate or refute Hamas's claim about the Bibas family?"
      },
      {
        quoted_phrase:
          "Lines of armed fighters kept crowds at bay, while the men who were released were flanked by more armed and masked fighters",
        bias_explanation:
          "The language creates a menacing image of Hamas, emphasizing militarization and intimidation during the prisoner exchange.",
        rephrased_phrase:
          "Security personnel managed the prisoner release process at the handover site",
        prompt_question:
          "Would this description sound equally dramatic if used to describe security procedures by another organization?"
      },
      {
        quoted_phrase:
          "A majority of the prisoners were held on what Israel calls 'administrative detention' - what critics say is imprisonment without charge",
        bias_explanation:
          "The phrase introduces a subjective criticism without providing balanced context about legal procedures.",
        rephrased_phrase:
          "A majority of Palestinian prisoners were held under administrative detention, a legal mechanism that allows detention without traditional criminal charges",
        prompt_question:
          "What specific legal standards and international laws govern administrative detention?"
      }
    ]
*/

    const strings: Record<string, string> = {}
    for (const languageAnalysis of biasedLanguageAnalysis) {
      strings[languageAnalysis.quoted_phrase] = "blah"
    }

    highlightPhrases(strings, document.body)
    const popup = document.createElement("div")
    popup.classList.add("bias-popup")
    const biasExplanation = document.createElement("div")
    popup.appendChild(biasExplanation)
    const rewritten = document.createElement("div")
    popup.appendChild(rewritten)
    const question = document.createElement("div")
    popup.appendChild(question)
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
        popup.style.opacity = "1"
        popup.style.zIndex = "100000000"
        const info = biasedLanguageAnalysis.find(
          (e) => e.quoted_phrase == el.textContent
        )
        biasExplanation.innerHTML =
          "<b>Potential bias:</b> " + info.bias_explanation
        rewritten.innerHTML = "<b>Alternative:</b> " + info.rephrased_phrase
        question.innerHTML = "<b>Food for thought:</b> " + info.prompt_question
        console.log("we appended important material")
      })
      el.addEventListener("mouseout", (event) => {
        popup.style.opacity = "0"
        popup.style.zIndex = "-9999"
      })
    })
  } catch (error) {
    console.error("Failed to analyze article:", error)
  }
}

// Run the analysis
main()

export {}
