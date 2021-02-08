import express, { Response, Request } from "express";
import path from "path";
import { socketStart } from "./sockets";
import { setLogoRoute } from "./routes/grabLogos";

const app = express();
const port = 8080; // default port to listen

let currentSongsList = {};
let lastCurrentSongsList = {};

// Configure Express to use EJS
app.set("views", path.join(__dirname, "../", "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../", "public")));

var http = require("http")
  .createServer(app)
  .listen(port, function () {
    console.log("Express server listening on port " + app.get("port"));
  });

// define a route handler for the default home page
app.get("/", (req: Request, res: Response) => {
  // render the index template
  app.locals.currentSongsList = currentSongsList;
  res.render("index", { currentSongsList });
});

const io = socketStart(http);

setLogoRoute(app);

export function setSongList(list: {}) {
  lastCurrentSongsList = currentSongsList;
  currentSongsList = list;

  io.of("/").emit("list", currentSongsList);
}

export function grabApp() {
  return app;
}
