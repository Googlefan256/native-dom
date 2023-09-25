import { toFastTree, type FastTree, text, html, walkTree } from "./fasttree";
import { toAst } from "./ast";
import { toTree } from "./tree";

export class Dom {
    #tree: FastTree;
    private constructor(tree: FastTree) {
        this.#tree = tree;
    }
    tag() {
        return this.#tree[0];
    }
    id() {
        return this.attr("id");
    }
    setId(id: string) {
        return this.setAttr("id", id);
    }
    class() {
        return this.attr("class")?.split(" ") ?? [];
    }
    setClass(className: string | string[]) {
        const classes = [];
        if (Array.isArray(className)) {
            classes.push(...className);
        } else {
            className.split(" ").forEach((c) => classes.push(c));
        }
        if (classes.length) {
            return this.setAttr("class", classes.join(" "));
        } else {
            return this.removeAttr("class");
        }
    }
    toggleClass(className: string | string[]) {
        const classes = [];
        if (Array.isArray(className)) {
            classes.push(...className);
        } else {
            className.split(" ").forEach((c) => classes.push(c));
        }
        const current = this.class();
        if (current.length) {
            for (const c of classes) {
                const i = current.indexOf(c);
                if (i === -1) {
                    current.push(c);
                } else {
                    current.splice(i, 1);
                }
            }
            return this.setClass(current);
        } else {
            return this.setClass(classes);
        }
    }
    attr(name: string) {
        return this.#tree[1].find((attr) => attr[0] === name)?.[1];
    }
    attrs() {
        return Object.fromEntries(this.#tree[1]);
    }
    removeAttr(name: string) {
        this.#tree[1] = this.#tree[1].filter((attr) => attr[0] !== name);
        return this;
    }
    setAttr(name: string, value: string) {
        const i = this.#tree[1].findIndex((attr) => attr[0] === name);
        if (i === -1) {
            this.#tree[1].push([name, value]);
        } else {
            this.#tree[1][i] = [name, value];
        }
        return this;
    }
    childrens() {
        return this.#tree[2].map((child) =>
            typeof child === "string" ? child : new Dom(child),
        );
    }
    childrenNodes() {
        const nodes = [];
        for (const child of this.#tree[2]) {
            if (typeof child !== "string") {
                nodes.push(new Dom(child));
            }
        }
        return nodes;
    }
    walk(walk: (tree: Dom, stack: Dom[]) => boolean) {
        return walkTree(this.#tree, (tree, stack) =>
            walk(
                new Dom(tree),
                stack.map((tree) => new Dom([tree[0], tree[1], tree[2]])),
            ),
        ).map((t) => new Dom(t));
    }
    text() {
        return text(this.#tree);
    }
    html() {
        return html(this.#tree, true);
    }
    json() {
        return JSON.stringify(toTree(this.#tree));
    }
    static dom(source: string) {
        return new Dom([undefined, [], toFastTree(toAst(source))]);
    }
    static create(tag: string, attrs: Record<string, string> = {}) {
        return new Dom([tag, Object.entries(attrs), []]);
    }
    append(child: Dom | string) {
        this.#tree[2].push(typeof child === "string" ? child : child.#tree);
        return this;
    }
}

const { dom, create } = Dom;
export { dom, create };
