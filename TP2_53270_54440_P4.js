var gl, programDefault, programSuperQuad, canvas;
var currentInstance;
var zoom = 1;
var mView, mViewLocation; var mProjection, mProjectionLocation; var mModel, mModelLocation;
var isFilled = false, cullFace = false, zBuffer = false;
const HEIGHT_RATIO = 0.6;
var zoom = 1;
var e1 = 1, e2 = 1;
var d = 0;
const MAIN_ELEVATION_ORTHO = mat4();//lookAt([1, 0, 0], [0, 0, 0], [0, 1, 0]);
const PLANE_FLOOR_ORTHO = rotateX(90);
const RIGHT_ELEVATION_ORTHO = rotateY(-90);

const ISOMETRIC_AXONO = axonometricMatrix(30,30);//lookAt([1, 1, 1], [0, 0, 0], [0, 1, 0]);
const DIMETRIC_AXONO = axonometricMatrix(42,7);
const TRIMETRIC_AXONO = axonometricMatrix(54.27, 23.27);

const CAVALIER_OBL = obliqueMatrix(1, 45);
const CABINET_OBL = obliqueMatrix(0.5, 45);

const ZBUFFER_KEY = 'z', BACKFACE_CULLING_KEY = 'b';
const WIRED_FRAME_KEY = 'w', FILLED_KEY = 'f';


window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    
    // Configure WebGL
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    
    // Load shaders and initialize attribute buffers
    programDefault = initShaders(gl, "vertex-shader-default", "fragment-shader");
    programSuperQuad = initShaders(gl, "vertex-shader-superquad", "fragment-shader");

    initObjects();
    reset();
    create('cube');

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
        tabLinks[i].style.backgroundColor = "blue";

    document.getElementById(tabName).style.backgroundColor = "red";

    // Activate the requested tab
    document.getElementById(tabName+"Tab").style.display = "block";
}

function initObjects()
{
    cubeInit(gl);
    sphereInit(gl);
    cylinderInit(gl);
    torusInit(gl);
    bunnyInit(gl);
    superquadricInit(gl);
}

function zoomCanvas(e)
{
    var e_delta = (e.deltaY || -e.wheelDelta || e.detail);
    var delta =  e_delta && ((e_delta >> 10) || 1) || 0;
    zoom *= (delta > 0 || event.detail > 0) ? 1.1 : 0.9;
    updateCanvas();
}

/**
 * Converts from radians to degrees.
 * @param {} theta value in radians to be converted.
 */
function degrees(theta)
{
    return (theta * 180)/Math.PI;
}

/**
 * Creates an axonometric view matrix with a and b values.
 * If no values are specified, creates a matrix with values from
 * the free axonometric projection sliders.
 * @param {*} a 
 * @param {*} b 
 */
function axonometricMatrix(a, b){
    if (_argumentsToArray( arguments ).length == 0)
    {
        a = document.getElementById("alphaAxo").value;
        b = document.getElementById("betaAxo").value;
        return mult(rotateX(a),rotateY(b));
    }
    var A = radians(a);
    var B = radians(b);
    var gamma = Math.asin(Math.sqrt(Math.tan(A)*Math.tan(B)));
    var theta = Math.atan(Math.sqrt(Math.tan(A)/Math.tan(B)))-(Math.PI/2);
    //console.log(r3, r1,  a, b);
    return mult(rotateX(degrees(gamma)),rotateY(degrees(theta)));
}

/**
 * Creates an oblique view matrix with gamma and theta values.
 * If no values are specified, creates a matrix with values from
 * the free oblique projection sliders.
 * @param {} gamma 
 * @param {} theta 
 */
function obliqueMatrix(gamma, theta)
{
    if (_argumentsToArray( arguments ).length == 0) 
    {
        gamma = document.getElementById("gammaObl").value;
        theta = document.getElementById("thetaObl").value;
    }
    m = mat4();
    m[2][2]= 0;
    m[0][2] = -gamma*Math.cos(radians(theta));
    m[1][2] = -gamma*Math.sin(radians(theta));
    return m;
}

function updateCanvas()
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight*HEIGHT_RATIO;
    var aspectRatio = canvas.width/canvas.height;
    gl.viewport(0,0, canvas.width, canvas.height);
    
    mProjection = mult(ortho(-1*aspectRatio, 1*aspectRatio, -1, 1, 10, -10), scalem(zoom, zoom, 1));
}   

function renderOverlay()
{
    document.getElementById("zbuffer").textContent = zBuffer;
    document.getElementById("backfaceculling").textContent = cullFace;
}

/**
 * Switches the current object to the
 * selected object.
 */
function switchObject()
{
    var selectedValue = document.querySelector('input[name="shape"]:checked').value;
    create(selectedValue);
}

/**
 * Switches the current projection to the 
 * selected orthogonal projection. Implements 
 * the memory interface.
 */
