function main() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 400;
  canvas.height = 400;

  document.body.appendChild(canvas);

  let objects = new Array(10000);
  let side = 10;
  for (let i = 0; i < objects.length; i++) {
    objects[i] = {
      x: random(0, canvas.width),
      y: random(0, canvas.height),
      width: side,
      height: side,
      color: "grey"
    }
  }

  side *= 2;
  let query = {
    x: random(side, canvas.width - side),
    y: random(side, canvas.height - side),
    // x: 150,
    // y: 240,
    width: side,
    height: side
  }

  let q, qtree;
  console.log(`time to insert ${objects.length} objects and query at once: ` + measure(() => {
    qtree = new BozoQuadtree({
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height
    });
    
    for (let i = 0; i < objects.length; i++) {
      qtree.insert(objects[i]);
    }

    q = qtree.query(query);
  }) + " ms");

  for (let i = 0; i < q.length; i++) {
    q[i].color = "pink";
  }

  draw(canvas, ctx, qtree, query);
}

function draw(canvas, ctx, qtree, query) {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let child in qtree.objects) {
    for (let i = 0; i < qtree.objects[child].length; i++) {
      let o = qtree.objects[child][i];
      ctx.strokeStyle = o.color;
      ctx.strokeRect(o.x, o.y, o.width, o.height);
    }
  }

  ctx.strokeStyle = "lightgreen";
  for (let index in qtree.boundaries) {
    let boundary = qtree.boundaries[index];
    ctx.strokeRect(boundary.x, boundary.y, boundary.width, boundary.height);
  }

  ctx.strokeStyle = "red";
  ctx.strokeRect(query.x, query.y, query.width, query.height);

  let b = qtree.boundaries[qtree.getIndex(query)];
  ctx.strokeStyle = "red";
  ctx.strokeRect(b.x, b.y, b.width, b.height);
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function measure(func) {
  let past = performance.now();
  func();
  return performance.now() - past;
}

main();