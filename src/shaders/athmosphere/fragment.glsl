varying vec3 vNormal;
varying vec3 vPosition;

uniform vec3 uSunDirection;
uniform vec3 uAthmosphereDayColor;
uniform vec3 uAthmosphereTwilightColor;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // sun orientatiin
    float sunOrientation = dot(uSunDirection, normal);

    // athmosphere
    float athmosphereDayMix = smoothstep(- 0.5, 1.0, sunOrientation);
    vec3 athmosphereColor = mix(uAthmosphereTwilightColor, uAthmosphereDayColor, athmosphereDayMix);
    color += athmosphereColor;

    // alpha
    float edgeAlpha = dot(viewDirection, normal);
    edgeAlpha = smoothstep(0.0, 0.5, edgeAlpha);


    float dayAlpha = smoothstep(- 0.5, 0.5, sunOrientation);
    float alpha = edgeAlpha * dayAlpha;

    // Final color
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}