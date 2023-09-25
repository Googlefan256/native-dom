import { isWhitespace, trim, unescape } from "./util";

export const astTypeMap = {
    content: 0,
    tagStart: 1,
    tagSelfClosing: 2,
    tagEnd: 3,
} as const;

export type Ast =
    | [typeof astTypeMap.content, string]
    | [
          typeof astTypeMap.tagStart | typeof astTypeMap.tagSelfClosing,
          string | undefined,
          [string, string | undefined][],
      ]
    | [typeof astTypeMap.tagEnd, string | undefined];

function parseAstAttr(
    type:
        | typeof astTypeMap.tagStart
        | typeof astTypeMap.tagSelfClosing
        | typeof astTypeMap.tagEnd,
    content: string,
): Ast {
    let tag = "";
    while (!isWhitespace(content.charAt(0)) && content.length) {
        tag += content.charAt(0);
        content = content.slice(1);
    }
    if (type === astTypeMap.tagEnd) {
        return [type, tag.length ? tag : undefined];
    }
    content = trim(content);
    const attrs: [string, string | undefined][] = [];
    while (content.length) {
        let key = "";
        while (
            !isWhitespace(content.charAt(0)) &&
            content.charAt(0) !== "=" &&
            content.length
        ) {
            key += content.charAt(0);
            content = content.slice(1);
        }
        content = trim(content);
        if (content.charAt(0) === "=") {
            content = content.slice(1);
            content = trim(content);
            let value = "";
            if (content.charAt(0) === '"') {
                content = content.slice(1);
                while (content.charAt(0) !== '"' && content.length) {
                    value += content.charAt(0);
                    content = content.slice(1);
                }
                if (content.charAt(0) === '"') {
                    content = content.slice(1);
                } else {
                    throw new Error("Invalid HTML");
                }
            } else {
                while (!isWhitespace(content.charAt(0)) && content.length) {
                    value += content.charAt(0);
                    content = content.slice(1);
                }
            }
            attrs.push([key, value]);
        } else {
            attrs.push([key, undefined]);
        }
        content = trim(content);
    }
    return [type, tag.length ? unescape(tag) : undefined, attrs];
}

export function toAst(str: string) {
    const ast: Ast[] = [];
    while (str.length) {
        if (str.charAt(0) === "<") {
            str = str.slice(1);
            let type: Ast[0] = astTypeMap.tagStart;
            if (str.charAt(0) === "/") {
                str = str.slice(1);
                type = astTypeMap.tagEnd;
            }
            let content = "";
            while (str.charAt(0) !== ">" && str.length) {
                content += str.charAt(0);
                str = str.slice(1);
            }
            if (str.charAt(0) === ">") {
                str = str.slice(1);
            } else {
                throw new Error("Invalid HTML");
            }
            content = trim(content);
            if (content.charAt(content.length - 1) === "/") {
                content = content.slice(0, -1);
                type = astTypeMap.tagSelfClosing;
                content = trim(content);
            }
            ast.push(parseAstAttr(type, content));
        } else {
            let content = "";
            while (str.charAt(0) !== "<" && str.length) {
                content += str.charAt(0);
                str = str.slice(1);
            }
            content = trim(content);
            if (!content.length) {
                continue;
            }
            ast.push([astTypeMap.content, content]);
        }
    }
    return ast;
}
