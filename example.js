import BozoQuadtree from "./BozoQuadtree.js";

const qtree = new BozoQuadtree;
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 400;
const ctx = canvas.getContext('2d');
const fps = document.querySelector('span');
var last = 0;
const numberOfObjects = 5000;
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
  document.body.appendChild(canvas);

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
      vy: random(-20, 20)
    });
  }

  // mouse support
  document.addEventListener('mousemove', changeMouseBoundary);

  // touch support
  document.addEventListener('touchmove', changeMouseBoundary);

  function changeMouseBoundary(e) {
    let bcr = canvas.getBoundingClientRect();
    mouseBoundary.x = (e.clientX ?? e.touches[0].clientX) - bcr.x;
    mouseBoundary.y = (e.clientY ?? e.touches[0].clientY) - bcr.y;
  }
}

function draw() {
  let now = performance.now();
  let dt = (now - last) / 1000;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ctx.strokeStyle = 'lightgrey';
  // drawQuadtree(qtree)

  // ctx.strokeStyle='green';
  let edges = [
    ...qtree.queryRange(top),
    ...qtree.queryRange(left),
    ...qtree.queryRange(right),
    ...qtree.queryRange(bottom)
  ];
  for (let i = 0; i < edges.length; i++) {
    let e = edges[i].object;
    // strokeRectangle(e);
    if (e.x + e.w * 0.5 > canvas.width || e.x - e.w * 0.5 < 0) e.vx *= -1;
    if (e.y + e.h * 0.5 > canvas.height || e.y - e.h * 0.5 < 0) e.vy *= -1;
  }

  let all = qtree.array();
  for (let i = 0; i < all.length; i++) {
    let e = all[i].object;
    e.x += e.vx * dt;
    e.y += e.vy * dt;

    // ctx.strokeStyle='black';
    // strokeRectangle(e);

    // ctx.strokeStyle='red';
    // strokeRectangle(all[i].tree.boundary);
    qtree.relocate(all[i]);
  }

  // ctx.strokeStyle = 'red';
  let inRange = qtree.queryRange(mouseBoundary);
  for (let i = 0; i < inRange.length; i++) {
    let e = inRange[i].object;
    if ((e.y - mouseBoundary.y) ** 2 + (e.x - mouseBoundary.x) ** 2 > (mouseBoundary.w * 0.5) ** 2) continue;
    strokeRectangle(e);
  }

  console.log('all:', all.length, ', edges:', edges.length, ', inRange:', inRange.length)

  fps.innerText = Math.round(1 / dt);
  last = now;
  requestAnimationFrame(draw);
}

function random(min, max) { return Math.random() * (max - min) + min };

function strokeRectangle(boundary) {
  ctx.strokeRect(Math.floor(boundary.x - boundary.w * 0.5), Math.floor(boundary.y - boundary.h * 0.5), boundary.w, boundary.h);
}

function drawQuadtree(node) {
  let b = node.boundary;
  strokeRectangle(b);
  if (!node.children.length) return;
  let c = node.children;
  for (let i = 0; i < c.length; i++) {
    if (c[i]) drawQuadtree(c[i]);
  }
}