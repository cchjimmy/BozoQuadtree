(function main() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 400;
  canvas.height = 400;

  document.body.appendChild(canvas);

  let objects = new Array(10000);
  for (let i = 0; i < objects.length; i++) {
    objects[i] = {
      x: random(0, canvas.width),
      y: random(0, canvas.height),
      width: random(20, 60),
      height: random(20, 60),
      color: "grey"
    }
  }
  let query = {
    x: random(0, canvas.width),
    y: random(0, canvas.height),
    // x: 150,
    // y: 240,
    width: 32,
    height: 32
  }

  let q, qtree;
  let message = `time to insert ${objects.length} objects and query at once: ` + measure(() => {
    qtree = new BozoQuadtree({
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height
    });

    for (let i = 0; i < objects.length; i++) {
      qtree.insert(objects[i]);
    }

    q = qtree.remove(query);
  }).toFixed(2) + " ms";

  let p = document.createElement("p");
  p.innerText = message;
  p.style.color = "white";
  document.body.appendChild(p);

  for (let i = 0; i < q.length; i++) {
    q[i].color = "pink";
  }

  // console.log(JSON.stringify(qtree));

  draw(canvas, ctx, qtree, query);
}())

function draw(canvas, ctx, qtree, query) {
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let index in qtree.objects) {
    for (let i = 0; i < qtree.objects[index].length; i++) {
      let o = qtree.objects[index][i];
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

  ctx.strokeStyle = "red";
  let indices = qtree.getIndices(query);
  for (let i = 0; i < indices.length; i++) {
    let b = qtree.boundaries[indices[i]];
    ctx.strokeRect(b.x, b.y, b.width, b.height);
  }
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function measure(func) {
  let past = performance.now();
  func();
  return performance.now() - past;
}