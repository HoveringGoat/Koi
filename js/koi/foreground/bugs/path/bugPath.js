/**
 * A flight path for a bug to follow
 * @param {BugPathNode[]} nodes The path nodes
 * @constructor
 */
const BugPath = function(nodes) {
    this.nodes = nodes;
    this.at = 0;
    this.position = new Vector3();
    this.curve = this.makeCurve();
};

BugPath.prototype.CURVE_RESOLUTION = .05;
BugPath.prototype.INITIAL_POSITION = new SamplerPower(0, 1, .2);

/**
 * Set the position on this path to a random position
 * @param {Random} random A randomizer
 */
BugPath.prototype.setRandomPosition = function(random) {
    this.at = this.curve.length * this.INITIAL_POSITION.sample(random.getFloat());
};

/**
 * Make the curve between the nodes
 * @returns {CubicHermiteSampler} The curve connecting all nodes
 */
BugPath.prototype.makeCurve = function() {
    const points = [];

    for (const node of this.nodes)
        points.push(node.position);

    return new CubicHermiteSampler(new CubicHermite(points), this.CURVE_RESOLUTION);
};

/**
 * Move along this path
 * @param {Number} delta The amount to move
 * @returns {Boolean} True if the path has been traversed
 */
BugPath.prototype.move = function(delta) {
    return (this.at += delta) > this.curve.length;
};

/**
 * Get the start coordinate
 * @returns {Vector2} The start coordinate
 */
BugPath.prototype.getStart = function() {
    return this.curve.getStart();
};

/**
 * Get the last node
 * @returns {BugPathNode} The last node
 */
BugPath.prototype.getLastNode = function() {
    return this.nodes[this.nodes.length - 1];
};

/**
 * Get the current position on the path
 * @returns {Vector3} The current position
 */
BugPath.prototype.getPosition = function() {
    this.curve.sample(this.position, this.at);

    return this.position;
};

/**
 * Get the length of this bug path
 * @returns {Number} The length of the bug path
 */
BugPath.prototype.length = function() {
    return this.curve.length;
};