#version 440

// Gaussian blur fragment shader for WebShell containers
// This provides compositor-level background blur for transparent containers

layout(location = 0) in vec2 qt_TexCoord0;
layout(location = 0) out vec4 fragColor;

layout(std140, binding = 0) uniform buf {
    mat4 qt_Matrix;
    float qt_Opacity;
    float blurRadius;
    vec2 textureSize;
} ubuf;

layout(binding = 1) uniform sampler2D source;

// Gaussian blur weights for 9-tap blur
const float weights[9] = float[](
    0.0947416,
    0.118318,
    0.0947416,
    0.118318,
    0.147761,
    0.118318,
    0.0947416,
    0.118318,
    0.0947416
);

void main() {
    vec2 texelSize = 1.0 / ubuf.textureSize;
    float radius = ubuf.blurRadius;

    vec4 color = vec4(0.0);
    int index = 0;

    // 3x3 kernel blur
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 offset = vec2(float(x), float(y)) * texelSize * radius;
            color += texture(source, qt_TexCoord0 + offset) * weights[index];
            index++;
        }
    }

    fragColor = color * ubuf.qt_Opacity;
}
