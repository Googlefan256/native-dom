export function trim(str: string) {
    return str.replace(/^\s+|\s+$/g, "");
}

export function isWhitespace(str: string) {
    return str === " " || str === "\n" || str === "\t" || str === "\r";
}

export function escape(str: string, attr?: boolean) {
    if (attr) {
        str = str.replace(/"/g, '"');
    } else {
        str = str.replace(/"/g, "&quot;");
    }
    return str
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/'/g, "&#39;");
}

export function unescape(str: string) {
    return str
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#39;/g, "'")
        .replace(/&quote;/g, '"');
}
