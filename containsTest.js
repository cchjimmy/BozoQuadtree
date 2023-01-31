import BozoQuadtree from "./BozoQuadtree.js";

init();

function init() {
  const qtree = new BozoQuadtree({
    x: canvas.width * 0.5,
    y: canvas.height * 0.5,
    w: canvas.width,
    h: canvas.height
  });
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = 400;
  canvas.height = 400;

  let b0 = {
    x: 100,
    y: 200,
    w: 100,
    h: 100
  };
  let b1 = {
    x: 300,
    y: 200,
    w: 100,
    h: 100
  };
  let b2 = {
    x: 100,
    y: 200,
    w: 50,
    h: 50
  };
  let b3 = {
    x: 260,
    y: 200,
    w: 50,
    h: 50
  };

  qtree.insert(b0);
  qtree.insert(b1);
  qtree.insert(b2);
  qtree.insert(b3);

  // draw
  strokeRectangle(ctx, b0, 'b0');
  strokeRectangle(ctx, b1, 'b1');
  strokeRectangle(ctx, b2, 'b2');
  strokeRectangle(ctx, b3, 'b3');

  ctx.fillText(`Does b0 contains b1?: ${qtree.contains(b0, b1)}`, 0, 10);
  ctx.fillText(`Does b0 contains b2?: ${qtree.contains(b0, b2)}`, 0, 20);
  ctx.fillText(`Does b0 contains b3?: ${qtree.contains(b0, b3)}`, 0, 30);
  
  ctx.fillText(`Does b1 contains b0?: ${qtree.contains(b1, b0)}`, 0, 50);
  ctx.fillText(`Does b1 contains b2?: ${qtree.contains(b1, b2)}`, 0, 60);
  ctx.fillText(`Does b1 contains b3?: ${qtree.contains(b1, b3)}`, 0, 70);

  ctx.fillText(`Does b2 contains b0?: ${qtree.contains(b2, b0)}`, 0, 90);
  ctx.fillText(`Does b2 contains b1?: ${qtree.contains(b2, b1)}`, 0, 100);
  ctx.fillText(`Does b2 contains b3?: ${qtree.contains(b2, b3)}`, 0, 110);
}

function strokeRectangle(ctx, boundary, name = '') {
  ctx.fillText(name, boundary.x - boundary.w * 0.5, boundary.y - boundary.h * 0.5 - 5);
  ctx.strokeRect(boundary.x - boundary.w * 0.5, boundary.y - boundary.h * 0.5, boundary.w, boundary.h)
}