import express, { Response, Request } from "express";
import path from "path";
import { socketStart } from "./sockets";

import { setLogoRoute } from "./routes/grabLogos";
import { readConfig } from "./config";
import { OpenStreamerSongListPage } from "./browser";

let conf = readConfig();

const app = express();
const port = conf.port || 8080; // default port to listen

let currentSongsList: { [key: string]: {} } = {};
let lastCurrentSongsList = {};

// Configure Express to use EJS
app.set("views", path.join(__dirname, "../", "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../", "public")));

var http = require("http")
  .createServer(app)
  .listen(port, function () {
    console.log("Express server listening on port " + port);
  });

// define a route handler for the default home page
app.get("/", async (req: Request, res: Response) => {
  const streamer = req.query.streamer || conf.streamer;
  const maxSongList = Number(req.query.maxSongList);
  let songList: any = currentSongsList[streamer];

  if (!songList) {
    songList = await OpenStreamerSongListPage(streamer);
  }

  if (!app.locals.currentSongsList) app.locals.currentSongsList = {};

  songList = songList[streamer] || songList;

  const newList: any = {};

  if (maxSongList && typeof maxSongList === "number") {
    const keys = Object.keys(songList);

    keys.map((key, i) => {
      const doc = songList[key];
      if (i < maxSongList) newList[key] = doc;
    });
  }

  // app.locals.currentSongsList[streamer] = songList;
  res.render("index", {
    currentSongsList: Object.keys(newList).length > 0 ? newList : songList,
    room: streamer,
  });
});

const io = socketStart(http);

setLogoRoute(app);

export function setSongList(list: {}, streamer: string) {
  currentSongsList[streamer] = list;

  io.of("/").to(streamer).emit("list", list);
}

export function grabApp() {
  return app;
}
