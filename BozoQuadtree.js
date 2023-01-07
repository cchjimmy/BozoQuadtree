// credit: https://en.wikipedia.org/wiki/Quadtree#Pseudocode

export default class BozoQuadtree {
  constructor(x, y, w, h, capacity = 10, maxDepth = 4) {
    this.boundary = {
      x, y, w, h
    }
    this.objects = [];
    this.capacity = capacity;
    this.children = [];
    this.maxDepth = maxDepth;
    this.depth = 0;
  }

  insert(boundary) {
    if (!this.intersects(this.boundary, boundary)) return;
    this.objects.push(boundary);
    if (this.objects.length >= this.capacity && !this.children.length && this.depth < this.maxDepth) this.subdivide();
    if (!this.children.length) return;
    for (let j = 0; j < this.objects.length; j++) {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].insert(this.objects[j]);
      }
    }
    this.objects = [];
  }

  subdivide() {
    let halfWidth = this.boundary.w * 0.5;
    let halfHeight = this.boundary.h * 0.5;
    let nextDepth = this.depth + 1;
    let child;

    child = new this.constructor(this.boundary.x - halfWidth * 0.5, this.boundary.y - halfHeight * 0.5, halfWidth, halfHeight, this.maxDepth);
    child.depth = nextDepth;
    this.children.push(child);

    child = new this.constructor(this.boundary.x + halfWidth * 0.5, this.boundary.y - halfHeight * 0.5, halfWidth, halfHeight, this.maxDepth);
    child.depth = nextDepth;
    this.children.push(child);

    child = new this.constructor(this.boundary.x + halfWidth * 0.5, this.boundary.y + halfHeight * 0.5, halfWidth, halfHeight, this.maxDepth);
    child.depth = nextDepth;
    this.children.push(child);

    child = new this.constructor(this.boundary.x - halfWidth * 0.5, this.boundary.y + halfHeight * 0.5, halfWidth, halfHeight, this.maxDepth);
    child.depth = nextDepth;
    this.children.push(child);
  }

  queryRange(boundary) {
    let result = [];

    if (!this.intersects(this.boundary, boundary)) return result;

    result.push(...this.objects);

    for (let i = 0; i < this.children.length; i++) {
      result.push(...this.children[i].queryRange(boundary));
    }

    return [...new Set(result)];
  }

  intersects(boundary1, boundary2) {
    // squaring is for eliminating negative values
    return (boundary1.x - boundary2.x) ** 2 < ((boundary1.w + boundary2.w) * 0.5) ** 2 && (boundary1.y - boundary2.y) ** 2 < ((boundary1.h + boundary2.h) * 0.5) ** 2;
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
    // credit: https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
    return [...new Set(result)];
  }
}