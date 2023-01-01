// credit: https://en.wikipedia.org/wiki/Quadtree#Pseudocode

export default class QuadTree {
  constructor(x, y, w, h, capacity = 1) {
    this.boundary = {
      x, y, w, h
    }
    this.entities = [];
    this.capacity = capacity;
    this.children = [];
  }

  insert(boundary) {
    if (!this.intersects(this.boundary, boundary)) return false;
    if (this.entities.length < this.capacity && !this.children.length) {
      this.entities.push(boundary);
      return true;
    }
    if (!this.children.length) this.subdivide();
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].insert(boundary)) return true;
    }
    return false;
  }

  subdivide() {
    this.children.push(new QuadTree(this.boundary.x - this.boundary.w / 4, this.boundary.y - this.boundary.h / 4, this.boundary.w / 2, this.boundary.h / 2));
    this.children.push(new QuadTree(this.boundary.x + this.boundary.w / 4, this.boundary.y - this.boundary.h / 4, this.boundary.w / 2, this.boundary.h / 2));
    this.children.push(new QuadTree(this.boundary.x - this.boundary.w / 4, this.boundary.y + this.boundary.h / 4, this.boundary.w / 2, this.boundary.h / 2));
    this.children.push(new QuadTree(this.boundary.x + this.boundary.w / 4, this.boundary.y + this.boundary.h / 4, this.boundary.w / 2, this.boundary.h / 2));
  }

  queryRange(boundary) {
    let result = [];

    if (!this.intersects(this.boundary, boundary)) {
      return result;
    }

    for (let i = 0; i < this.entities.length; i++) {
      if (this.intersects(boundary, this.entities[i])) {
        result.push(this.entities[i]);
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

    for (let i = 0; i < this.entities.length; i++) {
      let e = this.entities[i];
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
    this.entities = [];

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].clearTree();
    }

    this.children = [];
  }
}