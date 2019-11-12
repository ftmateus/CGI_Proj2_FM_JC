var superquad_points = [];
var superquad_normals = [];
var superquad_faces = [];
var superquad_edges = [];

var superquad_points_buffer;
var superquad_normals_buffer;
var superquad_faces_buffer;
var superquad_edges_buffer;

var SUPERQUAD_LATS=20;
var SUPERQUAD_LONS=30;

var programSup;

function superquadricInit(gl, nlat, nlon) {
    nlat = nlat | SUPERQUAD_LATS;
    nlon = nlon | SUPERQUAD_LONS;
    superquadricBuild(nlat, nlon);
    superquadricUploadData(gl);
}

function expOperator(x, y)
{
    return Math.sign(x)*Math.pow(Math.abs(x), y);
}
// Generate points using polar coordinates
function superquadricBuild(nlat, nlon) 
{
    // phi will be latitude
    // theta will be longitude
    
    var d_phi = Math.PI / (nlat+1);
    var d_theta = 2*Math.PI / nlon;
    var r = 0.5;
    
    
    // Generate north polar cap
    var north = vec3(0,r,0);
    var northData = vec3(Math.PI/2, Math.PI/2, r);
    superquad_points.push(northData);
    superquad_normals.push(vec3(0,1,0));
    
    
    // Generate middle
    for(var i=0, phi=Math.PI/2-d_phi; i<nlat; i++, phi-=d_phi) {
        for(var j=0, theta=0; j<nlon; j++, theta+=d_theta) {
            var pt = vec3(theta, phi, r);
            superquad_points.push(pt);
            var p = vec3(r*Math.cos(phi)*Math.cos(theta),r*Math.sin(phi),r*Math.cos(phi)*Math.sin(theta));
            var n = vec3(p);
            superquad_normals.push(normalize(n));
        }
    }
    
    // Generate norh south cap
    var south = vec3(0,-r,0);
    var southData = vec3(Math.PI/2, Math.PI/2, -r);
    superquad_points.push(southData);
    superquad_normals.push(vec3(0,-1,0));


    // Generate the faces
    
    // north pole faces
    for(var i=0; i<nlon-1; i++) {
        superquad_faces.push(0);
        superquad_faces.push(i+2);
        superquad_faces.push(i+1);
    }
    superquad_faces.push(0);
    superquad_faces.push(1);
    superquad_faces.push(nlon);
    
    // general middle faces
    var offset=1;
    
    for(var i=0; i<nlat-1; i++) {
        for(var j=0; j<nlon-1; j++) {
            var p = offset+i*nlon+j;
            superquad_faces.push(p);
            superquad_faces.push(p+nlon+1);
            superquad_faces.push(p+nlon);
            
            superquad_faces.push(p);
            superquad_faces.push(p+1);
            superquad_faces.push(p+nlon+1);
        }
        var p = offset+i*nlon+nlon-1;
        superquad_faces.push(p);
        superquad_faces.push(p+1);
        superquad_faces.push(p+nlon);

        superquad_faces.push(p);
        superquad_faces.push(p-nlon+1);
        superquad_faces.push(p+1);
    }
    
    // south pole faces
    var offset = 1 + (nlat-1) * nlon;
    for(var j=0; j<nlon-1; j++) {
        superquad_faces.push(offset+nlon);
        superquad_faces.push(offset+j);
        superquad_faces.push(offset+j+1);
    }
    superquad_faces.push(offset+nlon);
    superquad_faces.push(offset+nlon-1);
    superquad_faces.push(offset);
 
    // Build the edges
    for(var i=0; i<nlon; i++) {
        superquad_edges.push(0);   // North pole 
        superquad_edges.push(i+1);
    }

    for(var i=0; i<nlat; i++, p++) {
        for(var j=0; j<nlon;j++, p++) {
            var p = 1 + i*nlon + j;
            superquad_edges.push(p);   // horizontal line (same latitude)
            if(j!=nlon-1) 
                superquad_edges.push(p+1);
            else superquad_edges.push(p+1-nlon);
            
            if(i!=nlat-1) {
                superquad_edges.push(p);   // vertical line (same longitude)
                superquad_edges.push(p+nlon);
            }
            else {
                superquad_edges.push(p);
                superquad_edges.push(superquad_points.length-1);
            }
        }
    }
    
}

function superquadricUploadData(gl, program)
{

    gl.useProgram(program);

    superquad_points_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, superquad_points_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(superquad_points), gl.STATIC_DRAW);
    
    superquad_normals_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, superquad_normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(superquad_normals), gl.STATIC_DRAW);
    
    superquad_faces_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, superquad_faces_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(superquad_faces), gl.STATIC_DRAW);
    
    superquad_edges_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, superquad_edges_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(superquad_edges), gl.STATIC_DRAW);
}

function superquadricDrawWireFrame(gl, program)
{    
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, superquad_points_buffer);
    var thetaAttrib = gl.getAttribLocation(program, "theta");
    gl.vertexAttribPointer(thetaAttrib, 1, gl.FLOAT, false, 4+4+4, 0);
    gl.enableVertexAttribArray(thetaAttrib);

    var phiAttrib = gl.getAttribLocation(program, "phi");
    gl.vertexAttribPointer(phiAttrib, 1, gl.FLOAT, false, 4+4+4, 4);
    gl.enableVertexAttribArray(phiAttrib);

    gl.bindBuffer(gl.ARRAY_BUFFER, superquad_points_buffer);
    var rAttrib = gl.getAttribLocation(program, "r");
    gl.vertexAttribPointer(rAttrib, 1, gl.FLOAT, false, 4+4+4, 4+4);
    gl.enableVertexAttribArray(rAttrib);

    gl.bindBuffer(gl.ARRAY_BUFFER, superquad_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, superquad_edges_buffer);
    gl.drawElements(gl.LINES, superquad_edges.length, gl.UNSIGNED_SHORT, 0);
}

function superquadricDrawFilled(gl, program)
{
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, superquad_points_buffer);
    var thetaAttrib = gl.getAttribLocation(program, "theta");
    gl.vertexAttribPointer(thetaAttrib, 1, gl.FLOAT, false, 4+4+4, 0);
    gl.enableVertexAttribArray(thetaAttrib);

    gl.bindBuffer(gl.ARRAY_BUFFER, superquad_points_buffer);
    var phiAttrib = gl.getAttribLocation(program, "phi");
    gl.vertexAttribPointer(phiAttrib, 1, gl.FLOAT, false, 4+4+4, 4);
    gl.enableVertexAttribArray(phiAttrib);

    gl.bindBuffer(gl.ARRAY_BUFFER, superquad_points_buffer);
    var rAttrib = gl.getAttribLocation(program, "r");
    gl.vertexAttribPointer(rAttrib, 1, gl.FLOAT, false, 4+4+4, 4+4);
    gl.enableVertexAttribArray(rAttrib);

    gl.bindBuffer(gl.ARRAY_BUFFER, superquad_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, superquad_faces_buffer);
    gl.drawElements(gl.TRIANGLES, superquad_faces.length, gl.UNSIGNED_SHORT, 0);
}

function superquadricDraw(gl, program, filled=false, e1, e2) {
    var e1Loc = gl.getUniformLocation(program, "e1");
    var e2Loc = gl.getUniformLocation(program, "e2");

    gl.uniform1f(e1Loc, e1);
    gl.uniform1f(e2Loc, e2);
	if(filled) superquadricDrawFilled(gl, program);
	else superquadricDrawWireFrame(gl, program);
}