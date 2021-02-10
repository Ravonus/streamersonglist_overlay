import puppeteer from "puppeteer";
import { Page } from "puppeteer/lib/cjs/puppeteer/common/Page";
import { Browser } from "puppeteer/lib/cjs/puppeteer/common/Browser";
import { setSongList } from "./express";
import { search } from "./lastfm";
import { readConfig } from "./config";
import { grabLogo, setLogo } from "./logoStore";
import { getLogo } from "./twitch";

const conf = readConfig();
let browser: Browser;

const streamers: { [key: string]: Page } = {};

const songHeaders = [
  "Position",
  "Title",
  "Artist",
  "",
  "Amount",
  "Requested By",
];

let currentSongs: { [key: string]: any } = {};

const chromeOptions: any = {
  headless: true,
  defaultViewport: null,
  args: ["--no-sandbox", "--no-zygote"],
};

function watchForUpdate(page: Page, streamer: string) {
  page.on("request", async (request) => {
    setTimeout(async () => {
      currentSongs[streamer] = await grabTable(page, songHeaders, streamer);
    }, 500);
  });
}

async function watchForResponse(page: Page) {
  page.on("response", (response) => {
    const status = response.status();
    if (status >= 300 && status <= 399) {
      page.close();
    }
  });
}

async function grabTable(page: Page, songHeaders: string[], streamer: string) {
  if (!currentSongs[streamer]) currentSongs[streamer] = {};

  let list = await page
    .evaluate(
      (songHeaders: any, currentSongs: any) => {
        const table = document.querySelectorAll("mat-table mat-row");

        table.forEach((row, i: number) => {
          currentSongs[i] = {};

          const cells = row.querySelectorAll("mat-cell");
          cells.forEach((cell: any, i2: number) => {
            if (i2 === 3) return;
            let value = cell.innerText;
            currentSongs[i][songHeaders[i2]] = value;

            if (i2 === 5) {
              let inactive = cell.querySelector("span").classList.toString();
              if (inactive.includes("inactive"))
                currentSongs[i].inactive = true;
            }
          });
        });
        return currentSongs;
      },
      songHeaders,
      currentSongs[streamer]
    )
    .catch((e) => {});

  if (!list || !streamer) return;

  setSongList(list, streamer);

  const keys = Object.keys(list);

  keys.map(async (key) => {
    const doc = list[key];
    const username = doc["Requested By"];
    if (!username) return;
    if (!doc.logo) {
      let logo: any = grabLogo(username);
      if (!logo) {
        logo = await getLogo(username);
        setLogo(username, logo);
      }
    }
  });
  currentSongs[streamer] = list;
  return list;
}

export async function OpenStreamerSongListPage(streamer: string) {
  if (!browser) return;
  const page = await browser.newPage();
  watchForResponse(page);
  // page.on("console", (log: any) => console.log(log._text));

  await page
    .goto(`https://www.streamersonglist.com/t/${streamer}/queue`, {
      waitUntil: "networkidle0",
    })
    .catch((e) => {});

  await page.waitForSelector("mat-table").catch((e) => {});

  await grabTable(page, songHeaders, streamer);

  watchForUpdate(page, streamer);

  streamers[streamer] = page;

  return currentSongs;
}

export function streamerPage(streamer: string) {}

(async () => {
  browser = await puppeteer.launch(chromeOptions);
  await OpenStreamerSongListPage(conf.streamer || "emilymcvicker");
})();
