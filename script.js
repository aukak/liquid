let myShader;
let gui;
let params = {
  speed: 0.5,
  mouseEffect: 0.33,
  //   mouseEffect: 0.0,

  warpIntensity: 5,
  waveCount: 10.0,
  //   waveCount: 1.5

  paletteMix: 1.0,
  resolution: [window.innerWidth, window.innerHeight]
};

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  myShader = createShader(vertShader, fragShader);
  gui = new dat.GUI();
  gui.add(params, 'speed', 0.1, 2.0, 0.01);
  gui.add(params, 'mouseEffect', 0.0, 1.0, 0.01);
  gui.add(params, 'warpIntensity', 1.0, 10.0, 0.1);
  gui.add(params, 'waveCount', 1.0, 10.0, 0.1);
  gui.add(params, 'paletteMix', 0.0, 1.0, 0.01);
}

function draw() {
  shader(myShader);
  myShader.setUniform('iResolution', [width, height]);
  myShader.setUniform('iTime', millis() / 1000.0);
  myShader.setUniform('iMouse', [mouseX / width, mouseY / height]);
  myShader.setUniform('speed', params.speed);
  myShader.setUniform('mouseEffect', params.mouseEffect);
  myShader.setUniform('warpIntensity', params.warpIntensity);
  myShader.setUniform('waveCount', params.waveCount);
  myShader.setUniform('paletteMix', params.paletteMix);
  beginShape();
  vertex(-1, -1, 0, 0);
  vertex(1, -1, 1, 0);
  vertex(1, 1, 1, 1);
  vertex(-1, 1, 0, 1);
  endShape(CLOSE);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

const vertShader = `
  precision mediump float;
  attribute vec3 aPosition;
  varying vec2 vTexCoord;
  void main() {
    vTexCoord = (aPosition.xy + 1.0) * 0.5;
    gl_Position = vec4(aPosition, 1.0);
  }
`;

const fragShader = `
  precision mediump float;

  uniform vec2 iResolution;
  uniform float iTime;
  uniform vec2 iMouse;
  uniform float speed;
  uniform float mouseEffect;
  uniform float warpIntensity;
  uniform float waveCount;
  uniform float paletteMix;

  const float TAU = 6.28318530718;

  vec3 palette(float t) {
    return 0.5 + 0.5 * cos(TAU * (vec3(1.0, 1.0, 1.0) * t + vec3(0.0, 0.33, 0.67)));
  }

  vec3 palette2(float t) {
    return 0.5 + 0.5 * cos(TAU * (vec3(1.0, 1.0, 0.8) * t + vec3(0.0, 0.25, 0.5)));
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = fragCoord / iResolution.xy;
    vec2 mouse = (iMouse - uv) * warpIntensity * mouseEffect;
    uv += mouse;

    vec2 col = uv * waveCount;
    for(float i = 1.0; i < 6.0; i++) {
      uv += col;
      col = cos(uv.yx * i + iTime * speed);
    }

    vec3 color1 = palette(col.x);
    vec3 color2 = palette2(col.y);
    vec3 finalColor = mix(color1, color2, paletteMix);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;