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
): Promise<any> {
  const prompt = `
Article text:
${articleText}

Find 10-20 words or short phrases in this article which are biased
  for example using "hostages" and "prisoners" to refer to similar groups
Give a short explanation why each word/phrase is biased
Rewrite the word/phrase to be neutral without bias
Ask a short question prompting the user to do one of the following:
* consider if this would sound fair if applied to the other side
* consider what emotions this wording is meant to evoke
* consider whether the language frames one side as good or bad
* consider who benefits from this phrasing
* check if the claim is backed by evidence
* check if this phrase omits important context

Use the title of the article to get a small set of keywords i can use to search for similar articles about the same story from other news sources.
Generate a url of this format
https://news.google.com/search?q=[story keywords]

{
  "name": "biased_phrases",
  "schema": {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "The Google News URL suggesting other articles to discover"
      },
      "stance": {
        "type": "string",
        "description": "In the context of the article, give a concise sentence describing the historical position the news source normally takes on the topic."
      },
      "phrases": {
        "type": "array",
        "description": "A list of objects containing biased phrases and their analysis.",
        "items": {
          "type": "object",
          "properties": {
            "quoted_phrase": {
              "type": "string",
              "description": "The verbatim directly quoted word/phrase from the article text. Include text case and exact characters used."
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
      "phrases",
      "stance",
      "url"
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
    const loadingContainer = document.createElement("div");
    loadingContainer.classList.add("loading-container");

    const loadingLogo = document.createElement("img");
    loadingLogo.src = 'https://cdn-icons-png.flaticon.com/128/9554/9554972.png';
    loadingLogo.style.width = "20px";
    loadingLogo.style.height = "20px";
    loadingContainer.appendChild(loadingLogo);

    const loadingText = document.createElement("div");
    loadingText.innerText = "BiasShield loading report...";
    loadingContainer.appendChild(loadingText);

    document.body.appendChild(loadingContainer);

    const response = await analyzeBiasedLanguage(markdownContent)

    const url = response["url"]
    const stance = response["stance"]
    loadingText.innerHTML = `${stance}<br><br><a style="text-decoration: underline" href="${url}" target="_blank">Read alternative perspectives</a>`

    const biasedLanguageAnalysis = response["phrases"]
    console.log(biasedLanguageAnalysis)

    const strings: Record<string, string> = {}
    for (const languageAnalysis of biasedLanguageAnalysis) {
      strings[languageAnalysis.quoted_phrase] = "blah"
    }

    highlightPhrases(strings, document.body)
    const popup = document.createElement("div")
    popup.classList.add("bias-popup")
    const logo = document.createElement("img");
    logo.src = 'https://cdn-icons-png.flaticon.com/128/9554/9554972.png';
    logo.style.width = "20px";
    logo.style.height = "20px";
    popup.appendChild(logo);
    const biasExplanation = document.createElement("div")
    popup.appendChild(biasExplanation)
    const rewritten = document.createElement("div")
    popup.appendChild(rewritten)
    const question = document.createElement("div")
    popup.appendChild(question)
    document.body.appendChild(popup)

    document.querySelectorAll(".highlight").forEach((el) => {
      el.addEventListener("mouseover", (event) => {
        const rect = el.getBoundingClientRect()
        popup.style.left = `${rect.right + window.scrollX + 10}px`
        popup.style.top = `${rect.top + window.scrollY}px`
        popup.style.opacity = "1"
        popup.style.zIndex = "100000000"
        const info = biasedLanguageAnalysis.find(
          (e) => e.quoted_phrase == el.textContent
        )
        biasExplanation.innerHTML =
          "<b style='font-weight: 700 !important;'>Potential bias:</b> " + info.bias_explanation
        rewritten.innerHTML = "<b style='font-weight: 700 !important;'>Alternative perspective:</b> " + info.rephrased_phrase
        question.innerHTML = "<b style='font-weight: 700 !important;'>Food for thought:</b> " + info.prompt_question
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
