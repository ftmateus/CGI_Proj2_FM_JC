var gl; var program, canvas;
//var instances = []; var nInstances = 0;
var currentInstance;
var tx = 0; var ty = 0; var tz = 0;
var rx = 0; var ry = 0; var rz = 0;
var sx = 1; var sy = 1; var sz = 1;
var zoom = 1;
var mView, mViewLocation; var mProjection, mProjectionLocation; var mModel, mModelLocation;
var isFilled = false, cullFace = false, zBuffer = false;
const HEIGHT_RATIO = 0.6;
var zoom = 1;
//const CTM = mult(mat4(), scalem(1,canvas.width/canvas.height, 1));

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    
    // Configure WebGL
    updateCanvas();
    gl.clearColor(0.5, 0.5, 0.5, 1.0);

    initObjects();
    create('cube');

    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    mModelLocation = gl.getUniformLocation(program, "mModel");
    mViewLocation = gl.getUniformLocation(program, "mView");
    mProjectionLocation = gl.getUniformLocation(program, "mProjection");

    addEventListeners();

    render();
}

function initObjects()
{
    cubeInit(gl);
    sphereInit(gl);
    cylinderInit(gl);
    torusInit(gl);
    bunnyInit(gl);
}

function handleWheel(e)
{
    var e_delta = (e.deltaY || -e.wheelDelta || e.detail);
    var delta =  e_delta && ((e_delta >> 10) || 1) || 0;
    zoom *= (delta > 0 || event.detail > 0) ? 1.1 : 0.9;
    updateCanvas();
    currentInstance.m = mat4();
}

function addEventListeners()
{
    document.getElementById("cube").addEventListener("click", function () {create('cube');});
    document.getElementById("sphere").addEventListener("click", function () {create('sphere')});
    document.getElementById("cylinder").addEventListener("click", function () {create('cylinder')});
    document.getElementById("torus").addEventListener("click", function () {create('torus')});
    document.getElementById("bunny").addEventListener("click", function () {create('bunny')});
    canvas.addEventListener("wheel", function(){handleWheel(event);});
    addEventListener("keypress", keyPress);
    window.addEventListener('resize', updateCanvas, false);
}

function updateCanvas()
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight*HEIGHT_RATIO;
    var aspectRatio = canvas.width/canvas.height;
    gl.viewport(0,0, canvas.width, canvas.height);

    var at = [0, 0, 0];
    var eye = [1, 1, 1];
    var up = [0, 1, 0];
    mView = lookAt(eye, at, up);
    mProjection = ortho(-1*aspectRatio * zoom, 1*aspectRatio * zoom, -1 * zoom, 1*zoom, 10, -10);
}

function keyPress(ev)
{
    switch (ev.key)
    {
        case 'w': isFilled = false; break;
        case 'f': isFilled = true; break;
        case 'b': 
            if (cullFace = !cullFace) gl.enable(gl.CULL_FACE);
            else gl.disable(gl.CULL_FACE);
        break;
        case 'z': 
            if (zBuffer = !zBuffer) gl.enable(gl.DEPTH_TEST);
            else gl.disable(gl.DEPTH_TEST);
        break; //Z-buffer 
    }
}

function create(type) {
    tx = 0; ty = 0; tz = 0;
    rx = 0; ry = 0; rz = 0;
    sx = 1; sy = 1; sz = 1;
    var m = mat4(); //mult(translate(tx, ty, tz), mult(rotateX(rx), mult(rotateY(ry), mult(rotateZ(rz), scalem(1, canvas.width/canvas.height, 1)))));
    switch(type)
    {
        
        case 'cube': currentInstance = {m: m, f: cubeDraw}; break;
        case 'sphere':  currentInstance = {m: m, f: sphereDraw}; break;
        case 'cylinder': currentInstance = {m: m, f: cylinderDraw}; break;
        case 'torus': currentInstance = {m: m, f: torusDraw}; break;
        case 'bunny': currentInstance = {m: m, f: bunnyDraw}; break;
    }
    document.getElementById(type).checked = true;
    updateCanvas();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(mViewLocation, false, flatten(mView));
    gl.uniformMatrix4fv(mProjectionLocation, false, flatten(mProjection));

    gl.uniformMatrix4fv(mModelLocation, false, flatten(currentInstance.m));
    gl.cullFace(gl.BACK);
    
    currentInstance.f(gl, program, isFilled);
        
    requestAnimFrame(render);
}