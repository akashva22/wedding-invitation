/* 3D floating invitation: card, rings, petals and gold dust that follow the scroll. */
(function(){
if(typeof THREE==="undefined"||!document.getElementById("stage"))return;
var calm=matchMedia("(prefers-reduced-motion: reduce)").matches,cv=document.getElementById("stage"),R;
try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});}catch(e){return;}
R.setPixelRatio(Math.min(devicePixelRatio,2));
var scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(36,1,.1,60);cam.position.z=9;
scene.add(new THREE.AmbientLight(0xffffff,.7));
var key=new THREE.DirectionalLight(0xfff0d0,.9);key.position.set(3,4,6);scene.add(key);
var rose=new THREE.PointLight(0xc4566b,1.2,22);rose.position.set(-4,-2,4);scene.add(rose);
var SERIF='"Playfair Display",Georgia,serif',SANS='"Hanken Grotesk",system-ui,sans-serif';
var SC=1.5,KN=null,fc=0;   // texture drawn at 1536 x 2172 for a sharp card
function mk(front){
  var w=1024,h=1448,c=document.createElement("canvas");c.width=w*SC;c.height=h*SC;
  var x=c.getContext("2d"),t=new THREE.CanvasTexture(c);t.anisotropy=R.capabilities.getMaxAnisotropy();
  t.draw=function(){
    x.setTransform(SC,0,0,SC,0,0);
    var I=window.INVITE||{};
    x.fillStyle=front?"#f8f1e4":"#120c0c";x.fillRect(0,0,w,h);
    x.strokeStyle=front?"#a87a1f":"#e2b650";x.lineWidth=7;x.strokeRect(46,46,w-92,h-92);x.lineWidth=2.5;x.strokeRect(74,74,w-148,h-148);
    x.textAlign="center";
    function T(s,y,f,fill){x.font=f;x.fillStyle=fill;x.fillText(s,w/2,y);}
    function lines(s,f,mw){x.font=f;var l="",o=[];String(s).split(" ").forEach(function(d){var tl=l?l+" "+d:d;if(x.measureText(tl).width>mw&&l){o.push(l);l=d;}else l=tl;});o.push(l);return o;}
    function wrap(s,y,f,fill,lh){x.font=f;x.fillStyle=fill;var l="",mw=w-240;String(s).split(" ").forEach(function(d){var tl=l?l+" "+d:d;if(x.measureText(tl).width>mw&&l){x.fillText(l,w/2,y);y+=lh;l=d;}else l=tl;});x.fillText(l,w/2,y);return y;}
    if(front){
      if(I.family)T(I.family,240,"italic 500 44px "+SERIF,"#4b3a35");
      T(I.groom||"",530,"600 190px "+SERIF,"#4a1020");
      T("&",680,"italic 500 110px "+SERIF,"#b01f4a");
      T(I.bride||"",900,"600 190px "+SERIF,"#4a1020");
      T(I.context||"",1050,"italic 500 52px "+SERIF,"#3d2f2b");
      wrap(I.date||"",1150,"600 60px "+SERIF,"#7a4f08",74);
    }else{
      T(I.invite||"You’re invited",290,"italic 500 80px "+SERIF,"#f09aac");
      var y=wrap(I.date||"",450,"600 84px "+SERIF,"#f3cf6c",100);
      var kf="italic 500 52px "+SERIF,kl=lines(I.knot||"",kf,w-240),ky=y+150;KN={lines:kl,y0:ky,lh:68,font:kf};y=ky+(kl.length-1)*68;   // drawn by the sparkling overlay
      y=wrap(I.muhurtham||"",y+105,"500 46px "+SANS,"#f4efe6",64);
      wrap(I.venue||"",y+115,"italic 500 48px "+SERIF,"#e3ddd0",62);
    }
    t.needsUpdate=true;
  };
  t.draw();return t;
}
var tF=mk(true),tB=mk(false);function redraw(){tF.draw();tB.draw();drawKnot(0);if(window.engraveNames)engraveNames();window.engraveNames=engraveNames;}
addEventListener("invite:ready",redraw);if(window.INVITE)redraw();
if(document.fonts&&document.fonts.load)Promise.all(['600 40px "Playfair Display"','italic 500 40px "Playfair Display"','500 40px "Hanken Grotesk"'].map(function(f){return document.fonts.load(f);})).then(redraw);
var edge=new THREE.MeshPhongMaterial({color:0xd9a93b,shininess:90,specular:0xfff0c0});
var card=new THREE.Mesh(new THREE.BoxGeometry(2.3,3.24,.07),[edge,edge,edge,edge,new THREE.MeshBasicMaterial({map:tF}),new THREE.MeshBasicMaterial({map:tB})]);
var cardG=new THREE.Group();cardG.add(card);scene.add(cardG);
/* "Tying the knot" line: golden shimmer plus twinkling stars, drawn live on a small overlay on the card's back */
var kc=document.createElement("canvas"),kx=kc.getContext("2d"),kt=new THREE.CanvasTexture(kc),knotMesh=null,sparks=[];
kt.anisotropy=R.capabilities.getMaxAnisotropy();
for(var si=0;si<20;si++)sparks.push({u:Math.random(),v:Math.random(),r:7+Math.random()*11,p:1.5+Math.random()*1.8,o:Math.random()*6.3});
function star(cx,cy,r,a){kx.save();kx.globalAlpha=a;kx.translate(cx,cy);kx.rotate(Math.PI/4*a);kx.shadowColor="#f0c050";kx.shadowBlur=14;kx.fillStyle="#fff2bd";
  kx.beginPath();kx.moveTo(0,-r);kx.quadraticCurveTo(0,0,r,0);kx.quadraticCurveTo(0,0,0,r);kx.quadraticCurveTo(0,0,-r,0);kx.quadraticCurveTo(0,0,0,-r);kx.fill();kx.restore();}
