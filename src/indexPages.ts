import { httpRequest } from "@the-bds-maneger/core-utils";
import { JSDOM } from "jsdom";

export const headers = {
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Connection": "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Pragma": "no-cache",
  "Cache-Control": "no-cache"
};

export async function find() {
  let page = 0;
  const dataLog = [];
  while (true) {
    const data = await httpRequest.bufferFetch({
      url: `https://feedback.minecraft.net/hc/en-us/sections/360001186971?page=${page}`,
      headers
    }).then(({data}) => data.toString("utf8"));
    page++
    //console.log(data);
    const dom = new JSDOM(data);
    const dd = Array.from(dom.window.document.querySelectorAll("ul[class=\"article-list\"] > li")||[]);
    dd.forEach(li => {
      let link = li.querySelector("a").href;
      if (link.startsWith("/")) link = "https://feedback.minecraft.net"+link;
      dataLog.push({
        link,
        body: li.querySelector("a").innerHTML,
      });
    });
    if (page >= 5) break;
  }
  return dataLog;
}
find().then(console.log);
