const T=globalThis.THREE;
T.ColorManagement.legacyMode=false;
export class Arena {
  constructor(canvas){
    this.canvas=canvas;
    this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    this.renderer.outputEncoding=T.sRGBEncoding;
    this.renderer.toneMapping=T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1;
    this.scene=new T.Scene();
    this.scene.background=new T.Color(0x21384d);
    this.scene.fog=new T.Fog(0x273e54,17,34);
    this.camera=new T.PerspectiveCamera(38,1,.1,60);
    this.camera.position.set(5.8,5.15,12.5);
    this.camera.lookAt(0,3.4,0);
    this.scene.add(new T.HemisphereLight(0xe9faff,0x616283,1.0));
    const key=new T.DirectionalLight(0xffefd1,1.55);
    key.position.set(-5,10,5);this.scene.add(key);
    const edge=new T.DirectionalLight(0x84c5ff,.7);
    edge.position.set(4,5,-8);this.scene.add(edge);
    this.edge=edge;
    this.geometry=new T.BoxGeometry();
    this.materials=new Map();
    this.makeVenue();
    this.makeAthlete();
    this.makeBroadcast();
    this.resize();
    new ResizeObserver(()=>this.resize()).observe(canvas);
  }
  mat(c){
    if(!this.materials.has(c))this.materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.74}));
    return this.materials.get(c);
  }
  box(w,h,d,c,x,y,z,p=this.scene){
    const mesh=new T.Mesh(this.geometry,this.mat(c));
    mesh.scale.set(w,h,d);mesh.position.set(x,y,z);p.add(mesh);return mesh;
  }
  group(p,x,y,z){
    const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;
  }
  label(value,w,h,x,y,z){
    const c=document.createElement('canvas');c.width=512;c.height=128;
    const ctx=c.getContext('2d');
    ctx.fillStyle='#162c42';ctx.fillRect(0,0,512,128);
    ctx.strokeStyle='#65cbc7';ctx.lineWidth=5;ctx.strokeRect(4,4,504,120);
    ctx.fillStyle='#a3e7dd';ctx.font='bold 39px Arial';ctx.textAlign='center';ctx.fillText(value,256,77,460);
    const texture=new T.CanvasTexture(c);texture.encoding=T.sRGBEncoding;
    const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture}));
    m.position.set(x,y,z);this.scene.add(m);
  }
  makeVenue(){
    this.box(37,.25,31,0xa2b3bf,0,-.14,0);
    this.box(15,.08,13,0x416b80,0,0,0);
    for(const x of [-5.9,5.9]){
      this.box(.44,.012,12,0xc55c58,x,.049,0);
      this.box(.055,.013,12,0xf2cf93,x+.29,.05,0);
    }
    this.box(7.4,.10,7.2,0x254b62,0,.06,0);
    for(let i=-3;i<=3;i++){
      this.box(.025,.006,7.1,0x508395,i,.117,0);
      this.box(7.3,.006,.025,0x508395,0,.117,i);
    }
    for(const x of [-3.57,3.57])this.box(.055,.012,7.15,0x8ed3d0,x,.13,0);
    for(const z of [-3.52,3.52])this.box(7.2,.012,.055,0x8ed3d0,0,.13,z);
    for(const x of [-2.13,2.13])for(const z of [-1.48,1.48]){
      this.box(.19,.67,.19,0x405c6e,x,.4,z);
      this.box(.39,.11,.35,0x22394b,x,.16,z);
    }
    this.box(4.8,.25,3.5,0x163143,0,.75,0);
    this.matBed=this.box(3.88,.075,2.58,0xd8e0cd,0,.93,0);
    for(const z of [-1.53,1.53])this.box(4.83,.20,.42,0x45b9b9,0,.94,z);
    for(const x of [-2.18,2.18])this.box(.43,.20,2.65,0x45b9b9,x,.94,0);
    for(const z of [-1.75,1.75]){
      this.box(4.76,.044,.035,0x92e8dd,0,1.023,z);
      for(const x of [-1.9,-.95,.95,1.9])this.box(.046,.19,.038,0x266575,x,.94,z);
    }
    for(let i=-9;i<=9;i++)this.box(.012,.007,2.53,0xb1bdac,i*.2,.974,0);
    for(let i=-6;i<=6;i++)this.box(3.81,.007,.012,0xb1bdac,0,.976,i*.2);
    this.box(1.15,.012,.034,0xd16051,0,.982,0);
    this.box(.034,.012,.91,0xd16051,0,.983,0);
    for(const x of [-1.5,1.5])for(const z of [-.99,.99]){
      this.box(.34,.009,.047,0xe2a758,x,.986,z);
      this.box(.047,.009,.28,0xe2a758,x,.987,z);
    }
    for(const z of [-1.31,1.31])for(let i=-8;i<=8;i++)this.box(.024,.05,.15,0x86a3a7,i*.23,.88,z);
    for(let row=0;row<6;row++){
      const z=-5.7-row*.64,y=.3+row*.45;
      this.box(25,.52,.69,row%2?0x3c6179:0x32546e,0,y,z);
      this.box(25,.04,.07,0x7894a6,0,y+.27,z+.31);
    }
    const crowd=new T.InstancedMesh(this.geometry,this.mat(0xffffff),6*32*3);
    const proxy=new T.Object3D();
    const shirts=[0x4f9baf,0x70bfc2,0xe4ab63,0xcc746c,0x7477aa,0x80a882];
    const skins=[0xe4b78e,0x98664f,0xc48b67,0x795640,0xf0c49a];
    let n=0;
    for(let row=0;row<6;row++)for(let col=0;col<32;col++){
      const x=(col-15.5)*.68,y=.58+row*.45,z=-5.7-row*.64;
      for(const [w,h,d,dy,color] of [[.37,.38,.29,.22,shirts[(col*5+row*7)%6]],[.27,.25,.25,.53,skins[(col+row*2)%5]],[.28,.067,.27,.68,0x333746]]){
        proxy.position.set(x,y+dy,z);proxy.scale.set(w,h,d);proxy.updateMatrix();
        crowd.setMatrixAt(n,proxy.matrix);crowd.setColorAt(n++,new T.Color(color));
      }
    }
    this.scene.add(crowd);
    this.box(28,10,.28,0x37566c,0,5,-10);
    this.label('WORLD TRAMPOLINE SERIES',9.2,1.05,-4.4,4.6,-9.79);
    this.box(25,.075,.12,0x73c6c5,0,5.36,-9.74);
    this.box(25,.06,.12,0x527c92,0,4.02,-9.74);
    for(const x of [-10.8,-7.7,-1.1,2.0,5.1,8.2,11.3]){
      this.box(.11,2.1,.12,0x496c84,x,6.45,-9.73);
      this.box(.30,.055,.13,0xa2d8d5,x,7.29,-9.69);
    }
    this.box(25,.26,.55,0x192e45,-1,7.6,-7.7);
    for(let i=-10;i<=9;i++){
      this.box(.64,.07,.24,0xc5efed,i*1.15,7.44,-7.64);
      const pennant=this.box(.32,.43,.035,[0x3e9caa,0xd99750,0xc35f59][(i+12)%3],i*.66,3.48,-5.35);
      pennant.rotation.z=i%2?.11:-.11;
    }
    this.box(14,.035,.035,0xb7c2aa,-.25,3.72,-5.35);
    for(const x of [-8.9,8.9]) {
      this.box(.33,8.5,.32,0x314d65,x,4.3,-8.9);
      this.box(2.2,.28,.47,0x182e46,x,6.75,-8.75);
      for(let j=0;j<5;j++)this.box(.31,.16,.08,0xd4f4ed,x-.82+j*.41,6.75,-8.48);
    }
    this.label('01   •   FLIGHT DECK',3.8,.56,0,.48,1.77);
    for(const x of [-4.1,4.1]){
      this.box(.75,.22,1.5,0x426984,x,.15,-.7);
      this.box(.66,.16,1.42,0x83aab7,x,.34,-.7);
      this.box(.44,.48,.37,0xf0dcb4,x,.59,-.8);
      this.box(.31,.31,.31,0xc58e6e,x,1.00,-.77);
      this.box(.33,.08,.34,0x304353,x,1.18,-.77);
      this.box(.53,.057,.67,0x203f58,x,.83,-.34);
    }
    this.shadow=new T.Mesh(new T.CircleGeometry(.68,28),new T.MeshBasicMaterial({color:0x172735,transparent:true,opacity:.24,depthWrite:false}));
    this.shadow.rotation.x=-Math.PI/2;this.shadow.position.y=.987;this.scene.add(this.shadow);
    this.landingRing=new T.Mesh(new T.RingGeometry(.67,.71,40),new T.MeshBasicMaterial({color:0x7df7d7,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));
    this.landingRing.rotation.x=-Math.PI/2;
    this.landingRing.position.y=.996;
    this.scene.add(this.landingRing);
  }
  makeAthlete(){
    const skin=0xdca885, red=0xe06053, ink=0x274157, white=0xf5e9cf;
    this.athlete=this.group(this.scene,0,2.04,0);
    this.athlete.rotation.y=.25;
    this.body=this.group(this.athlete,0,0,0);
    this.suit=this.box(.60,.65,.37,red,0,.19,0,this.body);
    this.box(.62,.105,.39,white,0,.18,0,this.body);
    this.box(.64,.16,.40,ink,0,-.18,0,this.body);
    this.box(.23,.055,.035,0xffd57a,0,.34,.197,this.body);
    this.box(.28,.23,.026,0xf3e0b9,0,.035,.198,this.body);
    this.box(.049,.125,.017,ink,-.025,.038,.218,this.body);
    this.box(.086,.031,.017,ink,-.04,.091,.219,this.body);
    for(const x of [-.298,.298])this.box(.025,.42,.11,0x9a3a42,x,.22,.08,this.body);
    this.box(.43,.43,.39,skin,0,.75,0,this.body);
    this.box(.46,.14,.42,0x43383d,0,.94,-.015,this.body);
    this.box(.15,.23,.09,0x43383d,-.16,.83,-.16,this.body);
    this.box(.39,.05,.05,0x594048,0,.895,.202,this.body);
    this.box(.095,.13,.05,0x594048,-.146,.848,.202,this.body);
    for(const x of [-.222,.222])this.box(.041,.095,.09,0xc78e72,x,.72,.018,this.body);
    for(const x of [-.105,.105])this.box(.065,.062,.022,0x293e4b,x,.77,.205,this.body);
    this.box(.115,.024,.02,0x9b594f,0,.665,.207,this.body);
    this.limbs=[-1,1].map(side=>{
      const arm=this.group(this.body,side*.405,.42,0);
      this.box(.19,.36,.21,skin,0,-.17,0,arm);
      const elbow=this.group(arm,0,-.34,0);
      this.box(.16,.33,.19,skin,0,-.14,0,elbow);
      this.box(.17,.077,.2,white,0,-.22,0,elbow);
      const leg=this.group(this.body,side*.15,-.22,0);
      this.box(.235,.40,.25,ink,0,-.18,0,leg);
      const knee=this.group(leg,0,-.38,0);
      this.box(.20,.35,.22,skin,0,-.15,0,knee);
      this.box(.24,.13,.36,white,0,-.36,.045,knee);
      this.box(.244,.036,.368,0x415a71,0,-.405,.046,knee);
      this.box(.20,.052,.232,0xffedcf,0,-.266,.006,knee);
      return {arm,elbow,leg,knee,side};
    });
  }
  makeBroadcast(){
    const z=-3.75;
    this.box(5.9,.18,1.5,0x297581,0,.18,z);
    this.box(5.5,.74,.78,0x183b56,0,.67,z+.18);
    this.box(5.65,.085,.89,0x91c6c1,0,1.08,z+.18);
    this.label('OFFICIAL JUDGES PANEL',4.55,.33,0,.77,z+.585);
    this.cards=[];
    for(const [i,x] of [-1.69,0,1.69].entries()){
      const skin=[0xe0ac86,0xad775b,0xe6bc95][i];
      this.box(.48,.56,.34,0x243d53,x,1.16,z-.2);
      this.box(.33,.33,.34,skin,x,1.60,z-.18);
      this.box(.36,.105,.35,[0x43363b,0x302d39,0x754d40][i],x,1.78,z-.18);
      this.box(.14,.19,.025,0xe6e3cb,x,1.27,z);
      this.box(.053,.15,.031,0x5fc2c3,x,1.27,z+.02);
      for(const dx of [-.08,.08])this.box(.045,.043,.024,0x28333d,x+dx,1.63,z+.004);
      this.box(.24,.06,.17,0x67818c,x-.36,1.135,z+.47);
      const mic=this.box(.032,.23,.032,0x253d4f,x-.36,1.27,z+.46);
      mic.rotation.x=-.29;
      this.box(.08,.08,.08,0x354d5a,x-.36,1.38,z+.425);
      const surface=document.createElement('canvas');
      surface.width=128;surface.height=96;
      const texture=new T.CanvasTexture(surface);
      texture.encoding=T.sRGBEncoding;
      const mesh=new T.Mesh(new T.PlaneGeometry(.46,.34),new T.MeshBasicMaterial({map:texture}));
      mesh.position.set(x+.32,1.14,z+.47);
      mesh.rotation.x=-.35;
      this.scene.add(mesh);
      this.cards.push({surface,texture,mesh});
    }
    this.setScore(null);
    this.podium=this.group(this.scene,0,0,0);
    this.box(1.50,.44,1.24,0xca9041,0,1.18,0,this.podium);
    this.box(1.57,.06,1.31,0xffd684,0,1.43,0,this.podium);
    this.box(1.00,.25,1.05,0xa6c3c6,-1.28,1.09,0,this.podium);
    this.box(1.00,.16,1.05,0xac7962,1.28,1.045,0,this.podium);
    this.medallion=this.group(this.body,0,.22,.24);
    this.box(.13,.22,.02,0x469ea8,0,.065,0,this.medallion);
    this.box(.145,.135,.045,0xf1c15d,0,-.047,.014,this.medallion);
    this.podium.visible=false;
    this.medallion.visible=false;
  }
  setScore(score){
    this.lastScore=score;
    for(const {surface,texture,mesh} of this.cards){
      const ctx=surface.getContext('2d');
      ctx.fillStyle='#132a3d';ctx.fillRect(0,0,128,96);
      ctx.strokeStyle='#7dcac1';ctx.lineWidth=5;ctx.strokeRect(3,3,122,90);
      ctx.fillStyle='#ffdc8b';ctx.font='bold 53px Arial';ctx.textAlign='center';
      ctx.fillText(score===null?'–':String(score),64,66);
      texture.needsUpdate=true;
      mesh.position.y=score===null?1.14:1.45;
    }
  }
  resize(){
    const w=this.canvas.clientWidth,h=this.canvas.clientHeight;
    if(!w||!h)return;
    this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
    this.renderer.setSize(w,h,false);
  }
  draw(cup,height,angle,tuck,medal,impact,t,gold,intro){
    const celebrate=medal>0;
    const walking=intro!==null&&intro>=2.9;
    const entrance=walking?Math.max(0,1-(intro-2.9)/1.18):0;
    const stride=Math.sin(t*17)*entrance*.36;
    this.podium.visible=celebrate;
    this.medallion.visible=celebrate;
    this.medallion.children[1].material=this.mat([0xf1c15d,0xb67b62,0xc5dde1,0xf1c15d][medal]);
    this.suit.material=this.mat(gold?0xd7a642:0xe06053);
    this.edge.color.set(cup.color);
    this.scene.background.set(cup.color).multiplyScalar(.26);
    this.athlete.position.y=2.04+height-impact*.10+(celebrate?.47:0)+Math.abs(stride)*.12;
    this.athlete.position.z=entrance*1.05;
    this.body.rotation.x=-angle+(this.lastScore===0?impact*.28:0);
    for(const {arm,elbow,leg,knee,side} of this.limbs){
      arm.rotation.z=side*(celebrate?2.32:.19+tuck*.13);
      arm.rotation.x=-tuck*.83+stride*side;
      elbow.rotation.x=-tuck*.9;
      leg.rotation.x=-tuck*1.38-stride*side;
      knee.rotation.x=tuck*1.78;
    }
    this.matBed.position.y=.93-impact*.1;
    this.shadow.material.opacity=.26/(1+height*.72);
    this.shadow.scale.setScalar(1+height*.19);
    this.shadow.position.z=this.athlete.position.z;
    this.landingRing.visible=impact>0;
    this.landingRing.scale.setScalar(1+(1-impact)*1.2);
    this.landingRing.material.opacity=impact*.7;
    if(intro!==null&&intro<1.45){
      this.camera.position.set(7.9-intro*1.15,5.8,13.5);
      this.camera.lookAt(0,2.7,-.35);
    }else if(intro!==null&&intro<2.9){
      this.camera.position.set(2.9,3.1,2.2);
      this.camera.lookAt(0,1.32,-3.75);
    }else if(intro!==null||celebrate){
      this.camera.position.set(2.8,3.45,7.8);
      this.camera.lookAt(0,2.37,0);
    }else{
      this.camera.position.set(5.8,5.15+height*.14,12.5);
      this.camera.lookAt(0,3.4+height*.12,0);
    }
    const zoom=intro===null&&!celebrate?1+Math.min(height,3)*.019:1;
    if(Math.abs(this.camera.zoom-zoom)>.003){this.camera.zoom=zoom;this.camera.updateProjectionMatrix();}
    this.renderer.render(this.scene,this.camera);
  }
}
