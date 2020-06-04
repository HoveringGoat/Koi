/**
 * Plants
 * @param {WebGLRenderingContext} gl A WebGL rendering context
 * @param {Constellation} constellation The constellation
 * @param {Slots} slots The slots to place objects on
 * @param {Random} random A randomizer
 * @constructor
 */
const Plants = function(gl, constellation, slots, random) {
    this.mesh = this.makeMesh(gl, constellation, slots, random);
};

Plants.prototype.WIND_UV_RADIUS = .6;
Plants.prototype.BLADE_HEIGHT_MIN = .3;
Plants.prototype.BLADE_HEIGHT_MAX = .85;

/**
 * Make the vegetation mesh
 * @param {WebGLRenderingContext} gl A WebGL rendering context
 * @param {Constellation} constellation The constellation
 * @param {Slots} slots The slots to place objects on
 * @param {Random} random A randomizer
 */
Plants.prototype.makeMesh = function(gl, constellation, slots, random) {
    const vertices = [];
    const indices = [];

    for (let slot = slots.slots.length; slot-- > 0;) if (slots.slots[slot])
        this.makeBlade(slots.slots[slot].x, slots.slots[slot].y, vertices, indices, random);

    return new Mesh(gl, vertices, indices);
};

/**
 * Make a wind map UV with some offset
 * @param {Number} x The X origin
 * @param {Number} y The Y origin
 * @param {Random} random A randomizer
 * @returns {Vector2} The UV coordinates
 */
Plants.prototype.makeUV = function(x, y, random) {
    const angle = random.getFloat() * Math.PI * 2;
    const radius = Math.sqrt(random.getFloat()) * this.WIND_UV_RADIUS;

    return new Vector2(
        x + Math.cos(angle) * radius,
        y + Math.sin(angle) * radius);
};

/**
 * Make a grass blade
 * @param {Number} x The X origin
 * @param {Number} y The Y origin
 * @param {Number[]} vertices The vertex array
 * @param {Number[]} indices The index array
 * @param {Random} random A randomizer
 */
Plants.prototype.makeBlade = function(x, y, vertices, indices, random) {
    const uv = this.makeUV(x, y, random);
    const firstIndex = vertices.length / 9;
    const height = this.BLADE_HEIGHT_MIN + (this.BLADE_HEIGHT_MAX - this.BLADE_HEIGHT_MIN) * random.getFloat();
    const radius = .1;
    const steps = 6;
    const color = Color.fromCSS("grass");
    const l = .8 + .2 * random.getFloat();

    for (let step = 0; step < steps - 1; ++step) {
        const f = step / (steps - 1);
        const r = radius * Math.pow(1 - f, .7);
        const flexibility = Math.pow(f, 3.5);

        vertices.push(
            color.r * l,
            color.g * l,
            color.b * l,
            x - r,
            y,
            height * f,
            flexibility,
            uv.x,
            uv.y);
        vertices.push(
            color.r * l,
            color.g * l,
            color.b * l,
            x + r,
            y,
            height * f,
            flexibility,
            uv.x,
            uv.y);

        if (step !== steps - 2)
            indices.push(
                firstIndex + (step << 1),
                firstIndex + (step << 1) + 1,
                firstIndex + (step << 1) + 3,
                firstIndex + (step << 1) + 3,
                firstIndex + (step << 1) + 2,
                firstIndex + (step << 1));
        else
            indices.push(
                firstIndex + (step << 1),
                firstIndex + (step << 1) + 1,
                firstIndex + (step << 1) + 2);
    }

    vertices.push(
        color.r * l,
        color.g * l,
        color.b * l,
        x,
        y,
        height,
        1,
        uv.x,
        uv.y);
};

/**
 * Free all resources maintained by plants
 */
Plants.prototype.free = function() {
    this.mesh.free();
};