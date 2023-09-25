import { FastTree, type FastTreeChildren } from "./fasttree";

export type Tree = {
    tag?: string;
    attr: TreeAttr;
    children: TreeChildren;
};

export type TreeAttr = Record<string, string | undefined>;

export type TreeChildren = (Tree | string)[];

export function toTree(node: FastTree): Tree {
    return {
        tag: node[0],
        attr: node[1].reduce((acc, [name, value]) => {
            acc[name] = value;
            return acc;
        }, {} as TreeAttr),
        children: toChildrenTree(node[2]),
    };
}

function toChildrenTree(node: FastTreeChildren) {
    return node.map((node) => (typeof node === "string" ? node : toTree(node)));
}
