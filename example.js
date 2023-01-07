import BozoQuadtree from "./BozoQuadtree.js";

const qtree = new BozoQuadtree;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const fps = document.querySelector('span');
var entities = [];
canvas.width = 400;
canvas.height = 400;
var last = 0;

document.body.appendChild(canvas);

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
  let boundary = {
    x: canvas.width * 0.5,
    y: canvas.height * 0.5,
    w: canvas.width,
    h: canvas.height
  };

  qtree.boundary = boundary;

  for (let i = 0; i < 800; i++) {
    entities.push({
      x: random(10, canvas.width - 10),
      y: random(10, canvas.height - 10),
      w: random(5, 10),
      h: random(5, 10),
      vx: random(-20, 20),
      vy: random(-20, 20),
      color: 'black'
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

  qtree.clearTree();

  for (let i = 0; i < entities.length; i++) {
    qtree.insert(entities[i]);
  }

  let all = qtree.array();
  for (let i = 0; i < all.length; i++) {
    let e = all[i];
    e.x += e.vx * dt;
    e.y += e.vy * dt;

    let nearby = qtree.queryRange(e);
    let intersected = false;
    for (let i = 0; i < nearby.length; i++) {
      if (nearby[i] == e || !qtree.intersects(nearby[i], e)) continue;
      intersected = true;
      break;
    }
    e.color = intersected ? 'red' : 'black';
  }

  let edges = [
    ...qtree.queryRange(top),
    ...qtree.queryRange(left),
    ...qtree.queryRange(right),
    ...qtree.queryRange(bottom),
  ];
  edges = edges.filter((v, i) => edges.indexOf(v) == i);
  for (let i = 0; i < edges.length; i++) {
    let e = edges[i];
    if (qtree.intersects(e, left) || qtree.intersects(e, right)) e.vx *= -1;
    if (qtree.intersects(e, top) || qtree.intersects(e, bottom)) e.vy *= -1;
  }

  let inRange = qtree.queryRange(mouseBoundary);
  for (let i = 0; i < inRange.length; i++) {
    if ((inRange[i].y - mouseBoundary.y) ** 2 + (inRange[i].x - mouseBoundary.x) ** 2 > (mouseBoundary.w * 0.5) ** 2) continue;
    ctx.save();
    ctx.strokeStyle = inRange[i].color;
    strokeRectangle(inRange[i]);
    ctx.restore();
  }

  fps.innerText = Math.round(1 / dt);
  last = now;

  requestAnimationFrame(draw);
}

function random(min, max) { return Math.random() * (max - min) + min };

function strokeRectangle(boundary) {
  ctx.strokeRect(Math.floor(boundary.x - boundary.w * 0.5), Math.floor(boundary.y - boundary.h * 0.5), boundary.w, boundary.h);
}