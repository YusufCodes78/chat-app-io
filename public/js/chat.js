// /public/js/chat.js
const socket = io();

// Selectors
const $form = document.getElementById("form");
const $formInput = $form.querySelector("input");
const $formButton = $form.querySelector("button");
const $sendLocationButton = document.getElementById("send-location");
const $messages = document.getElementById("messages-div");
const $room = document.getElementById("room");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const adminTemplate = document.querySelector("#admin-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const roomTemplate = document.querySelector("#room-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin + 70;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("adminMessage", (message) => {
  console.log(message);
  const html = Mustache.render(adminTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (message) => {
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({room, users}) => {
  const html = Mustache.render(roomTemplate, {
    room,
    users
  });
  $room.innerHTML = html;
});

$form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.target.elements.message.value;
  $formButton.setAttribute("disabled", "disabled");
  socket.emit("sendMessage", message, () => {
    $formButton.removeAttribute("disabled");
    $formInput.value = "";
    $formInput.focus();
    console.log("Message sent!");
  });
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    console.log("Geolocation is not supported by your browser");
    return;
  }
  $sendLocationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location shared!");
      }
    );
  });
});

socket.emit("join", { username, room }, (error)=>{
    if(error){
        alert(error);
        location.href = '/';
    }
});
