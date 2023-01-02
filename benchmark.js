// credit: https://github.com/timohausmann/quadtree-js/blob/master/docs/test-10000-1.2.0.html

import BozoQuadtree from './BozoQuadtree.js';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const qtree = new BozoQuadtree;
var objects = [];
var amount = 10000;

init();

function init() {
  document.body.appendChild(canvas);

  canvas.width = 800;
  canvas.height = 600;

  qtree.boundary = {
    x: canvas.width * 0.5,
    y: canvas.height * 0.5,
    w: canvas.width,
    h: canvas.height
  };

  var maxObjectSize = 64

  for (let i = 0; i < amount; i++) {
    objects.push({
      x: randMinMax(maxObjectSize * 0.5, canvas.width - maxObjectSize * 0.5),
      y: randMinMax(maxObjectSize * 0.5, canvas.height - maxObjectSize * 0.5),
      w: randMinMax(4, maxObjectSize),
      h: randMinMax(4, maxObjectSize)
    });
  };

  let cursor = {
    x: randMinMax(120, canvas.width - 120),
    y: randMinMax(120, canvas.height - 120),
    w: 32,
    h: 32
  }

  var start = performance.now();

  for (let i = 0; i < amount; i++) {
    qtree.insert(objects[i]);
  }

  var candidates = qtree.queryRange(cursor);

  var end = performance.now();
  var time = end - start;

  var text = `Time spent for insert of ${amount} objects and retrieve once: ${Math.round(time)}ms. Retrieved: ${candidates.length} / ${qtree.array().length} (${candidates.length/qtree.array().length*100}%) objects.`;
  console.log(text);
  let d = document.createElement('div');
  d.innerHTML = text;
  document.body.appendChild(d);

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < candidates.length; i++) {
    candidates[i].check = true;
  }

  ctx.strokeStyle = 'white';
  drawObjects(qtree, ctx);

  ctx.strokeStyle = 'red';
  drawQuadtree(qtree, ctx);

  ctx.strokeStyle = 'yellow';
  drawIntersectedBoundaries(qtree, ctx);

  ctx.strokeStyle = 'blue';
  strokeRectangle(cursor, ctx);

  function randMinMax(min, max) {
    return Math.random() * (max - min) + min;
  }

  function drawQuadtree(node, ctx) {
    let b = node.boundary;
    strokeRectangle(b, ctx);
    if (!node.children.length) return;
    let c = node.children;
    for (let i = 0; i < c.length; i++) {
      drawQuadtree(c[i], ctx);
    }
  }

  function drawIntersectedBoundaries(node, ctx) {
    let b = node.boundary;
    if (node.intersects(b, cursor)) strokeRectangle(b, ctx);
    if (!node.children.length) return;
    let c = node.children;
    for (let i = 0; i < c.length; i++) {
      drawIntersectedBoundaries(c[i], ctx);
    }
  }

  function drawObjects(node, ctx) {
    let o = node.array();
    for (let i = 0; i < o.length; i++) {
      ctx.save();
      if (o[i].check) continue;
      strokeRectangle(o[i], ctx);
      ctx.restore();
    }
  }

  function strokeRectangle(rect, ctx) {
    ctx.strokeRect(rect.x - rect.w * 0.5, rect.y - rect.h * 0.5, rect.w, rect.h);
  }
}