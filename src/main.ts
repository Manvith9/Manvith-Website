import "./main.css";
import WebGL from "./webgl";

WebGL();

const root = document.documentElement;

function onScroll() {
  if (window.scrollY > 10) root.dataset.scroll = "true";
  else root.dataset.scroll = "false";
}
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });
// Retro cursor for the reading/content section
const cursor = document.createElement("div");
cursor.className = "retro-cursor";
document.body.appendChild(cursor);

const cursorGlow = document.createElement("div");
cursorGlow.className = "retro-cursor-glow";
document.body.appendChild(cursorGlow);

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let glowX = mouseX;
let glowY = mouseY;

window.addEventListener(
  "pointermove",
  (event) => {
    if (event.pointerType !== "mouse") return;

    mouseX = event.clientX;
    mouseY = event.clientY;

    cursor.style.transform =
      `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  },
  { passive: true }
);

function animateCursor() {
  glowX += (mouseX - glowX) * 0.12;
  glowY += (mouseY - glowY) * 0.12;

  cursorGlow.style.transform =
    `translate3d(${glowX}px, ${glowY}px, 0)`;

  requestAnimationFrame(animateCursor);
}

animateCursor();
