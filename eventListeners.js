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
    
    document.getElementById("objectForm").addEventListener("click", function()
    {
        switchObject();
    });
    document.getElementById("superQuadricSlidersContainer").addEventListener("input", function(){
        e1 = document.getElementById("e1Range").value;
        e2 = document.getElementById("e2Range").value;
    });
}

function orthogonalEventListeners()
{
    document.getElementById("orthogonal").addEventListener("click", function() {
        openTab("orthogonal");
        switchOrthogonal();
    });

    document.getElementById("orthogonalForm").addEventListener("click", function() {
        switchOrthogonal();
    });
}

function axonometricEventListeners()
{
    document.getElementById("axonometric").addEventListener("click", function() {
        openTab("axonometric");
        switchAxonometric();
    });

    document.getElementById("axonometricForm").addEventListener("click", function() {
        switchAxonometric();
    });

    document.getElementById("axoFreeContainer").addEventListener("input", function(){
        mView = axonometricMatrix();
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