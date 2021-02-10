import * as socketio from "socket.io";

export function socketStart(http: socketio.Server) {
  let io = require("socket.io")(http);

  io.on("connection", function (socket: any) {
    socket.on("join", (room: string) => {
      socket.join(room);
    });
  });

  return io;
}
