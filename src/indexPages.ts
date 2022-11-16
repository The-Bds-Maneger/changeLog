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

export async function listArticles() {
  const baseUrl = "https://feedback.minecraft.net";
  let nextPage = baseUrl+"/hc/en-us/sections/360001186971?page=0";
  const dataLog: {link: string, title: string}[] = [];
  while (true) {
    if (!nextPage) break;
    const {document} = (new JSDOM(await httpRequest.bufferFetch({url: nextPage, headers}).then(({data}) => data.toString("utf8")))).window;
    for (const li of Array.from(document.querySelectorAll("ul[class=\"article-list\"] > li")||[])) {
      let link = li.querySelector("a");
      if (!link) continue;
      dataLog.push({
        link: link.href.startsWith("/")?baseUrl+link.href:link.href,
        title: link.innerHTML,
      });
    }
    let nextPageQuery = document.querySelector("li[class=\"pagination-next\"] > a")["href"];
    if (!nextPageQuery) nextPage = undefined
    else {
      if (nextPageQuery.startsWith("/")) nextPageQuery = baseUrl+nextPageQuery;
      nextPage = nextPageQuery;
    }
  }
  return dataLog;
}

export async function listContent() {
  const data = await listArticles();
  const pages: {title: string, body: string}[] = []
  for (const art of data) {
    const {document} = (new JSDOM(await httpRequest.bufferFetch({url: art.link, headers}).then(({data}) => data.toString("utf8")))).window;
    const docBody = document.querySelector("div[class=\"article-body\"]");
    if (!docBody) continue;
    pages.push({
      title: art.title,
      body: docBody["innerText"]||docBody.innerHTML
    });
  }
  return pages;
}

listContent().then(console.log);
