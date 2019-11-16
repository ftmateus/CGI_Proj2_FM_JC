function addEventListeners()
{
    canvas.addEventListener("wheel", function(){zoomCanvas(event);});
    addEventListener("keypress", keyPress);
    window.addEventListener('resize', updateCanvas, false);
    document.getElementById("reset").addEventListener("click", reset);
    objectEventListeners();
    orthogonalEventListeners();
    axonometricEventListeners();
    obliqueEventListeners();
    perspectiveEventListeners();
}

function objectEventListeners()
{
    document.getElementById("object").addEventListener("click", function() {openTab("object")});
    
    document.getElementById("objectForm").addEventListener("click", switchObject);
    
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

    document.getElementById("orthogonalForm").addEventListener("click", switchOrthogonal);
}

function axonometricEventListeners()
{
    document.getElementById("axonometric").addEventListener("click", function() {
        openTab("axonometric");
        switchAxonometric();
    });

    document.getElementById("axonometricForm").addEventListener("click", switchAxonometric);

    document.getElementById("axoFreeContainer").addEventListener("input", function(){
        mView = axonometricMatrix();
    });
}

function obliqueEventListeners()
{
    document.getElementById("oblique").addEventListener("click", function() 
    {
        openTab("oblique");
        switchOblique();
    });
    document.getElementById("obliqueForm").addEventListener("click", switchOblique);

    document.getElementById("oblFreeContainer").addEventListener("input", function()
    {
        mView = obliqueMatrix();
    });
}

function perspectiveEventListeners()
{
    document.getElementById("perspective").addEventListener("click", function() 
    {
        openTab("perspective");
        d = document.getElementById("dvalue").value;
        mView = perspectiveMatrix(d);
    });

    document.getElementById("dvalue").addEventListener("input", function(){
        d = document.getElementById("dvalue").value;
        mView = perspectiveMatrix(d);
    });
}