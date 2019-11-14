function addEventListeners()
{
    canvas.addEventListener("wheel", function(){zoomCanvas(event);});
    addEventListener("keypress", keyPress);
    window.addEventListener('resize', updateCanvas, false);

    document.getElementById("reset").addEventListener("click", function() {reset();});
   
    objectEventListeners();

    orthogonalEventListeners();

    axonometricEventListeners();

    obliqueEventListeners();
    
    perspectiveEventListeners();

}

function objectEventListeners()
{
    document.getElementById("object").addEventListener("click", function() {openTab("object")});
    
    document.getElementById("cube").addEventListener("click", function () {create('cube');});
    document.getElementById("sphere").addEventListener("click", function () {create('sphere')});
    document.getElementById("cylinder").addEventListener("click", function () {create('cylinder')});
    document.getElementById("torus").addEventListener("click", function () {create('torus')});
    document.getElementById("bunny").addEventListener("click", function () {create('bunny')});
    document.getElementById("superquadric").addEventListener("click", function () {create('superquadric')});

    document.getElementById("superQuadricSlidersContainer").addEventListener("input", function(){
        e1 = document.getElementById("e1Range").value;
        e2 = document.getElementById("e2Range").value;
    });
}

function orthogonalEventListeners()
{
    document.getElementById("orthogonal").addEventListener("click", function() {openTab("orthogonal")});

    document.getElementById("mainElevation").addEventListener("click", function()
    {
        mView = MAIN_ELEVATION_ORTHO;
    });
    document.getElementById("floorPlan").addEventListener("click", function()
    {
        mView = PLANE_FLOOR_ORTHO;
    });
    document.getElementById("rightElevation").addEventListener("click", function()
    {
        mView = RIGHT_ELEVATION_ORTHO;
    });
}

function axonometricEventListeners()
{
    document.getElementById("axonometric").addEventListener("click", function() {openTab("axonometric")});
    
    document.getElementById("isometric").addEventListener("click", function()
    {
        document.getElementById("axoFreeContainer").style.display = "none";
        mView = ISOMETRIC_AXONO;
    });
    document.getElementById("dimetric").addEventListener("click", function()
    {
        document.getElementById("axoFreeContainer").style.display = "none";
        mView = DIMETRIC_AXONO;
    });
    document.getElementById("trimetric").addEventListener("click", function()
    {
        document.getElementById("axoFreeContainer").style.display = "none";
        mView = TRIMETRIC_AXONO;
    });

    document.getElementById("axoFreeContainer").addEventListener("input", function(){
        mView = axonometricMatrix();
    });

    document.getElementById("freeAxo").addEventListener("click", function()
    {
        document.getElementById("axoFreeContainer").style.display = "block";
    });
}

function obliqueEventListeners()
{
    document.getElementById("oblique").addEventListener("click", function() 
    {
        openTab("oblique");
    });
    document.getElementById("cavalier").addEventListener("click", function()
    {
        document.getElementById("oblFreeContainer").style.display = "none";
        mView = CAVALIER_OBL;
    });
    document.getElementById("cabinet").addEventListener("click", function()
    {
        document.getElementById("oblFreeContainer").style.display = "none";
        mView = CABINET_OBL;
    });
    document.getElementById("oblFreeContainer").addEventListener("input", function()
    {
        mView = obliqueMatrix();
    });
    document.getElementById("freeObl").addEventListener("click", function()
    {
        document.getElementById("oblFreeContainer").style.display = "block";
        mView = obliqueMatrix();
    });
}

function perspectiveEventListeners()
{
    document.getElementById("perspective").addEventListener("click", function() 
    {
        openTab("perspective");
    });

    document.getElementById("dvalue").addEventListener("input", function(){
        d = document.getElementById("dvalue").value;
        mView = mat4();
        mView[3][3] = 0;
        mView[3][2] = -(1/d);
        
    });
}