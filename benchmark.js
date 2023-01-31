// credit: https://github.com/timohausmann/quadtree-js/blob/master/docs/test-10000-1.2.0.html

import BozoQuadtree from './BozoQuadtree.js';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const qtree = new BozoQuadtree;
const objects = [];
const amount = 10000;
const maxObjectSize = 64;

init();

function init() {
  canvas.width = 800;
  canvas.height = 600;

  qtree.setBounds({
    x: canvas.width * 0.5,
    y: canvas.height * 0.5,
    w: canvas.width,
    h: canvas.height
  });

  for (let i = 0; i < amount; i++) {
    objects.push({
      x: randMinMax(maxObjectSize * 0.5, canvas.width - maxObjectSize * 0.5),
      y: randMinMax(maxObjectSize * 0.5, canvas.height - maxObjectSize * 0.5),
      w: randMinMax(4, maxObjectSize),
      h: randMinMax(4, maxObjectSize)
    });
  };

  const cursor = {
    x: randMinMax(120, canvas.width - 120),
    y: randMinMax(120, canvas.height - 120),
    w: 32,
    h: 32
  }

  var start = performance.now();

  for (let i = 0; i < objects.length; i++) {
    qtree.insert(objects[i]);
  }

  var candidates = qtree.queryRange(cursor);

  var end = performance.now();
  var time = end - start;

  let total = qtree.array.length;

  var text = `Time spent for insert of ${total} objects and retrieve once: ${Math.round(time)}ms. Retrieved: ${candidates.length} / ${total} (${candidates.length / total * 100}%) objects.`;
  console.log(`retrieved ${candidates.length} objects in ${time}ms`);
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
  drawIntersectedBoundaries(qtree, cursor, ctx);

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
      if (c[i]) drawQuadtree(c[i], ctx);
    }
  }

  function drawIntersectedBoundaries(node, boundary, ctx) {
    let b = node.boundary;
    if (node.intersects(b, boundary)) strokeRectangle(b, ctx);
    if (!node.children.length) return;
    let c = node.children;
    for (let i = 0; i < c.length; i++) {
      if (c[i]) drawIntersectedBoundaries(c[i], boundary, ctx);
    }
  }

  function drawObjects(node, ctx) {
    let o = node.array;
    for (let i = 0; i < o.length; i++) {
      if (o[i].check) continue;
      strokeRectangle(o[i].boundary, ctx);
    }
  }

  function strokeRectangle(rect, ctx) {
    ctx.strokeRect(rect.x - rect.w * 0.5, rect.y - rect.h * 0.5, rect.w, rect.h);
  }
}