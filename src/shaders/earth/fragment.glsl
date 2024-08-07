varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
uniform vec3 uSunDirection;
uniform vec3 uAthmosphereDayColor;
uniform vec3 uAthmosphereTwilightColor;
uniform float uTime;

#include '../includes/cnoise.glsl'

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Sun orientation
    float sunOrientation = dot(uSunDirection, normal);

    // Day / night color
    float dayMix = smoothstep(-0.25, 0.5, sunOrientation);
    vec3 dayColor = texture(uDayTexture, vUv).rgb;
    vec3 nightColor = texture(uNightTexture, vUv).rgb;
    color = mix(nightColor, dayColor, dayMix);

    // Fresnel effect
    float fresnel = dot(normal, viewDirection) + 1.0;
    fresnel = pow(fresnel, 2.0);


    // Clouds
      vec2 specularCloudsColor = texture(uSpecularCloudsTexture, vUv).rg;
    float cloudsMix = smoothstep(0.3, 1.0, specularCloudsColor.g);
    // color = mix(color, vec3(dayMix), cloudsMix);

    // Clouds animation
    float cloudSpeed = 0.001;
    vec2 cloudOffset = vec2(uTime * cloudSpeed, 0.0);
    vec2 cloudUV = vUv * 5.0 + cloudOffset;
    float cloudNoise = cnoise(vec3(cloudUV, uTime * 0.1));
    specularCloudsColor.g *= cloudNoise * 0.5 + 0.2;
    float cloudAnimation = smoothstep(0.1, 0.25, specularCloudsColor.g);
    color = mix(color, vec3(dayMix), cloudAnimation);





    // Athmosphere effect
    float athmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 athmosphereColor = mix(uAthmosphereTwilightColor, uAthmosphereDayColor, athmosphereDayMix);
    color = mix(color, athmosphereColor, fresnel * athmosphereDayMix);

    // Specular highlights
    vec3 reflection = reflect(-uSunDirection, normal);
    float specular = -dot(reflection, viewDirection);
    specular = max(specular, 0.0);
    specular = pow(specular, 100.0);
    specular *= specularCloudsColor.r;
    vec3 specularColor = mix(vec3(1.0), athmosphereColor, fresnel);
    color += specularColor * specular;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}