function switchOrthogonal()
{
    var selectedValue = document.querySelector('input[name="ortProjection"]:checked').value;
    switch(selectedValue)
    {
        case "mainElevation": mView = MAIN_ELEVATION_ORTHO; break;
        case "lateralRightElevation": mView = RIGHT_ELEVATION_ORTHO; break;
        case "floorPlan": mView = PLANE_FLOOR_ORTHO; break;
    }
}

/**
 * Switches the current projection to the 
 * selected axonometric projection. Implements 
 * the memory interface.
 */
function switchAxonometric()
{
    document.getElementById("axoFreeContainer").style.display = "none";
    var selectedValue = document.querySelector('input[name="axoProjection"]:checked').value;
    switch(selectedValue)
    {
        case "Isometric": mView = ISOMETRIC_AXONO; break;
        case "Dimetric": mView = DIMETRIC_AXONO; break;
        case "Trimetric": mView = TRIMETRIC_AXONO; break;
        case "Free": 
            mView = axonometricMatrix(); 
            document.getElementById("axoFreeContainer").style.display = "block";
            break;
    }
}

/**
 * Switches the current projection to the 
 * selected oblique projection. Implements 
 * the memory interface.
 */
function switchOblique()
{
    document.getElementById("oblFreeContainer").style.display = "none";
    var selectedValue = document.querySelector('input[name="oblProjection"]:checked').value;
    switch(selectedValue)
    {
        case "Cavalier": mView = CAVALIER_OBL; break;
        case "Cabinet": mView = CABINET_OBL; break;
        case "Free":
            mView = obliqueMatrix();
            document.getElementById("oblFreeContainer").style.display = "block";
            break;
    }
}

function reset()
{
    mView = DIMETRIC_AXONO;
        
    document.getElementById("gammaObl").value = 0;
    document.getElementById("thetaObl").value = 0;
    document.getElementById("alphaAxo").value = 1;
    document.getElementById("betaAxo").value = 1;

    document.getElementById("gammaOblOut").value = 0;
    document.getElementById("thetaOblOut").value = 0;
    document.getElementById("alphaAxoOut").value = 1;
    document.getElementById("betaAxoOut").value = 1;

    document.getElementById("oblFreeContainer").style.display = "none";
    document.getElementById("axoFreeContainer").style.display = "none";

    document.getElementById("dvalue").value = 0;

    document.getElementById("mainElevation").checked = true;
    document.getElementById("dimetric").checked = true;
    document.getElementById("cavalier").checked = true;
    openTab("object"); 
    create("cube");
    updateCanvas();
}

/**
 * Handles key selection.
 * @param {*} ev 
 */
function keyPress(ev)
{
    switch (ev.key.toLowerCase())
    {
        case WIRED_FRAME_KEY: isFilled = false; break;
        case FILLED_KEY: isFilled = true; break;
        case BACKFACE_CULLING_KEY: 
            if (cullFace = !cullFace) 
            {
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.BACK);
                gl.frontFace(gl.CCW);
            }
            else gl.disable(gl.CULL_FACE);
        break;
        case ZBUFFER_KEY: 
            if (zBuffer = !zBuffer) gl.enable(gl.DEPTH_TEST);
            else gl.disable(gl.DEPTH_TEST);
        break;
    }
}

/**
 * Creates a shape.
 * @param {*} type 
 */
function create(type) 
{
    document.getElementById("superQuadricSlidersContainer").style.display = "none";
    switch(type)
    {    
        case 'cube': currentInstance = {draw: cubeDraw, program: programDefault}; break;
        case 'sphere':  currentInstance = {draw: sphereDraw, program: programDefault}; break;
        case 'cylinder': currentInstance = {draw: cylinderDraw, program: programDefault}; break;
        case 'torus': currentInstance = {draw: torusDraw, program: programDefault}; break;
        case 'bunny': currentInstance = {draw: bunnyDraw, program: programDefault}; break;
        case 'superquadric': 
            currentInstance = {draw: superquadricDraw, program: programSuperQuad}; 
            document.getElementById("superQuadricSlidersContainer").style.display = "block"; break;
    }
        
    document.getElementById(type).checked = true;
    zoom = 1;
    updateCanvas();
}

function render() {
    gl.useProgram(currentInstance.program);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mModelLocation = gl.getUniformLocation(currentInstance.program, "mModel");
    mViewLocation = gl.getUniformLocation(currentInstance.program, "mView");
    mProjectionLocation = gl.getUniformLocation(currentInstance.program, "mProjection");

    gl.uniformMatrix4fv(mViewLocation, false, flatten(mView));
    gl.uniformMatrix4fv(mProjectionLocation, false, flatten(mProjection));
    gl.uniformMatrix4fv(mModelLocation, false, flatten(mat4()));

    currentInstance.draw(gl, currentInstance.program, isFilled, e1, e2);
        
    renderOverlay();
    requestAnimFrame(render);
}