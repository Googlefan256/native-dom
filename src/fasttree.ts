import { type Ast, astTypeMap } from "./ast";
import { escape } from "./util";

export type FastTree = [
    string | undefined, // tag
    FastTreeAttr[], // attributes
    FastTreeChildren, // children
];

export type FastTreeAttr = [
    string, // name
    string | undefined, // value
];

export type FastTreeChildren = (FastTree | string)[];

export function toFastTree(ast: Ast[]) {
    const stack: FastTreeChildren = [];
    while (ast.length) {
        const node = ast.shift()!;
        if (node[0] === astTypeMap.tagStart) {
            const astUntilEnd = [];
            while (ast.length) {
                const childNode = ast.shift()!;
                if (
                    childNode[0] === astTypeMap.tagEnd &&
                    node[1] === childNode[1]
                ) {
                    break;
                }
                astUntilEnd.push(childNode);
            }
            stack.push([node[1], node[2], toFastTree(astUntilEnd)]);
        } else if (node[0] === astTypeMap.tagSelfClosing) {
            stack.push([node[1], node[2], []]);
        } else if (node[0] === astTypeMap.tagEnd) {
            // process as tagSelfClosing
            stack.push([node[1], [], []]);
        } else if (node[0] === astTypeMap.content) {
            stack.push(node[1]);
        }
    }
    return stack;
}

export function walkTree(
    tree: FastTree,
    walk: (tree: FastTree, stack: FastTree[]) => boolean,
    stack: FastTree[] = [],
) {
    const list: FastTree[] = [];
    if (walk(tree, stack)) {
        list.push(tree);
    }
    for (const child of tree[2]) {
        if (typeof child !== "string") {
            list.push(
                ...walkTree(child, walk, [
                    ...stack,
                    [tree[0], tree[1], tree[2]],
                ]),
            );
        }
    }
    return list;
}

function attrHtml(attr: FastTreeAttr[]) {
    let all = "";
    for (const [name, value] of attr) {
        all += name;
        if (value) {
            all += `="${value}"`;
        }
        all += " ";
    }
    return all.trim();
}

export function html(tree: FastTree, root?: boolean) {
    let all = "";
    const hasChild = tree[2].length > 0;
    const tag = escape(tree[0] ?? "");
    if (!root || tag.length) {
        all +=
            "<" +
            tag +
            (tree[1].length ? " " + escape(attrHtml(tree[1]), true) : "");
        if (!hasChild) {
            all += "/";
        }
        all += `>`;
    }
    for (const child of tree[2]) {
        if (typeof child === "string") {
            all += escape(child);
        } else {
            all += html(child);
        }
    }
    if (hasChild) {
        if (!root || tag.length) {
            all += "</" + escape(tag) + ">";
        }
    }
    return all;
}

export function text(tree: FastTree) {
    let all = "";
    for (const child of tree[2]) {
        if (typeof child === "string") {
            all += child;
        } else {
            if (child[0] !== "script" && child[0] !== "style") {
                all += text(child);
            }
        }
    }
    return all;
}
