// reference: https://en.wikipedia.org/wiki/Quadtree#Pseudocode

export default class BozoQuadtree {
  constructor(boundary = { x: 50, y: 50, w: 100, h: 100 }, maxDepth = 4) {
    this.objects = [];
    this.children = [];
    this.maxDepth = maxDepth;
    this.depth = 0;
    this.setBounds(boundary);
    this.allObjects = [];
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
    if (this.depth < this.maxDepth) {
      for (let i = 0; i < this.childBoundaries.length; i++) {
        if (!this.contains(this.childBoundaries[i], boundary.object ?? boundary)) continue;
        if (!this.children[i]) {
          this.children[i] = new this.constructor(this.childBoundaries[i], this.maxDepth);
          this.children[i].allObjects = this.allObjects;
          this.children[i].depth = this.depth + 1;
        }
        this.children[i].insert(boundary);
        return;
      }
    }

    let object = boundary.relocate ? boundary : { object: boundary, tree: this };

    this.objects.push(object);
    if (object.relocate) {
      delete object.relocate;
      object.tree = this;
      return;
    }

    this.allObjects.push(object);
  }

  queryRange(boundary) {
    let result = [];
    for (let i = 0; i < this.objects.length; i++) {
      if (this.intersects(boundary, this.objects[i].object)) result.push(this.objects[i]);
    }
    for (let i = 0; i < this.children.length; i++) {
      if (!this.children[i]) continue;
      if (this.intersects(this.children[i].boundary, boundary)) {
        result.push(...this.children[i].queryRange(boundary))
        continue;
      }
      if (this.contains(boundary, this.children[i].boundary)) result.push(...this.children[i].objects);
    }
    return result;
  }

  intersects(boundary1, boundary2) {
    // squaring is for eliminating negative values
    return (boundary1.x - boundary2.x) ** 2 < ((boundary1.w + boundary2.w) * 0.5) ** 2 && (boundary1.y - boundary2.y) ** 2 < ((boundary1.h + boundary2.h) * 0.5) ** 2;
  }

  contains(boundary1, boundary2) {
    return boundary1.x - boundary2.x < (boundary1.w - boundary2.w) * 0.5 && boundary1.x - boundary2.x > (boundary2.w - boundary1.w) * 0.5 && boundary1.y - boundary2.y < (boundary1.h - boundary2.h) * 0.5 && boundary1.y - boundary2.y > (boundary2.h - boundary1.h) * 0.5
  }

  clearTree() {
    this.allObjects = [];

    this.objects = [];

    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i]) this.children[i].clearTree();
    }

    this.children = [];
  }

  // restructure() {
  //   for (let i = 0; i < this.children.length; i++) {
  //     let child = this.children[i];
  //     if (!child || (!child.children.length && !child.objects.length)) {
  //       this.children.splice(i, 1);
  //       continue;
  //     }
  //     child.restructure();
  //   }
  // }

  remove(object) {
    object.tree.objects.splice(object.tree.objects.findIndex(v => v.object == object.object), 1);
    this.allObjects.splice(this.allObjects.findIndex(v => v.object == object.object), 1);
  }

  relocate(object) {
    object.relocate = true;
    object.tree.objects.splice(object.tree.objects.findIndex(v => v.object == object.object), 1);
    // this.restructure();
    this.insert(object);
  }

  array() {
    return [...this.allObjects];
  }
}