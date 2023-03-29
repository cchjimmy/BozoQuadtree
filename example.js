import BozoQuadtree from "./BozoQuadtree.js";

const qtree = new BozoQuadtree;
const canvas = document.querySelector('canvas');
canvas.width = 400;
canvas.height = 400;
const ctx = canvas.getContext('2d');
const fps = document.querySelector('span');
var last = 0;
const numberOfObjects = 10000;
var mouseBoundary = {
  x: 0,
  y: 0,
  w: 200,
  h: 200,
}

// walls
const thickness = 2;
const top = { x: canvas.width * 0.5, y: 0, w: canvas.width, h: thickness };
const left = { x: 0, y: canvas.height * 0.5, w: thickness, h: canvas.height - thickness };
const right = { x: canvas.width, y: canvas.height * 0.5, w: thickness, h: canvas.height - thickness };
const bottom = { x: canvas.width * 0.5, y: canvas.height, w: canvas.width, h: thickness };

init();
draw();

function init() {
  qtree.setBounds({
    x: canvas.width * 0.5,
    y: canvas.height * 0.5,
    w: canvas.width,
    h: canvas.height
  });

  for (let i = 0; i < numberOfObjects; i++) {
    qtree.insert({
      x: random(10, canvas.width - 10),
      y: random(10, canvas.height - 10),
      w: random(5, 10),
      h: random(5, 10),
      vx: random(-20, 20),
      vy: random(-20, 20),
    });
  }

  // mouse support
  document.addEventListener('mousemove', updateMouseBoundary);

  // touch support
  document.addEventListener('touchmove', updateMouseBoundary);

  function updateMouseBoundary(e) {
    let bcr = canvas.getBoundingClientRect();
    mouseBoundary.x = (e.clientX ?? e.touches[0].clientX) - bcr.x;
    mouseBoundary.y = (e.clientY ?? e.touches[0].clientY) - bcr.y;
  }
}

function draw() {
  let now = performance.now();
  let dt = (now - last) / 1000;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  qtree.update();

  let edges = [
    ...qtree.queryRange(top),
    ...qtree.queryRange(left),
    ...qtree.queryRange(right),
    ...qtree.queryRange(bottom)
  ];
  for (let i = 0; i < edges.length; i++) {
    let e = edges[i];
    if (e.x + e.w * 0.5 > canvas.width || e.x - e.w * 0.5 < 0) e.vx *= -1;
    if (e.y + e.h * 0.5 > canvas.height || e.y - e.h * 0.5 < 0) e.vy *= -1;
  }

  let all = qtree.array;
  for (let i = 0; i < all.length; i++) {
    all[i].x += all[i].vx * dt;
    all[i].y += all[i].vy * dt;
  }

  let inRange = qtree.queryRange(mouseBoundary);
  for (let i = 0; i < inRange.length; i++) {
    if ((inRange[i].y - mouseBoundary.y) ** 2 + (inRange[i].x - mouseBoundary.x) ** 2 <= (mouseBoundary.w * 0.5) ** 2) continue;
    inRange.splice(i, 1);
    i--;
  }
  strokeRectangles(inRange, ctx);
  
  fps.innerText = Math.round(1 / dt);
  last = now;
  requestAnimationFrame(draw);
}

function random(min, max) { return Math.random() * (max - min) + min };

function strokeRectangles(boundaries, ctx) {
  ctx.beginPath();
  for (let i = 0; i < boundaries.length; i++) {
    let b = boundaries[i];
    ctx.moveTo(b.x - b.w * 0.5, b.y - b.h * 0.5);
    ctx.lineTo(b.x + b.w * 0.5, b.y - b.h * 0.5);
    ctx.lineTo(b.x + b.w * 0.5, b.y + b.h * 0.5);
    ctx.lineTo(b.x - b.w * 0.5, b.y + b.h * 0.5);
    ctx.lineTo(b.x - b.w * 0.5, b.y - b.h * 0.5);
  }
  ctx.stroke();
}

function fillRectangle(boundary, color, ctx) {
  ctx.fillStyle = color;
  ctx.fillRect(boundary.x, boundary.y, boundary.w, boundary.h);
}

function randomColor() {
  return `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`;
}