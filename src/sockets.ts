import * as socketio from "socket.io";

export function socketStart(http: socketio.Server) {
  let io = require("socket.io")(http);

  io.on("connection", function (socket: any) {
    console.log("a user connected");
  });

  return io;
}