function drawKnot(tm){
  if(!KN||!kx||!card)return;
  var top=KN.y0-64,hh=(KN.lines.length-1)*KN.lh+104,cw=Math.round(1024*SC),ch=Math.ceil(hh*SC);
  if(kc.width!==cw||kc.height!==ch){kc.width=cw;kc.height=ch;}
  if(!knotMesh){knotMesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:kt,transparent:true,depthWrite:false}));knotMesh.rotation.y=Math.PI;knotMesh.position.z=-.04;card.add(knotMesh);}
  knotMesh.scale.set(2.3,3.24*hh/1448,1);knotMesh.position.y=3.24*(.5-(top+hh/2)/1448);
  kx.setTransform(1,0,0,1,0,0);kx.clearRect(0,0,kc.width,kc.height);kx.setTransform(SC,0,0,SC,0,0);
  var x0=((tm*.14)%1)*1800-760,g=kx.createLinearGradient(x0,0,x0+760,0);
  [[0,"#d9a93b"],[.25,"#f6dc88"],[.5,"#fffbe0"],[.75,"#f0c85a"],[1,"#d9a93b"]].forEach(function(c){g.addColorStop(c[0],c[1]);});
  kx.font=KN.font;kx.textAlign="center";kx.fillStyle=g;kx.shadowColor="rgba(240,200,90,.55)";kx.shadowBlur=12;
  KN.lines.forEach(function(l,i){kx.fillText(l,512,KN.y0-top+i*KN.lh);});
  kx.shadowBlur=0;
  if(!calm)sparks.forEach(function(p){var a=Math.sin(tm*6.283/p.p+p.o);if(a>0)star(40+p.u*944,p.v*hh,p.r*a+2,a);});
  kt.needsUpdate=true;
}
drawKnot(0);
var gc=document.createElement("canvas");gc.width=gc.height=128;var gx=gc.getContext("2d"),gr=gx.createRadialGradient(64,64,0,64,64,64);
gr.addColorStop(0,"rgba(196,86,107,.5)");gr.addColorStop(1,"rgba(196,86,107,0)");gx.fillStyle=gr;gx.fillRect(0,0,128,128);
var glow=new THREE.Mesh(new THREE.PlaneGeometry(6.5,6.5),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(gc),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));glow.position.z=-1;scene.add(glow);
/* Wedding rings: real band profile, polished gold with reflections, names engraved, bride's ring smaller and daintier */
var env=null;
try{var ec=document.createElement("canvas");ec.width=512;ec.height=256;var ex=ec.getContext("2d"),eg=ex.createLinearGradient(0,0,0,256);
  eg.addColorStop(0,"#fff3dc");eg.addColorStop(.45,"#8a6a48");eg.addColorStop(.5,"#1a110c");eg.addColorStop(1,"#3a2418");ex.fillStyle=eg;ex.fillRect(0,0,512,256);
  ex.fillStyle="#fff";[[50,40,120,50],[250,25,100,40],[400,60,70,60],[150,120,70,22]].forEach(function(r){ex.fillRect(r[0],r[1],r[2],r[3]);});
  var et=new THREE.CanvasTexture(ec);et.mapping=THREE.EquirectangularReflectionMapping;var pmg=new THREE.PMREMGenerator(R);env=pmg.fromEquirectangular(et).texture;pmg.dispose();}catch(err){}
