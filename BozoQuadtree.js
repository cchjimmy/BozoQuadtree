// reference: https://en.wikipedia.org/wiki/Quadtree#Pseudocode

export default class BozoQuadtree {
  constructor(boundary = { x: 50, y: 50, w: 100, h: 100 }, maxDepth = 4) {
    this.objects = [];
    this.children = [];
    this.maxDepth = maxDepth;
    this.depth = 0;
    this.setBounds(boundary);
  }

  setBounds(boundary) {
    this.clearTree();
    this.boundary = boundary;
    let halfWidth = boundary.w * 0.5;
    let halfHeight = boundary.h * 0.5;
    this.childBoundaries = [
      {
        x: this.boundary.x - halfWidth * 0.5,
        y: this.boundary.y - halfHeight * 0.5,
        w: halfWidth,
        h: halfHeight
      },
      {
        x: this.boundary.x + halfWidth * 0.5,
        y: this.boundary.y - halfHeight * 0.5,
        w: halfWidth,
        h: halfHeight
      },
      {
        x: this.boundary.x + halfWidth * 0.5,
        y: this.boundary.y + halfHeight * 0.5,
        w: halfWidth,
        h: halfHeight
      },
      {
        x: this.boundary.x - halfWidth * 0.5,
        y: this.boundary.y + halfHeight * 0.5,
        w: halfWidth,
        h: halfHeight
      }
    ];
  }

  insert(boundary) {
    if (this.depth == 0 && !this.intersects(this.boundary, boundary)) return;

    if (this.depth < this.maxDepth) {
      if (!this.children.length) this.subdivide();

      for (let i = 0; i < this.childBoundaries.length; i++) {
        if (!this.contains(this.childBoundaries[i], boundary)) continue;
        this.children[i].insert(boundary);
        return;
      }
    }

    this.objects.push(boundary);
  }

  subdivide() {
    for (let i = 0; i < this.childBoundaries.length; i++) {
      this.children[i] = new this.constructor(this.childBoundaries[i], this.maxDepth);
      this.children[i].depth = this.depth + 1;
    }
  }

  queryRange(boundary) {
    let result = [];

    for (let i = 0; i < this.objects.length; i++) {
      if (this.intersects(boundary, this.objects[i])) result.push(this.objects[i]);
    }

    for (let i = 0; i < this.children.length; i++) {
      if (this.intersects(this.children[i].boundary, boundary)) result.push(...this.children[i].queryRange(boundary));
    }

    return result.length ? [...new Set(result)] : result;
  }

  intersects(boundary1, boundary2) {
    // squaring is for eliminating negative values
    return (boundary1.x - boundary2.x) ** 2 < ((boundary1.w + boundary2.w) * 0.5) ** 2 && (boundary1.y - boundary2.y) ** 2 < ((boundary1.h + boundary2.h) * 0.5) ** 2;
  }

  contains(boundary1, boundary2) {
    return boundary1.x - boundary2.x < (boundary1.w - boundary2.w) * 0.5 && boundary1.x - boundary2.x > (boundary2.w - boundary1.w) * 0.5 && boundary1.y - boundary2.y < (boundary1.h - boundary2.h) * 0.5 && boundary1.y - boundary2.y > (boundary2.h - boundary1.h) * 0.5
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
    if (this.objects.length) result.push(...this.objects);
    for (let i = 0; i < this.children.length; i++) {
      result.push(...this.children[i].array());
    }
    // credit: https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
    return result.length ? [...new Set(result)] : result;
  }
}