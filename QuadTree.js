// credit: https://en.wikipedia.org/wiki/Quadtree#Pseudocode

export default class QuadTree {
  constructor(x, y, w, h, capacity = 10) {
    this.boundary = {
      x, y, w, h
    }
    this.objects = [];
    this.capacity = capacity;
    this.children = [];
  }

  insert(boundary, data) {
    if (!this.intersects(this.boundary, boundary)) return false;
    boundary.data = data;
    if (this.objects.length < this.capacity && !this.children.length) {
      this.objects.push(boundary);
      return true;
    }
    if (!this.children.length) this.subdivide();
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].insert(boundary)) return true;
    }
    return false;
  }

  subdivide() {
    let s1 = -1;
    let s2 = 1;
    for (let i = 0; i < 4; i++) {
      // --, +-, ++, -+
      i % 2 ? s1 *= -1 : s2 *= -1;
      this.children.push(new QuadTree(this.boundary.x + s1 * this.boundary.w / 4, this.boundary.y + s2 * this.boundary.h / 4, this.boundary.w / 2, this.boundary.h / 2, this.capacity));
    }
  }

  queryRange(boundary) {
    let result = [];

    if (!this.intersects(this.boundary, boundary)) {
      return result;
    }

    for (let i = 0; i < this.objects.length; i++) {
      if (this.intersects(boundary, this.objects[i])) {
        result.push(this.objects[i]);
      }
    }

    if (!this.children.length) return result;

    for (let i = 0; i < this.children.length; i++) {
      result.push(...this.children[i].queryRange(boundary));
    }

    return result;
  }

  intersects(boundary, boundary2) {
    if (boundary.x - boundary.w / 2 < boundary2.x + boundary2.w / 2 && boundary.x + boundary.w / 2 > boundary2.x - boundary2.w / 2 && boundary.y - boundary.h / 2 < boundary2.y + boundary2.h / 2 && boundary.y + boundary.h / 2 > boundary2.y - boundary2.h / 2) {
      return true;
    }
    return false;
  }

  show(ctx) {
    ctx.save();

    for (let i = 0; i < this.objects.length; i++) {
      let e = this.objects[i];
      ctx.fillRect(e.x - e.w / 2, e.y - e.h / 2, e.w, e.h);
    }

    ctx.translate(this.boundary.x - this.boundary.w / 2, this.boundary.y - this.boundary.h / 2);
    ctx.strokeRect(0, 0, this.boundary.w, this.boundary.h);

    ctx.restore();

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].show(ctx);
    }
  }

  clearTree() {
    this.objects = [];

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].clearTree();
    }

    this.children = [];
  }

  array() {
    let result = [];
    result.push(...this.objects);
    for (let i = 0; i < this.children.length; i++) {
      result.push(...this.children[i].array());
    }
    return result;
  }
}