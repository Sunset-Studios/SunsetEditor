import { get_editor_state } from "./editor_state";

import MistralClient from "@mistralai/mistralai";
import OpenAI from "openai";

const general_system_prompt = `
You are a helpful assitant built in to a novel, expressive notepad that can render Markdown and HTML.
Given the user input prompt, follow these rules:
1. Create clean, organized outputs where relevant. Make headings, links, images, tables and other formatted document elements using Markdown and HTML in order to organize the output.
2. Do not generate additional footer text.

# Input Prompt:
{INPUT_PROMPT}
`;

export async function get_llm_response(
  input: string,
  cb: (chunk: string) => void
) {
  const { editor_state } = get_editor_state();

  
  if (editor_state.value.chosen_llm === "mistral") {
    input = general_system_prompt.replace("{INPUT_PROMPT}", input);
    const chat_stream_response =
      (await editor_state.value.mistral_client.chatStream({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: input }],
      })) as unknown as AsyncIterableIterator<any>;

    for await (const chunk of chat_stream_response) {
      if (chunk.choices[0].delta.content !== undefined) {
        cb(chunk.choices[0].delta.content);
      }
    }
  } else if (editor_state.value.chosen_llm === "openai") {
    const system = general_system_prompt.replace("{INPUT_PROMPT}", "").replace("# Input Prompt", "");
    const stream = (await editor_state.value.oai_client.chat.completions.create(
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: system },
          { role: "user", content: input }
        ],
        stream: true,
      }
    )) as unknown as AsyncIterableIterator<any>;
    for await (const chunk of stream) {
      cb(chunk.choices[0]?.delta?.content || "");
    }
  }
}

export function connect_llms() {
  const { editor_state } = get_editor_state();
  if (editor_state.value.mistral_key) {
    editor_state.value.mistral_client = new MistralClient(
      editor_state.value.mistral_key
    );
    editor_state.value.llm_connected = true;
  }
  if (editor_state.value.oai_key) {
    editor_state.value.oai_client = new OpenAI({
      apiKey: editor_state.value.oai_key,
      dangerouslyAllowBrowser: true // TODO: Remove at some point, unless we want to let others specify their own API keys?
    });
    editor_state.value.llm_connected = true;
  }
}
