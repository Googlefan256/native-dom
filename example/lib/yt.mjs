import { dom } from "../../dist/index.mjs";

export function ytJson(html) {
    const $ = dom(html);
    const content = $.walk(
        (node) =>
            node.tag() == "script" && node.text().includes("ytInitialData"),
    )[0].text();
    const json = JSON.parse(
        content.substring("var ytInitialData = ".length, content.length - 1),
    );
    return json;
}
