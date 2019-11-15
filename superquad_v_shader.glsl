attribute float theta;
attribute float phi;
attribute float r;
attribute vec4 vNormal;

uniform mat4 mProjection;
uniform mat4 mView;
uniform mat4 mModel;
uniform float e1;
uniform float e2;

varying vec4 color;

float expOperator(float x, float y)
{
    return sign(x)*pow(abs(x), y);
}

void main()
{
    gl_PointSize = 10.0;
    vec4 vPosition;
    vPosition.x = r*expOperator(cos(phi), e1)*expOperator(cos(theta), e2);
    vPosition.y = r*expOperator(sin(phi), e1);
    vPosition.z = r*expOperator(cos(phi), e1)*expOperator(sin(theta), e2);
    vPosition.w = 1.0;
    gl_Position = mProjection * mView * mModel * vPosition;
    color = vNormal;

}