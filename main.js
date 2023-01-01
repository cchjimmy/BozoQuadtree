import QuadTree from "./QuadTree.js";

const qtree = new QuadTree;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
var entities = [];

const boundary = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  w: window.innerWidth,
  h: window.innerHeight,
}

var mouseBoundary = {
  x: 0,
  y: 0,
  w: 200,
  h: 200,
}

setup();
draw();

function setup() {
  document.body.appendChild(canvas);

  canvas.width = boundary.w;
  canvas.height = boundary.h;

  qtree.boundary = boundary;

  for (let i = 0; i < 5000; i++) {
    let entity = { x: Math.random() * boundary.w, y: Math.random() * boundary.h, w: Math.random() * 6, h: Math.random() * 6 }
    entities.push(entity);
    qtree.insert(entity);
  }

  document.addEventListener('mousemove', (e) => {
    mouseBoundary.x = e.clientX;
    mouseBoundary.y = e.clientY;
  })
}

function draw() {
  requestAnimationFrame(draw);
  ctx.clearRect(0, 0, boundary.w, boundary.h);

  qtree.clearTree();

  for (let i = 0; i < entities.length; i++) {
    entities[i].x += Math.random() * 2 - 1;
    entities[i].y += Math.random() * 2 - 1;

    qtree.insert(entities[i]);
  }

  let visible = qtree.queryRange(mouseBoundary);

  for (let i = 0; i < visible.length; i++) {
    let v = visible[i];
    if (((v.x - mouseBoundary.x) ** 2 + (v.y - mouseBoundary.y) ** 2) ** 0.5 > mouseBoundary.w / 2) continue;
    ctx.fillRect(v.x - v.w / 2, v.y - v.h / 2, v.w, v.h);
  }
}