// The MP4 packs colour on the left and its synchronized matte on the right.
// One video decoder keeps the hair edge exactly aligned during rapid seeks.
export function createGazeRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return null;
  const vertex = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vertex, 'attribute vec2 p; varying vec2 uv; void main(){ uv=(p+1.0)*0.5; gl_Position=vec4(p,0.,1.); }');
  gl.compileShader(vertex);
  const fragment = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fragment, `precision mediump float;
    varying vec2 uv; uniform sampler2D source;
    void main(){
      vec2 colorUV=vec2(uv.x*.5,uv.y);
      vec3 rgb=texture2D(source,colorUV).rgb;
      vec2 maskUV=vec2(.5+uv.x*.5,uv.y);
      float matte=texture2D(source,maskUV).r;
      // Pull the matte inward by roughly one source pixel so the white
      // backdrop cannot leak through at the hair edge. Keep the transition
      // subpixel-soft instead of blurring the portrait itself.
      // The source hair on the viewer's left carries a slightly wider white
      // fringe; give that side a little more cleanup without touching right.
      float leftSide=1.-smoothstep(.32,.55,uv.x);
      float radius=mix(1.5,2.3,leftSide);
      vec2 px=vec2(radius/1800.,radius/1200.);
      float inner=min(min(texture2D(source,maskUV+vec2(px.x,0.)).r,
                          texture2D(source,maskUV-vec2(px.x,0.)).r),
                      min(texture2D(source,maskUV+vec2(0.,px.y)).r,
                          texture2D(source,maskUV-vec2(0.,px.y)).r));
      // The logo also leaked into the packed matte. Restore opacity there,
      // otherwise the letters remain as dark cut-outs after replacing color.
      float logo=smoothstep(.795,.825,uv.x)*(1.-smoothstep(.075,.105,uv.y));
      matte=mix(matte,1.,logo);
      inner=mix(inner,1.,logo);
      float a=smoothstep(.04,.94,mix(matte,inner,mix(.55,.70,leftSide)));
      // Restore a little of the detail softened by the video compression.
      // Limit the sharpening to solid portrait pixels so the hair edge stays soft.
      vec2 detailPx=vec2(1./1800.,1./1200.);
      vec3 nearby=(texture2D(source,colorUV+vec2(detailPx.x,0.)).rgb+
                   texture2D(source,colorUV-vec2(detailPx.x,0.)).rgb+
                   texture2D(source,colorUV+vec2(0.,detailPx.y)).rgb+
                   texture2D(source,colorUV-vec2(0.,detailPx.y)).rgb)*.25;
      vec2 facePos=(uv-vec2(.51,.46))/vec2(.36,.42);
      float face=1.-smoothstep(.8,1.15,length(facePos));
      float skinTone=smoothstep(.025,.08,rgb.r-rgb.g)*
                     smoothstep(.012,.065,rgb.g-rgb.b)*
                     smoothstep(.28,.46,dot(rgb,vec3(.299,.587,.114)))*face;
      rgb=clamp(rgb+(rgb-nearby)*(.26+.1*skinTone)*smoothstep(.84,.99,inner),0.,1.);
      // The source video has a small bright logo on the lower-right hair.
      // Borrow the clean hair directly beside it, keeping the original matte.
      vec3 cleanHair=texture2D(source,vec2((.685+(uv.x-.795)*.43)*.5,uv.y)).rgb;
      rgb=mix(rgb,cleanHair,logo);
      vec3 clean=clamp((rgb-(1.-matte)*vec3(1.))/max(matte,.01),0.,1.);
      clean*=1.-mix(.16,.24,leftSide)*(1.-smoothstep(.35,1.,inner));
      // Keep the original skin texture, but take the pale highlights down a
      // touch and let the cheeks retain a little natural warmth.
      float skin=skinTone*smoothstep(.86,.99,inner);
      float highlight=smoothstep(.58,.83,dot(clean,vec3(.299,.587,.114)));
      clean+=vec3(.004,.006,.009)*skin-vec3(.006)*skin*highlight;
      vec2 cheekL=(uv-vec2(.30,.39))/vec2(.12,.105);
      vec2 cheekR=(uv-vec2(.73,.39))/vec2(.12,.105);
      float flush=(exp(-dot(cheekL,cheekL)*1.25)+exp(-dot(cheekR,cheekR)*1.25))*skin;
      clean+=vec3(.006,-.002,-.003)*flush;
      clean=clamp(clean,0.,1.);
      gl_FragColor=vec4(clean*a,a);
    }`);
  gl.compileShader(fragment);
  const program = gl.createProgram()!;
  gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const attribute=gl.getAttribLocation(program,'p'); gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
  const texture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  canvas.width=900;canvas.height=1200;gl.viewport(0,0,900,1200);
  return {
    draw(source: HTMLVideoElement | HTMLImageElement) {
      if(gl.isContextLost()) return;
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
      gl.drawArrays(gl.TRIANGLES,0,6);
    },
    dispose(){ gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment); }
  };
}
