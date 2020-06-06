/**
 * The vegetation renderer
 * @param {WebGLRenderingContext} gl A WebGL rendering context
 * @constructor
 */
const Vegetation = function(gl) {
    this.program = new Shader(
        gl,
        this.SHADER_VERTEX,
        this.SHADER_FRAGMENT,
        ["scale", "time"],
        ["color", "position", "flex", "windPosition"]);
    this.programReflect = new Shader(
        gl,
        this.SHADER_VERTEX_REFLECT,
        this.SHADER_FRAGMENT_REFLECT,
        ["scale"],
        ["color", "position"]);
    this.vao = gl.vao.createVertexArrayOES();
    this.vaoReflect = gl.vao.createVertexArrayOES();

    Meshed.call(this, gl, [
        new Meshed.VAOConfiguration(
            this.vao,
            () => {
                gl.enableVertexAttribArray(this.program["aColor"]);
                gl.vertexAttribPointer(this.program["aColor"],
                    3, gl.FLOAT, false, 40, 0);
                gl.enableVertexAttribArray(this.program["aPosition"]);
                gl.vertexAttribPointer(this.program["aPosition"],
                    3, gl.FLOAT, false, 40, 12);
                gl.enableVertexAttribArray(this.program["aFlex"]);
                gl.vertexAttribPointer(this.program["aFlex"],
                    2, gl.FLOAT, false, 40, 24);
                gl.enableVertexAttribArray(this.program["aWindPosition"]);
                gl.vertexAttribPointer(this.program["aWindPosition"],
                    2, gl.FLOAT, false, 40, 32);
            }
        ),
        new Meshed.VAOConfiguration(
            this.vaoReflect,
            () => {
                gl.enableVertexAttribArray(this.programReflect["aColor"]);
                gl.vertexAttribPointer(this.programReflect["aColor"],
                    3, gl.FLOAT, false, 40, 0);
                gl.enableVertexAttribArray(this.programReflect["aPosition"]);
                gl.vertexAttribPointer(this.programReflect["aPosition"],
                    3, gl.FLOAT, false, 40, 12);
            }
        )
    ]);
};

Vegetation.prototype = Object.create(Meshed.prototype);

Vegetation.prototype.SHADER_VERTEX = `#version 100
uniform sampler2D air;
uniform float time;
uniform vec2 scale;

attribute vec3 color;
attribute vec3 position;
attribute vec2 flex;
attribute vec2 windPosition;

varying vec3 iColor;

void main() {
  iColor = color;
  
  vec2 states = texture2D(air, vec2(windPosition.x * scale.x, 1.0 - windPosition.y * scale.y)).ar;
  float displacement = mix(states.x, states.y, time) * 2.0 - 1.0;
  
  gl_Position = vec4(
    vec2(2.0, -2.0) * (vec2(position.x, position.y - position.z) + flex * displacement) * scale + vec2(-1.0, 1.0),
    1.0 - position.y * scale.y,
    1.0);
}
`;

Vegetation.prototype.SHADER_FRAGMENT = `#version 100
varying lowp vec3 iColor;

void main() {
    gl_FragColor = vec4(iColor, 1.0);
}
`;

Vegetation.prototype.SHADER_VERTEX_REFLECT = `#version 100
uniform vec2 scale;

attribute vec3 color;
attribute vec3 position;

varying vec3 iColor;

void main() {
  iColor = color;
  
  gl_Position = vec4(
    vec2(2.0, -2.0) * vec2(position.x, position.y + position.z) * scale + vec2(-1.0, 1.0),
    1.0 - position.y * scale.y,
    1.0);
}
`;

Vegetation.prototype.SHADER_FRAGMENT_REFLECT = `#version 100
varying lowp vec3 iColor;

void main() {
    gl_FragColor = vec4(iColor, 1.0);
}
`;

/**
 * Render a mesh as vegetation
 * @param {Air} air An air object to displace vegetation with
 * @param {Number} width The render target width
 * @param {Number} height The render target height
 * @param {Number} scale The scale
 * @param {Number} time The interpolation factor
 */
Vegetation.prototype.render = function(air, width, height, scale, time) {
    this.program.use();
    this.gl.vao.bindVertexArrayOES(this.vao);

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, air.getFront().texture);

    this.gl.uniform1f(this.program["uTime"], time);
    this.gl.uniform2f(this.program["uScale"], 1 / width * scale, 1 / height * scale);

    this.renderMesh();
};

/**
 * Render vegetation reflections
 * @param {Number} width The render target width
 * @param {Number} height The render target height
 * @param {Number} scale The scale
 */
Vegetation.prototype.renderReflections = function(width, height, scale) {
    this.programReflect.use();
    this.gl.vao.bindVertexArrayOES(this.vaoReflect);

    this.gl.uniform2f(this.programReflect["uScale"], 1 / width * scale, 1 / height * scale);

    this.renderMesh();
};

/**
 * Free all resources maintained by the vegetation renderer
 */
Vegetation.prototype.free = function() {
    this.program.free();
    this.programReflect.free();
    this.gl.vao.deleteVertexArrayOES(this.vao);
    this.gl.vao.deleteVertexArrayOES(this.vaoReflect);
};