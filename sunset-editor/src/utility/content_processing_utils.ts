import * as fs from "fs";
import * as path from "path";
import * as process from "process";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import * as cheerio from "cheerio";

hljs.addPlugin({
  "after:highlight": (result) => {
    result.value = split_html_at_balanced_line(result.value)
      .map((line) => `<div class="code-line">${line}</div>`)
      .join("\n");
    const $ = cheerio.load(result.value);
    result.value = $("body").html() ?? "";
  },
});

export function split_html_at_balanced_line(html_string: string) {
  return html_string.split("\n");
}

export async function get_markdown_object() {
  const marked = new Marked(
    markedHighlight({
      langPrefix: `hljs language-`,
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : "plaintext";
        return hljs.highlight(code, { language }).value;
      },
    })
  );

  return marked;
}

export async function transform_standalone(content: any) {
  const marked = await get_markdown_object();
  return (await marked.parse(content)).trim();
}

export async function read_contents(
  path: string,
  use_local_fs_fetch: boolean = false
): Promise<any> {
  let data_obj: any;

  if (use_local_fs_fetch) {
    let data: string | Buffer = fs.readFileSync(path);
    data_obj = JSON.parse(data.toString());
  } else {
    try {
      const response = await fetch(path);
      const data = await response.text();
      data_obj = JSON.parse(data);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return data_obj;
}

export function transform_file_contents(
  file_path: string,
  use_local_fs_fetch: boolean = false
) {
  const absolute_path_original = path.join(process.cwd(), file_path);
  const file_path_parts = path.parse(file_path);
  const precompiled_file_path = `${file_path_parts.name}.precompiled${file_path_parts.ext}`;
  const absolute_path_transformed = path.join(
    process.cwd(),
    file_path_parts.dir,
    precompiled_file_path
  );

  read_contents(absolute_path_original, use_local_fs_fetch).then(
    async (data_obj) => {
      const new_data_obj = await transform_standalone(data_obj);
      let original_data = JSON.stringify(data_obj, null, 2);
      let transformed_data = JSON.stringify(new_data_obj, null, 2);
      fs.writeFile(absolute_path_original, original_data, (_: any) => {});
      fs.writeFile(absolute_path_transformed, transformed_data, (_: any) => {});
    }
  );
}

export async function download_json_as_file(obj: any, file_name: string) {
  const data_str =
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
  const download_anchor_node = document.createElement("a");
  download_anchor_node.setAttribute("href", data_str);
  download_anchor_node.setAttribute("download", file_name + ".json");
  document.body.appendChild(download_anchor_node);
  download_anchor_node.click();
  download_anchor_node.remove();
}
