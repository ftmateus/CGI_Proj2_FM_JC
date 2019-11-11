var gl; var programDefault, programSuperQuad, canvas;
var currentInstance;
var tx = 0; var ty = 0; var tz = 0;
var rx = 0; var ry = 0; var rz = 0;
var sx = 1; var sy = 1; var sz = 1;
var zoom = 1;
var mView, mViewLocation; var mProjection, mProjectionLocation; var mModel, mModelLocation;
var isFilled = false, cullFace = false, zBuffer = false;
const HEIGHT_RATIO = 0.6;
var zoom = 1;
var at = [0, 0, 0];
var eye = [1, 1, 1];
var up = [0, 1, 0];
var e1 = 1, e2 = 1; // e1 was at 5
var currentProgram


window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    openTab("object"); 
    
    // Configure WebGL
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    updateCanvas();
    
    // Load shaders and initialize attribute buffers
    programDefault = initShaders(gl, "vertex-shader-default", "fragment-shader");
    programSuperQuad = initShaders(gl, "vertex-shader-superquad", "fragment-shader");

    initObjects();
    create('cube');

    gl.useProgram(programDefault);

    addEventListeners();

    render();
}

function openTab(tabName) 
{
    // Hide all tabs
    var tabContent = document.getElementsByClassName("tabStyle");
    var tabLinks = document.getElementsByClassName("buttonStyle");
    for (var i=0; i<tabContent.length; i++)
        tabContent[i].style.display = "none";
    for (var i=0; i<tabLinks.length; i++)
    {
        //tabLinks[i].className = tabLinks[i].className.replace(" active", "");
        tabLinks[i].style.backgroundColor = "blue";
    }
    document.getElementById(tabName).style.backgroundColor = "red";

    // Activate the requested tab and append 'active' to their class name
    document.getElementById(tabName+"Tab").style.display = "block";
    /*
    var elems = document.getElementsByClassName("buttonsContainer")
    for (var i=0; i<elems.length; i++)
    {
        if (elems[i].innerHTML == tabName)
        {
            elems[i].className += " active";
            break;
        }
    }*/
}

function initObjects()
{
    cubeInit(gl);
    sphereInit(gl);
    cylinderInit(gl);
    torusInit(gl);
    bunnyInit(gl);
    superquadricInit(gl, programSuperQuad);
}

function zoomCanvas(e)
{
    var e_delta = (e.deltaY || -e.wheelDelta || e.detail);
    var delta =  e_delta && ((e_delta >> 10) || 1) || 0;
    zoom *= (delta > 0 || event.detail > 0) ? 1.1 : 0.9;
    updateCanvas();
}

function addEventListeners()
{
    document.getElementById("cube").addEventListener("click", function () {create('cube');});
    document.getElementById("sphere").addEventListener("click", function () {create('sphere')});
    document.getElementById("cylinder").addEventListener("click", function () {create('cylinder')});
    document.getElementById("torus").addEventListener("click", function () {create('torus')});
    document.getElementById("bunny").addEventListener("click", function () {create('bunny')});
    document.getElementById("superquadric").addEventListener("click", function () {create('superquadric')});
    canvas.addEventListener("wheel", function(){zoomCanvas(event);});
    addEventListener("keypress", keyPress);
    window.addEventListener('resize', updateCanvas, false);
    document.getElementById("object").addEventListener("click", function() {openTab("object")});
    document.getElementById("orthogonal").addEventListener("click", function() {openTab("orthogonal")});
    document.getElementById("axonometric").addEventListener("click", function() {openTab("axonometric")});
    document.getElementById("oblique").addEventListener("click", function() {openTab("oblique")});
    document.getElementById("perspective").addEventListener("click", function() {openTab("perspective")});
    document.getElementById("generic").addEventListener("click", function() {openTab("generic")});
    document.getElementById("e1Range").addEventListener("input", function(){
        e1 = document.getElementById("e1Range").value
    });
    document.getElementById("e2Range").addEventListener("input", function(){
        e2 = document.getElementById("e2Range").value
    });
}

function updateCanvas()
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight*HEIGHT_RATIO;
    var aspectRatio = canvas.width/canvas.height;
    gl.viewport(0,0, canvas.width, canvas.height);
        
    mView = lookAt(eye, at, up);
    mProjection = mult(ortho(-1*aspectRatio, 1*aspectRatio, -1, 1, 10, -10), scalem(zoom, zoom, 1));
}   

function renderText()
{
    document.getElementById("zbuffer").textContent = zBuffer;
    document.getElementById("backculling").textContent = cullFace;
}


function keyPress(ev)
{
    switch (ev.key)
    {
        case 'w': isFilled = false; break;
        case 'f': isFilled = true; break;
        case 'b': 
            if (cullFace = !cullFace) 
            {
                gl.enable(gl.CULL_FACE);
                gl.frontFace(gl.CCW);
            }
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
    if (type == "superquadric")
    {
        document.getElementById("slidersContainer").style.display = "block";
        currentProgram = programSuperQuad;
    }
    else
    {
        document.getElementById("slidersContainer").style.display = "none";
        currentProgram = programDefault;
    }
    
    gl.useProgram(currentProgram);

    var m = mat4();
    switch(type)
    {    
        case 'cube': currentInstance = {m: m, draw: cubeDraw}; break;
        case 'sphere':  currentInstance = {m: m, draw: sphereDraw}; break;
        case 'cylinder': currentInstance = {m: m, draw: cylinderDraw}; break;
        case 'torus': currentInstance = {m: m, draw: torusDraw}; break;
        case 'bunny': currentInstance = {m: m, draw: bunnyDraw}; break;
        case 'superquadric': currentInstance = {m: m, draw: superquadricDraw}; break;
    }
        
    document.getElementById(type).checked = true;
    zoom = 1;
    updateCanvas();
}

function render() {
    gl.useProgram(currentProgram);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mModelLocation = gl.getUniformLocation(currentProgram, "mModel");
    mViewLocation = gl.getUniformLocation(currentProgram, "mView");
    mProjectionLocation = gl.getUniformLocation(currentProgram, "mProjection");

    gl.uniformMatrix4fv(mViewLocation, false, flatten(mView));
    gl.uniformMatrix4fv(mProjectionLocation, false, flatten(mProjection));
    gl.uniformMatrix4fv(mModelLocation, false, flatten(currentInstance.m));

    gl.cullFace(gl.BACK);
    
    currentInstance.draw(gl, currentProgram, isFilled, e1, e2);
        
    renderText();
    requestAnimFrame(render);
}