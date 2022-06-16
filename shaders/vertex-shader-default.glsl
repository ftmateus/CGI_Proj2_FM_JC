attribute vec4 vPosition;
attribute vec4 vNormal;

uniform mat4 mProjection;
uniform mat4 mView;
uniform mat4 mModel;

varying vec4 color;
void main(){
    gl_Position = mProjection * mView * mModel * vPosition;
    color = vNormal;
}