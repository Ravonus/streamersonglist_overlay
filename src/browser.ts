import puppeteer from "puppeteer";
import { Page } from "puppeteer/lib/cjs/puppeteer/common/Page";
import { setSongList } from "./express";
import { search } from "./lastfm";
import { readConfig } from "./config";
import { grabLogo, setLogo } from "./logoStore";
import { getLogo } from "./twitch";

const conf = readConfig();

const songHeaders = [
  "Position",
  "Title",
  "Artist",
  "",
  "Amount",
  "Requested By",
];

let currentSongs: any = {};

const chromeOptions: any = {
  headless: true,
  defaultViewport: null,
  args: ["--no-sandbox", "--no-zygote"],
};

function watchForUpdate(page: Page) {
  page.on("request", async (request) => {
    setTimeout(async () => {
      currentSongs = await grabTable(page, songHeaders, currentSongs);
    }, 500);
  });
}

async function grabTable(page: Page, songHeaders: string[], currentSongs: {}) {
  currentSongs = {};
  let list = await page.evaluate(
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
            if (inactive.includes("inactive")) currentSongs[i].inactive = true;
          }
        });
      });
      return currentSongs;
    },
    songHeaders,
    currentSongs
  );

  setSongList(list);

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

  //     const lookup: any = await search(`${doc.Artist} ${doc.Title}`);

  //     if (lookup && lookup.result) {
  //       console.log("HERE");

  //       lookup.result.map((track: any) => {
  //         console.log(track);
  //         if (track.images) doc.image = track.images[0];
  //       });
  //     }
  //     return doc;
  //   });

  return list;
}

(async () => {
  const browser = await puppeteer.launch(chromeOptions);
  const page = await browser.newPage();
  page.on("console", (log: any) => console.log(log._text));

  await page.goto(
    `https://www.streamersonglist.com/t/${
      conf.streamer || "emilymcvicker"
    }/queue`,
    {
      waitUntil: "networkidle0",
    }
  );

  await page.waitForSelector("mat-table");

  currentSongs = await grabTable(page, songHeaders, currentSongs);

  watchForUpdate(page);
})();
