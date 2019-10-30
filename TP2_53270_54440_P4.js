var gl; var program, canvas;
//var instances = []; var nInstances = 0;
var currentInstance;
var tx = 0; var ty = 0; var tz = 0;
var rx = 0; var ry = 0; var rz = 0;
var sx = 1; var sy = 1; var sz = 1;
var mView; var mProjection; var mModel; var mModelLocation;
var isFilled = false;
var colors = [
    vec3(1,0,0),
    vec3(0,1,0),
    vec3(0,0,1)
];
//const CTM = mult(mat4(), scalem(1,canvas.width/canvas.height, 1));

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    
    // Configure WebGL
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - window.innerHeight*0.3;
    gl.viewport(0,0, canvas.width, canvas.height);
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

canvas.onwheel = function()
{

}

function addEventListeners()
{
    /*
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
    {sz = this.value; updateMatrixModel();});*/
    document.getElementById("cube").addEventListener("click", function () {create('cube');});
    document.getElementById("sphere").addEventListener("click", function () {create('sphere')});
    document.getElementById("cylinder").addEventListener("click", function () {create('cylinder')});
    document.getElementById("torus").addEventListener("click", function () {create('torus')});
    document.getElementById("bunny").addEventListener("click", function () {create('bunny')});
    //document.getElementById("resetCurrent").addEventListener("click", resetCurrent);
    //document.getElementById("resetAll").addEventListener("click", resetAll);
    addEventListener("keypress", keyPress);
    window.addEventListener('resize', resizeCanvas, false);
}

function resizeCanvas()
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - window.innerHeight*0.3;
    gl.viewport(0,0, canvas.width, canvas.height);
    var sxTemp = canvas.height/canvas.width >= 1 ? canvas.height/canvas.width : 1;
    var syTemp = canvas.width/canvas.height >= 1 ? canvas.width/canvas.height : 1;
    currentInstance.m = mult(mat4(), scalem(1,syTemp, 1));
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
    var m = mult(mat4(), scalem(1,canvas.width/canvas.height, 1)); //mult(translate(tx, ty, tz), mult(rotateX(rx), mult(rotateY(ry), mult(rotateZ(rz), scalem(1, canvas.width/canvas.height, 1)))));
    switch(type)
    {
        
        case 'cube': currentInstance = {m: m, f: cubeDraw}; break;
        case 'sphere':  currentInstance = {m: m, f: sphereDraw}; break;
        case 'cylinder': currentInstance = {m: m, f: cylinderDraw}; break;
        case 'torus': currentInstance = {m: m, f: torusDraw}; break;
        case 'bunny': currentInstance = {m: m, f: bunnyDraw}; break;
    }
    document.getElementById(type).checked = true;
    //nInstances++;
}

function resetCurrent() {
    tx = 0; ty = 0; tz = 0;
    rx = 0; ry = 0; rz = 0;
    sx = 1; sy = 1; sz = 1;

    //updateMatrixModel();
}
/*
function resetAll() {
    //instances = [];
    //nInstances = 0;
    create('cube');
    resetCurrent();
}*/
/*
function updateMatrixModel() {
    /*instances[nInstances - 1].mcurrentInstance.m = mult(translate(tx, ty, tz), mult(rotateX(rx), mult(rotateY(ry), mult(rotateZ(rz), scalem(sx, sy, sz)))));
}*/

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(mViewLocation, false, flatten(mView));
    gl.uniformMatrix4fv(mProjectionLocation, false, flatten(mProjection));
    /*
    for (var i = 0; i < nInstances; i++) {
        gl.uniformMatrix4fv(mModelLocation, false, flatten(instances[i].m));
        instances[i].f(gl, program, isFilled);
    }*/
    gl.uniformMatrix4fv(mModelLocation, false, flatten(currentInstance.m));
    currentInstance.f(gl, program, isFilled);
    requestAnimFrame(render);
}