import { get as HttpsRequest } from "node:https";
import { get as HttpRequest } from "node:http";

export function request(url, count = 5) {
    if (count == 0) {
        throw new Error("Too many redirects");
    }
    const requestFn = url.startsWith("https") ? HttpsRequest : HttpRequest;
    return new Promise((resolve, reject) => {
        const req = requestFn(url, (res) => {
            if (
                res.statusCode == 301 ||
                res.statusCode == 302 ||
                res.statusCode == 303
            ) {
                return resolve(request(res.headers.location, count - 1));
            }
            res.setEncoding("utf-8");
            let data = "";
            res.on("data", (chunk) => (data = data + chunk));
            res.once("error", reject);
            res.once("end", () => resolve(data));
        });
        req.once("error", reject);
        req.end();
    });
}