var gold=new THREE.MeshStandardMaterial({color:0xffcf6b,metalness:1,roughness:.2,envMap:env,envMapIntensity:1.25,side:THREE.DoubleSide});
function band(Rin,w,t){var pts=[new THREE.Vector2(Rin,-w/2),new THREE.Vector2(Rin,w/2)],n=16,i;
  for(i=0;i<=n;i++){var q=1-2*i/n;pts.push(new THREE.Vector2(Rin+t*(1-.18*q*q),q*w/2));}
  pts.push(new THREE.Vector2(Rin,-w/2));return new THREE.Mesh(new THREE.LatheGeometry(pts,96),gold);}
function engr(Rin,w,t){var r=Rin+t+.004,hE=w*.8,c=document.createElement("canvas");c.width=2048;c.height=Math.round(hE*2048/(2*Math.PI*r));
  var tx=new THREE.CanvasTexture(c);tx.anisotropy=8;
  var m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,hE,96,1,true),new THREE.MeshStandardMaterial({map:tx,transparent:true,metalness:.7,roughness:.35,envMap:env,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));
  m.userData.draw=function(txt){var x=c.getContext("2d");x.clearRect(0,0,c.width,c.height);x.textAlign="center";x.textBaseline="middle";
    x.font="600 "+Math.round(c.height*.9)+'px "Playfair Display",Georgia,serif';
    if("letterSpacing" in x)x.letterSpacing="8px";x.fillStyle="rgba(255,244,205,.95)";x.fillText(txt,1026,c.height/2+2);x.fillStyle="#2a1700";x.fillText(txt,1024,c.height/2);tx.needsUpdate=true;};
  return m;}
var rings=new THREE.Group();
var ringA=new THREE.Group(),engA=engr(.6,.44,.1);engA.rotation.y=Math.PI;ringA.add(band(.6,.44,.1),engA);ringA.position.x=.28;   // groom: larger, wider
var pivB=new THREE.Group(),ringB=new THREE.Group(),engB=engr(.47,.34,.075);ringB.add(band(.47,.34,.075),engB);ringB.rotation.x=Math.PI/2;   // bride: smaller, slimmer, threaded through the groom's ring
pivB.add(ringB);pivB.rotation.y=Math.PI;pivB.position.x=-.28;
rings.add(ringA,pivB);scene.add(rings);
function engraveNames(){var I=window.INVITE||{};engA.userData.draw((I.groom||"").toUpperCase());engB.userData.draw((I.bride||"").toUpperCase());}
engraveNames();
var mats=[0xf0b429,0xe8872e,0xc4566b,0xf5c96a].map(function(c){return new THREE.MeshPhongMaterial({color:c,side:THREE.DoubleSide,transparent:true,opacity:.8});});
var petals=[];var lowEnd=innerWidth<=820;for(var i=0;i<(calm?10:(lowEnd?16:30));i++){var p=new THREE.Mesh(new THREE.CircleGeometry(.08,10),mats[i%4]);p.scale.set(1,1.7,1);
  p.position.set((Math.random()-.5)*16,(Math.random()-.5)*11,(Math.random()-.5)*5-2);p.rotation.set(Math.random()*6,Math.random()*6,0);
  p.userData={v:.15+Math.random()*.25,r:Math.random()*2+.5,ph:Math.random()*6};scene.add(p);petals.push(p);}
