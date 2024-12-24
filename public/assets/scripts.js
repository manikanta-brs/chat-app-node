const url = "";
const socket = io.connect(url);
const chat = [];

// Disable the message input and send button until username is set
document.getElementById("txt").disabled = true;
document.getElementById("sendMessage").disabled = true;

// Handle username setting
document.getElementById("setUsername").addEventListener("click", () => {
  let usernameInput = document.getElementById("username");
  let username = usernameInput.value.trim();

  if (username) {
    socket.emit("username", { username });
    alert(username + " is your current username!");
    document.getElementById("user-info").style.visibility = "hidden";

    // Enable the message input and send button
    document.getElementById("txt").disabled = false;
    document.getElementById("sendMessage").disabled = false;
  } else {
    let confirmAnonymous = confirm(
      "You haven't entered a username. Do you want to continue as Anonymous?"
    );
    if (confirmAnonymous) {
      socket.emit("username", { username: "Anonymous" });
      alert("You are now chatting as Anonymous.");
      document.getElementById("user-info").style.visibility = "hidden";

      // Enable the message input and send button
      document.getElementById("txt").disabled = false;
      document.getElementById("sendMessage").disabled = false;
    } else {
      alert("Please enter your username to proceed.");
    }
  }
});

// Event listener for sending messages
document.getElementById("sendMessage").addEventListener("click", (e) => {
  e.preventDefault();
  let messageInput = document.getElementById("txt");
  let message = messageInput.value.trim();

  if (message) {
    socket.emit("chat", { txt: message });
    messageInput.value = ""; // Clear the message input after sending
  } else {
    alert("Please enter a message before sending.");
  }
});

// Socket listener for incoming chat responses
socket.on("chat response", (res) => {
  // Prevent automatically loading unwanted messages
  if (!res || !res.response || !res.sender) {
    return; // Skip if the response doesn't have the necessary data
  }

  // Append the new message to the message container
  const messageContainer = document.getElementById("messages");
  const newMessage = document.createElement("li");

  // Check if the message is from a valid user (not automated/system)
  if (res.sender !== "System" && res.response) {
    newMessage.innerHTML = `<span><b>${res.sender}:</b> ${moment(
      res.createdAt
    ).format("h:mm a")}</span><br/>${res.response}`;
    messageContainer.appendChild(newMessage);
  }

  // Ensure the message box scrolls to the bottom when a new message is added
  scrollBottom();
});

// Handle scroll event to load old messages
document.getElementById("messages").addEventListener("scroll", () => {
  const messageBox = document.getElementById("messages");

  // Check if we're at the top of the message box
  if (messageBox.scrollTop === 0 && !loadingOldMessages) {
    // Trigger loading of old messages
    loadOldMessages();
  }
});

let loadingOldMessages = false; // Flag to prevent loading old messages multiple times
let lastMessageTimestamp = 0; // Track the last message's timestamp or ID to prevent re-fetching

// Function to load old messages (only if needed)
function loadOldMessages() {
  if (loadingOldMessages) return; // Avoid fetching older messages multiple times

  loadingOldMessages = true; // Set flag to true while loading

  const messageContainer = document.getElementById("messages");
  const loadingMessage = document.createElement("li");
  loadingMessage.textContent = "Loading older messages...";
  messageContainer.insertBefore(loadingMessage, messageContainer.firstChild);

  // Simulate a delay for loading older messages
  setTimeout(() => {
    // Fetch old messages from the server based on the last message's timestamp or ID
    socket.emit("fetchOldMessages", { lastTimestamp: lastMessageTimestamp });

    // Remove the loading message and reset the flag
    messageContainer.removeChild(loadingMessage);
    loadingOldMessages = false; // Reset the flag after loading
  }, 1500); // Simulated delay for loading older messages
}

// Socket listener for fetching old messages
socket.on("old messages response", (messages) => {
  const messageContainer = document.getElementById("messages");

  // Append the older messages to the message container
  messages.forEach((msg) => {
    const newMessage = document.createElement("li");
    newMessage.innerHTML = `<span><b>${msg.sender}:</b> ${moment(
      msg.createdAt
    ).format("h:mm a")}</span><br/>${msg.response}`;
    messageContainer.insertBefore(newMessage, messageContainer.firstChild);
  });

  // Update lastMessageTimestamp after loading older messages
  if (messages.length > 0) {
    lastMessageTimestamp = messages[messages.length - 1].createdAt;
  }

  // Ensure the message box scrolls to the bottom when a new message is added
  scrollBottom();
});

// Function to scroll the chat to the bottom
function scrollBottom() {
  const messageContainer = document.getElementById("messages");
  messageContainer.scrollTop = messageContainer.scrollHeight;
}
