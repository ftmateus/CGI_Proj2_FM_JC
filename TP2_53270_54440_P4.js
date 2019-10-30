var gl; var program;
var instances = []; var nInstances = 0;
var tx; var ty; var tz;
var rx; var ry; var rz;
var sx; var sy; var sz;
var mView; var mProjection; var mModel; var mModelLocation;
var isFilled = false;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    
    // Configure WebGL
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    addEventListeners();

    cubeInit(gl);
    sphereInit(gl);
    cylinderInit(gl);
    torusInit(gl);
    bunnyInit(gl);
    create('cube');

    var at = [0, 0, 0];
    var eye = [1, 1, 1];
    var up = [0, 1, 0];
    mView = lookAt(eye, at, up);
    mProjection = ortho(-2, 2, -2, 2, 10, -10);
    
    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    mModelLocation = gl.getUniformLocation(program, "mModel");
    mViewLocation = gl.getUniformLocation(program, "mView");
    mProjectionLocation = gl.getUniformLocation(program, "mProjection");

    render();
}

function addEventListeners()
{
    document.getElementById("tx").addEventListener("input", function()
    {tx = this.value; updateMatrixModel();});
    document.getElementById("ty").addEventListener("input", function()
    {ty = this.value; updateMatrixModel();});
    document.getElementById("tz").addEventListener("input", function()
    {tz = this.value; updateMatrixModel();});
    document.getElementById("rx").addEventListener("input", function()
    {rx = this.value; updateMatrixModel();});
    document.getElementById("ry").addEventListener("input", function()
    {ry = this.value; updateMatrixModel();});
    document.getElementById("rz").addEventListener("input", function()
    {rz = this.value; updateMatrixModel();});
    document.getElementById("sx").addEventListener("input", function()
    {sx = this.value; updateMatrixModel();});
    document.getElementById("sy").addEventListener("input", function()
    {sy = this.value; updateMatrixModel();});
    document.getElementById("sz").addEventListener("input", function()
    {sz = this.value; updateMatrixModel();});
    document.getElementById("newCube").addEventListener("click", function () {create('cube');});
    document.getElementById("newSphere").addEventListener("click", function () {create('sphere')});
    document.getElementById("newCylinder").addEventListener("click", function () {create('cylinder')});
    document.getElementById("newTorus").addEventListener("click", function () {create('torus')});
    document.getElementById("newBunny").addEventListener("click", function () {create('bunny')});
    document.getElementById("resetCurrent").addEventListener("click", resetCurrent);
    document.getElementById("resetAll").addEventListener("click", resetAll);
    addEventListener("keypress", keyPress);
}

function keyPress(ev)
{
    switch (ev.key)
    {
        case 'w': isFilled = false; break;
        case 'f': isFilled = true; break;
        case 'z': break; //Z-buffer
        case 'b': break; //back face culling
    }
}

function create(type) {
    tx = 0; ty = 0; tz = 0;
    rx = 0; ry = 0; rz = 0;
    sx = 1; sy = 1; sz = 1;

    switch(type)
    {
        case 'cube': instances.push({m: mat4(), f: cubeDraw}); break;
        case 'sphere':  instances.push({m: mat4(), f: sphereDraw}); break;
        case 'cylinder': instances.push({m: mat4(), f: cylinderDraw}); break;
        case 'torus': instances.push({m: mat4(), f: torusDraw}); break;
        case 'bunny': instances.push({m: mat4(), f: bunnyDraw}); break;
    }
    nInstances++;
}

function resetCurrent() {
    tx = 0; ty = 0; tz = 0;
    rx = 0; ry = 0; rz = 0;
    sx = 1; sy = 1; sz = 1;

    updateMatrixModel();
}

function resetAll() {
    instances = [];
    nInstances = 0;
    create('cube');
    resetCurrent();
}

function updateMatrixModel() {
    instances[nInstances - 1].m = mult(translate(tx, ty, tz), mult(rotateX(rx), mult(rotateY(ry), mult(rotateZ(rz), scalem(sx, sy, sz)))));
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniformMatrix4fv(mViewLocation, false, flatten(mView));
    gl.uniformMatrix4fv(mProjectionLocation, false, flatten(mProjection));

    for (var i = 0; i < nInstances; i++) {
        gl.uniformMatrix4fv(mModelLocation, false, flatten(instances[i].m));
        instances[i].f(gl, program, isFilled);
    }
    requestAnimFrame(render);
}