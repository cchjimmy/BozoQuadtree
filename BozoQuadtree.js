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
      this.checkObject(boundary);
      this.maxDepth = maxDepth;
      this.objects = {
        "0": []
      };
      this.boundaries = {
        "0": boundary
      }
    }

    insert(object) {
      this.checkObject(object);
      let index = this.getIndex(object);
      this.objects[index].push(object);
    }

    getIndex(object) {
      let parent = "0";
      for (let i = 0; i < this.maxDepth; i++) {
        if (!this.haveSplit(parent) && this.getDepth(parent) < this.maxDepth) {
          this.split(parent);
        }

        let index = -1;
        for (let j = 0; j < 4; j++) {
          if (!this.contains(this.boundaries[parent + j], object)) continue;
          index = j;
          break;
        }

        if (index == -1) return parent;
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

    checkObject(object) {
      let mandatory = ["x", "y", "width", "height"];
      for (let i = 0; i < mandatory.length; i++) {
        if (!object.hasOwnProperty(mandatory[i])) throw console.trace(`Must define ${mandatory[i]} in object`);
      }
    }

    split(parentIndex) {
      for (let i = 0; i < 4; i++) {
        this.boundaries[parentIndex + i] = this.calculateBoundary(this.boundaries[parentIndex], i);
        this.objects[parentIndex + i] = [];
      }
    }

    haveSplit(parentIndex) {
      return this.boundaries.hasOwnProperty(parentIndex + "0");
    }

    getDepth(parentIndex) {
      return parentIndex.split("").length - 1;
    }

    remove(boundary) {
      this.checkObject(boundary);
      let index = this.getIndex(boundary);
      let descendants = this.getDescendants(index);
      descendants.push(index);
      descendants.push(...this.getAncestors(index));
      let removed = [];
      for (let i = 0; i < descendants.length; i++) {
        for (let j = 0; j < this.objects[descendants[i]].length; j++) {
          if (!this.intersect(boundary, this.objects[descendants[i]][j])) continue;
          removed.push(this.objects[descendants[i]].splice(j, 1)[0]);
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
      this.checkObject(boundary);
      let index = this.getIndex(boundary);
      let descendants = this.getDescendants(index);
      descendants.push(index);
      descendants.push(...this.getAncestors(index));
      let result = [];
      for (let i = 0; i < descendants.length; i++) {
        for (let j = 0; j < this.objects[descendants[i]].length; j++) {
          if (!this.intersect(boundary, this.objects[descendants[i]][j])) continue;
          result.push(this.objects[descendants[i]][j]);
        }
      }
      return result;
    }

    getDescendants(parentIndex) {
      let result = [];
      if (this.haveSplit(parentIndex)) {
        for (let i = 0; i < 4; i++) {
          let index = parentIndex + i;
          result.push(index);
          result.push(...this.getDescendants(index));
        }
      }
      return result;
    }

    getAncestors(index) {
      let result = new Array(index.length - 1);
      for (let i = 0; i < result.length; i++) {
        result[i] = index.slice(0, i + 1);
      }
      return result;
    }
  }
}));