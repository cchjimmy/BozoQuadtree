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

  insert(boundary, data) {
    if (!this.intersects(this.boundary, boundary)) return false;
    if (data) boundary.data = data;
    if (this.objects.length < this.capacity && !this.children.length) {
      this.objects.push(boundary);
      return true;
    }
    if (this.depth == this.maxDepth) {
      this.objects.push(boundary);
      return true;
    }
    if (!this.children.length && this.depth < this.maxDepth) this.subdivide();
    for (let i = 0; i < this.children.length; i++) {
      for (let j = 0; j < this.objects.length; j++) {
        this.children[i].insert(this.objects[j]);
      }
    }
    this.objects = [];
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].insert(boundary);
    }
    return false;
  }

  subdivide() {
    let s1 = -1;
    let s2 = 1;
    for (let i = 0; i < 4; i++) {
      // --, +-, ++, -+
      i % 2 ? s1 *= -1 : s2 *= -1;
      let child = new this.constructor(this.boundary.x + s1 * this.boundary.w * 0.25, this.boundary.y + s2 * this.boundary.h * 0.25, this.boundary.w * 0.5, this.boundary.h * 0.5, this.capacity, this.maxDepth);
      child.depth = this.depth + 1;
      this.children.push(child);
    }
  }

  queryRange(boundary) {
    let result = [];

    if (!this.intersects(this.boundary, boundary)) return result;

    result.push(...this.objects);

    if (!this.children.length) return result;

    for (let i = 0; i < this.children.length; i++) {
      result.push(...this.children[i].queryRange(boundary));
    }

    result = [...new Set(result)];

    for (let i = 0; i < result.length; i++) {
      if (!this.intersects(boundary, result[i])) result.splice(i, 1);
    }

    return result;
  }

  intersects(boundary1, boundary2) {
    if (boundary1.x - boundary1.w * 0.5 < boundary2.x + boundary2.w * 0.5 && boundary1.x + boundary1.w * 0.5 > boundary2.x - boundary2.w * 0.5 && boundary1.y - boundary1.h * 0.5 < boundary2.y + boundary2.h * 0.5 && boundary1.y + boundary1.h * 0.5 > boundary2.y - boundary2.h * 0.5) {
      return true;
    }
    return false;
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
    result = [...new Set(result)];
    return result;
  }
}