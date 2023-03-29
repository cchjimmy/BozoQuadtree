// reference: https://en.wikipedia.org/wiki/Quadtree#Pseudocode

/**
 * used to specify boundaries for objects to insert into quadtree
 * @typedef boundary
 * @property {number} x x component of the boundary centroid
 * @property {number} y y component of the boundary centroid
 * @property {number} w full width of the boundary
 * @property {number} h full height of the boundary
 */

/**
 * all boundaries have their origins at the center
 */
export default class BozoQuadtree {
  constructor(boundary = { x: 50, y: 50, w: 100, h: 100 }, maxDepth = 4) {
    this.objects = [];
    this.children = [];
    this.maxDepth = maxDepth;
    this.depth = 0;
    this.boundary = {};
    this.childBoundaries = [];
    this.allObjects = [];
    
    this.setBounds(boundary);
  }

  /**
   * 
   * @param {boundary} boundary 
   */
  setBounds(boundary) {
    this.clearTree();
    this.boundary.x = boundary.x;
    this.boundary.y = boundary.y;
    this.boundary.w = boundary.w;
    this.boundary.h = boundary.h;
    let halfWidth = boundary.w * 0.5;
    let halfHeight = boundary.h * 0.5;
    this.childBoundaries.splice(0);
    this.childBoundaries.push(
      {
        x: boundary.x - halfWidth * 0.5,
        y: boundary.y - halfHeight * 0.5,
        w: halfWidth,
        h: halfHeight
      },
      {
        x: boundary.x + halfWidth * 0.5,
        y: boundary.y - halfHeight * 0.5,
        w: halfWidth,
        h: halfHeight
      },
      {
        x: boundary.x + halfWidth * 0.5,
        y: boundary.y + halfHeight * 0.5,
        w: halfWidth,
        h: halfHeight
      },
      {
        x: boundary.x - halfWidth * 0.5,
        y: boundary.y + halfHeight * 0.5,
        w: halfWidth,
        h: halfHeight
      }
    );
  }

  getTreeContaining(object) {
    // max depth achieved, return this tree
    if (this.depth >= this.maxDepth) return this;
    
    for (let i = 0; i < this.childBoundaries.length; i++) {
      if (!this.contains(this.childBoundaries[i], object)) continue;
      if (!this.children[i]) {
        this.children[i] = new this.constructor(this.childBoundaries[i], this.maxDepth);
        // this.children[i].allObjects = this.allObjects;
        this.children[i].depth = this.depth + 1;
      }
      // child tree contains the object, call this function on child
      return this.children[i].getTreeContaining(object);
    }
    // if no children contain boundary, return this tree
    return this;
  }

  /**
   * specify an object with rectangular boundary to be inserted into the quadtree
   * @param {boundary} boundary 
   * @returns 
   */
  insert(boundary) {
    this.getTreeContaining(boundary).objects.push(boundary);
    this.allObjects.push(boundary);
  }

  /**
   * 
   * @param {boundary} boundary 
   * @returns {...quadtreeObject} returns an array of objects within the boundary, with keys: object, tree
   */
  queryRange(boundary) {
    let result = [];
    for (let i = 0; i < this.objects.length; i++) {
      if (this.intersects(boundary, this.objects[i])) result.push(this.objects[i]);
    }
    for (let i = 0; i < this.children.length; i++) {
      if (!this.children[i]) continue; // accounts for empty child
      if (this.intersects(boundary, this.children[i].boundary)) result.push(...this.children[i].queryRange(boundary));
    }
    return result;
  }

  /**
   * 
   * @param {boundary} boundary1 
   * @param {boundary} boundary2 
   * @returns true if boundary1 overlaps or contains boundary2 or vice versa
   */
  intersects(boundary1, boundary2) {
    // squaring is for eliminating negative values
    return (boundary1.x - boundary2.x) ** 2 < ((boundary1.w + boundary2.w) * 0.5) ** 2 && (boundary1.y - boundary2.y) ** 2 < ((boundary1.h + boundary2.h) * 0.5) ** 2;
  }

  /**
   * 
   * @param {boundary} boundary1 
   * @param {boundary} boundary2 
   * @returns true only if boundary1 contains all of boundary2
   */
  contains(boundary1, boundary2) {
    if (boundary1.w * boundary1.h < boundary2.w * boundary2.h) return false;
    return (boundary1.x - boundary2.x) ** 2 < ((boundary1.w - boundary2.w) * 0.5) ** 2 && (boundary1.y - boundary2.y) ** 2 < ((boundary1.h - boundary2.h) * 0.5) ** 2;
  }

  /**
   * recurssively clear the tree of its objects and children
   */
  clearTree() {
    this.objects.splice(0);
    this.allObjects.splice(0);
    
    for (let i = 0; i < this.children.length; i++) {
      this.children[i]?.clearTree();
    }
    
    this.children.splice(0);
  }

  /**
   * 
   * @param {boundary} boundary
   */
  remove(boundary) {
    let tree = this.getTreeContaining(boundary);
    let removed = [];
    for(let i = 0; i < tree.objects.length; i++){
      if(!this.intersects(boundary, tree.objects[i])) continue;
      removed.push(...tree.objects.splice(i, 1));
    }
    if (tree.children.length) {
      for (let i = 0; i< tree.children.length; i++) {
        if (this.children[i]) removed.push(...tree.children[i].remove(boundary));
      }
    }
    this.allObjects.splice(0);
    this.allObjects.push(...this.getAll());
    return removed;
  }

  /**
   *   
   * @returns {...boundary} All objects contained in this tree
   */
  get array() {
    return this.allObjects;
  }
  
  update() {
    let all = [...this.array];
    this.clearTree();
    for (let i = 0; i < all.length; i++) {
      this.insert(all[i]);
    }
  }
  
  getAll() {
    let all = [];
    all.push(...this.objects);
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i]) all.push(...this.children[i].getAll())
    }
    return all;
  }
}