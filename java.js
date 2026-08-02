emailjs.init({
  publicKey: "YOUR_PUBLIC_KEY"
});

const targetDate = new Date("September 08, 2026 20:00:00").getTime();

function countdown() {
  const now = new Date().getTime();
  const diff = targetDate - now;

  document.getElementById("days").innerText =
    Math.floor(diff / (1000 * 60 * 60 * 24));

  document.getElementById("hours").innerText =
    Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  document.getElementById("minutes").innerText =
    Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  document.getElementById("seconds").innerText =
    Math.floor((diff % (1000 * 60)) / 1000);
}

setInterval(countdown, 1000);
countdown();

function sendWish() {

  const message = document.getElementById("guestMessage").value;
  const status = document.getElementById("status");

  if (!message.trim()) {
    status.innerText = "Please write a message first";
    return;
  }

  status.innerText = "Sending...";

  emailjs.send(
    "YOUR_SERVICE_ID",
    "YOUR_TEMPLATE_ID",
    {
      message: message
    }
  )
  .then(() => {
    status.innerText = "Message sent ❤️";
    document.getElementById("guestMessage").value = "";
  })
  .catch(() => {
    status.innerText = "Failed to send";
  });

}

window.addEventListener("load", () => {

  setTimeout(() => {
    document.getElementById("intro").classList.add("hide");
  }, 1500);

  setTimeout(() => {
    document.getElementById("intro").style.display = "none";
    document.body.style.overflow = "auto";
  }, 3000);

});