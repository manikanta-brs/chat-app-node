const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const bodyParser = require("body-parser");
const port = process.env.PORT || 4001;

let chatHistory = []; // This array will store the chat history (for simulation purposes)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  var clientid = socket.username;
  socket.username = "Anonymous";

  socket.on("username", (res) => {
    socket.username = res.username;
  });

  socket.on("chat", (res) => {
    const newMessage = {
      response: res.txt,
      sender: socket.username,
      createdAt: new Date().getTime(),
    };

    // Store the message in chat history
    chatHistory.push(newMessage);

    // Emit the message to all clients
    io.emit("chat response", newMessage);
  });

  socket.on("fetchOldMessages", (data) => {
    const { lastTimestamp } = data;

    // Fetch messages older than the last timestamp
    const olderMessages = chatHistory
      .filter((msg) => msg.createdAt < lastTimestamp)
      .slice(-10); // Get the last 10 older messages

    // Send the older messages back to the client
    socket.emit("old messages response", olderMessages);
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