var dc=document.createElement("canvas");dc.width=dc.height=32;var dcx=dc.getContext("2d"),dgr=dcx.createRadialGradient(16,16,0,16,16,16);dgr.addColorStop(0,"rgba(255,255,255,1)");dgr.addColorStop(1,"rgba(255,255,255,0)");dcx.fillStyle=dgr;dcx.fillRect(0,0,32,32);var dotTex=new THREE.CanvasTexture(dc);
var N=lowEnd?70:140,pa=new Float32Array(N*3);for(var j=0;j<N;j++){pa[j*3]=(Math.random()-.5)*18;pa[j*3+1]=(Math.random()-.5)*12;pa[j*3+2]=(Math.random()-.5)*8-1;}
var pg=new THREE.BufferGeometry();pg.setAttribute("position",new THREE.BufferAttribute(pa,3));
var dust=new THREE.Points(pg,new THREE.PointsMaterial({color:0xf7de8f,size:.08,map:dotTex,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(dust);

var W=1,H=1,mob=false,secs=[],HX=1;
function measure(){W=innerWidth;H=innerHeight;mob=W<=820;R.setPixelRatio(Math.min(devicePixelRatio,mob?1.75:2));R.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix();HX=Math.tan(18*Math.PI/180)*9*cam.aspect;
  secs=[].slice.call(document.querySelectorAll("main section")).filter(function(e){return !e.hidden&&e.offsetParent;});}
addEventListener("resize",measure);measure();
var mx=0,my=0,spin=0,spinT=0,sec=0,enter=0,clock=new THREE.Clock();
addEventListener("pointermove",function(e){mx=e.clientX/W*2-1;my=e.clientY/H*2-1;});
addEventListener("deviceorientation",function(e){if(e.gamma!=null){mx=Math.max(-1,Math.min(1,e.gamma/30));my=Math.max(-1,Math.min(1,(e.beta-45)/30));}});
addEventListener("click",function(e){if(!e.target.closest("a,button,input,textarea,label")&&!document.body.classList.contains("locked"))spinT+=Math.PI*2;});
function frac(){var mid=H/2;for(var i=0;i<secs.length;i++){var b=secs[i].getBoundingClientRect();if(b.bottom>mid)return Math.max(0,i+(mid-b.top)/Math.max(1,b.height)-.5);}return Math.max(0,secs.length-1);}
var sm=function(a){a=Math.max(0,Math.min(1,a));return a*a*(3-2*a);};
function frame(){
  if(document.body.classList.contains("locked")){requestAnimationFrame(frame);return;}   // nothing to draw behind the intro
  var t=clock.getElapsedTime(),open=!document.body.classList.contains("locked");
  enter+=((open?1:0)-enter)*.035;sec+=(frac()-sec)*.1;spin+=(spinT-spin)*.06;
  var hb=secs[0]?secs[0].getBoundingClientRect():{top:0,height:H},hp=Math.max(0,Math.min(1,-hb.top/Math.max(1,hb.height-H)));
  var flip=Math.PI*sm((hp-.2)/.45);            // front -> back while the hero scrolls
  var mv=sm((sec-.5)/.6),fit=mob?1-sm((sec-.55)/.4):1;   // then it slides right (phone: steps aside)
  var sc=(mob?Math.min(1.1,HX*.62):Math.min(1.25,HX/4))*fit*(.4+.6*enter);
  var cx=mob?0:HX*.46*mv,cy=mob?.2:0,bob=calm?0:Math.sin(t*1.1)*.1;
  if(!calm&&flip>1.2&&(++fc%(mob?3:2)===0))drawKnot(t);
  var cue=document.getElementById("cue");if(cue)cue.style.opacity=1-sm(hp*8);
  cardG.position.set(cx,cy+bob-(1-enter)*1.5,0);cardG.scale.setScalar(Math.max(.001,sc));
  cardG.rotation.y=flip+spin+mx*.3+(1-enter)*Math.PI;cardG.rotation.x=my*.14;cardG.rotation.z=calm?0:Math.sin(t*.7)*.03;
  glow.position.set(cx,cy,-1);glow.scale.setScalar(Math.max(.001,sc));
  var rs=(mob?Math.min(.55,HX*.36):.55)*fit*(.4+.6*enter),hw=1.05*rs,hh=.85*rs,rxp=mob?0:cx-1.25*sc,ryp=mob?-1.5:-1.9*sc;
  rxp=Math.max(-(HX*.81-hw),Math.min(HX*.81-hw,rxp));ryp=Math.max(-(2.38-hh),Math.min(2.38-hh,ryp));   // always inside the screen
  rings.position.set(rxp,ryp,1.2);rings.scale.setScalar(Math.max(.001,rs));
  var re=flip/Math.PI;   // the rings turn with the card: bride's name first, then one full turn to settle with the groom's name facing you
  rings.rotation.y=-.5*(1-re)+re*(Math.PI*2+.1)+(calm?0:Math.sin(t*.5)*.1);rings.rotation.x=.85*(1-re)+.5*re+(calm?0:Math.sin(t*.4)*.05);
  petals.forEach(function(q){var d=q.userData;if(!calm){q.position.y-=d.v*.012;q.position.x+=Math.sin(t*d.r+d.ph)*.004;q.rotation.x+=.01*d.r;q.rotation.y+=.012;}
    if(q.position.y<-6){q.position.y=6;q.position.x=(Math.random()-.5)*16;}});
  dust.rotation.y=t*.02;dust.material.opacity=.45+.25*Math.sin(t*1.3);
  cam.position.x=mx*.25;cam.position.y=-my*.15;cam.lookAt(0,0,0);
  R.render(scene,cam);requestAnimationFrame(frame);
}
frame();
})();
