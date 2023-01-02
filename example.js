import BozoQuadtree from "./BozoQuadtree.js";

const qtree = new BozoQuadtree;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
var entities = [];

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

  canvas.width = 400;
  canvas.height = 400;

  let boundary = {
    x: canvas.width * 0.5,
    y: canvas.height * 0.5,
    w: canvas.width,
    h: canvas.height
  };

  qtree.boundary = boundary;

  for (let i = 0; i < 5000; i++) {
    let entity = { x: Math.random() * boundary.w, y: Math.random() * boundary.h, w: Math.random() * 6, h: Math.random() * 6 }
    entities.push(entity);
    qtree.insert(entity);
  }

  // mouse support
  document.addEventListener('mousemove', changeMouseBoundary);

  // touch support
  document.addEventListener('touchmove', changeMouseBoundary);

  function changeMouseBoundary(e) {
    let bcr = canvas.getBoundingClientRect()
    mouseBoundary.x = (e?.clientX || e?.touches[0]?.clientX) - bcr.x;
    mouseBoundary.y = (e?.clientY || e?.touches[0]?.clientY) - bcr.y;
  }
}

function draw() {
  requestAnimationFrame(draw);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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