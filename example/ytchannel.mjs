import { ytJson } from "./lib/yt.mjs";
import { request } from "./lib/request.mjs";

function channelVideos(html) {
    const $ = ytJson(html);
    try {
        return $.contents.twoColumnBrowseResultsRenderer.tabs[1].tabRenderer.content.richGridRenderer.contents
            .map((c) => c.richItemRenderer?.content?.videoRenderer)
            .filter((c) => c)
            .map((v) => ({
                id: v.videoId,
                title: v.title.runs[0].text,
                description: v.descriptionSnippet.runs[0].text,
                at: v.publishedTimeText.simpleText,
                length: v.lengthText.simpleText,
                views: v.viewCountText.simpleText,
                viewsShort: v.shortViewCountText.simpleText,
                thumbnail: v.thumbnail.thumbnails.at(-1).url,
                url: `https://www.youtube.com/watch?v=${v.videoId}`,
            }));
    } catch (e) {
        console.log(e);
        return [];
    }
}

function channelToURL(channel) {
    if (channel.startsWith("@")) {
        return `https://www.youtube.com/${channel}`;
    } else {
        return `https://www.youtube.com/channel/${channel}`;
    }
}

const channel = "@HikakinTV";

const res = await request(`${channelToURL(channel)}/videos`);
const videos = channelVideos(res);

console.log(JSON.stringify(videos));
