(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root["BozoQuadtree"] = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // Just return a value to define the module export.
  // This example returns an object, but the module
  // can return a function as the exported value.
  return class BozoQuadtree {
    constructor(boundary = { x: 0, y: 0, width: 100, height: 100 }, maxDepth = 4) {
      this.maxDepth = maxDepth;
      this.objects = {
        "0": []
      }
      this.boundaries = {
        "0": boundary
      }
    }

    insert(object) {
      this.objects[this.getIndex(object)].push(object);
    }

    getIndex(object) {
      let parent = "0";
      for (let i = 0; i < this.maxDepth; i++) {
        if (!this.hasSplit(parent) && this.getDepth(parent) < this.maxDepth) {
          this.split(parent);
        }
        let index;
        for (let j = 0; j < 4; j++) {
          if (!this.contains(this.boundaries[parent + `${j}`], object)) continue;
          index = `${j}`;
          break;
        }
        if (!index) return parent;
        parent += index;
      }
      return parent;
    }

    calculateBoundary(parent, index) {
      return {
        x: index % 2 ? parent.x + parent.width * 0.5 : parent.x,
        y: index > 1 ? parent.y + parent.height * 0.5 : parent.y,
        width: parent.width * 0.5,
        height: parent.height * 0.5
      }
    }

    split(parentIndex) {
      for (let i = 0; i < 4; i++) {
        this.boundaries[parentIndex + `${i}`] = this.calculateBoundary(this.boundaries[parentIndex], i);
        this.objects[parentIndex + `${i}`] = [];
      }
    }

    hasSplit(parentIndex) {
      return this.boundaries.hasOwnProperty(parentIndex + "0");
    }

    getDepth(parentIndex) {
      return parentIndex.split("").length - 1;
    }

    remove(boundary) {
      let indices = this.getIndices(boundary);
      let removed = [];
      for (let i = 0; i < indices.length; i++) {
        let o = this.objects[indices[i]];
        for (let j = 0; j < o.length; j++) {
          if (!this.intersect(boundary, o[j])) continue;
          removed.push(...o.splice(j, 1));
          j--;
        }
      }
      return removed;
    }

    /**
     * true if boundary 1 contains boundary 2 fully
     */
    contains(b1, b2) {
      let hw1 = b1.width * 0.5;
      let hh1 = b1.height * 0.5;
      let x1 = b1.x + hw1;
      let y1 = b1.y + hh1;
      let hw2 = b2.width * 0.5;
      let hh2 = b2.height * 0.5;
      let x2 = b2.x + hw2;
      let y2 = b2.y + hh2;
      return (x2 - x1) ** 2 < (hw1 - hw2) ** 2 && (y2 - y1) ** 2 < (hh1 - hh2) ** 2;
    }

    intersect(b1, b2) {
      let hw1 = b1.width * 0.5;
      let hh1 = b1.height * 0.5;
      let x1 = b1.x + hw1;
      let y1 = b1.y + hh1;
      let hw2 = b2.width * 0.5;
      let hh2 = b2.height * 0.5;
      let x2 = b2.x + hw2;
      let y2 = b2.y + hh2;
      return (x2 - x1) ** 2 < (hw1 + hw2) ** 2 && (y2 - y1) ** 2 < (hh1 + hh2) ** 2;
    }

    query(boundary) {
      let indices = this.getIndices(boundary);
      let result = [];
      for (let i = 0; i < indices.length; i++) {
        let o = this.objects[indices[i]];
        for (let j = 0; j < o.length; j++) {
          if (!this.intersect(boundary, o[j])) continue;
          result.push(o[j]);
        }
      }
      return result;
    }

    getIndices(object, root = "0") {
      let indices = [root];
      if (!this.hasSplit(root)) return indices;
      for (let i = 0; i < 4; i++) {
        if (!this.intersect(object, this.boundaries[root + `${i}`])) continue;
        indices.push(...this.getIndices(object, root + `${i}`));
      }
      return indices;
    }
  }
}));