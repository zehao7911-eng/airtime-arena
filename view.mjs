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
    // The competition deck sits over a river, between terraced sandstone walls.
    this.scene.fog=new T.FogExp2(0xddb293,.023);
    this.box(12,.55,11,0x643f36,0,-.29,1);
    for(let i=0;i<29;i++){
      const z=(i-14)*.35+1;
      this.box(11.85,.055,.334,i%3===0?0xc88758:0xab6948,0,.016,z);
    }
    for(const x of [-5.75,5.75]){
      this.box(.11,.09,10.7,0xf2b568,x,.07,1);
      for(let i=0;i<8;i++){
        const z=i*1.43-4;
        this.box(.14,.85,.14,0x523c36,x,.43,z);
      }
      this.box(.09,.09,10.1,0x734a36,x,.8,1);
      this.box(.09,.06,10.1,0x956448,x,.45,1);
    }
    this.box(16,.13,73,0x277c86,0,-2.35,-15);
    this.ripples=this.group(this.scene,0,-2.26,0);
    for(let i=0;i<60;i++){
      this.box(.3+(i%7)*.27,.016,.06,i%4?0x4e9c9e:0xa3cac0,
        Math.sin(i*43)*7.5,0,-(i%30)*1.4+6,this.ripples);
    }
    for(const side of [-1,1]){
      for(let i=0;i<11;i++){
        const z=3-i*3.9, x=side*(12+Math.sin(i*2.6)*2.1);
        const height=3+Math.abs(Math.sin(i*4.1))*7+i*.24;
        for(let tier=0;tier<4;tier++){
          const width=9-tier*1.36, depth=5.1-tier*.68;
          this.box(width,height/4,depth,[0x81483e,0xa55942,0xb5674a,0xce895c][tier],
            x+side*tier*.55,-2.5+height*(tier+.5)/4,z-tier*.32);
          this.box(width+.05,.09,depth+.03,0xe5a575,
            x+side*tier*.55,-2.5+height*(tier+1)/4,z-tier*.32);
        }
      }
    }
    // A cable footbridge frames the far end of the gorge.
    for(const x of [-7.5,7.5]){
      this.box(.35,5,.39,0x754c3b,x,3.6,-14.5);
      this.box(.63,.23,.63,0xf0ac66,x,6.17,-14.5);
    }
    for(let i=0;i<=36;i++){
      const x=(i-18)*.42, sag=(x/7.56)**2;
      this.box(.41,.13,1.5,0xbe7d4e,x,1.9+sag*.9,-14.5);
      for(const z of [-15.2,-13.8]){
        const cable=this.box(.46,.058,.058,0xf4c083,x,3.85+sag*2.1,z);
        cable.rotation.z=Math.atan(4.2*x/(7.56**2));
        if(i%3===0)this.box(.045,1.97+sag*1.2,.045,0xb97e54,x,2.87+sag*1.5,z);
      }
    }
    this.sun=new T.Mesh(new T.SphereGeometry(2,24,16),new T.MeshBasicMaterial({color:0xffe4ad,fog:false}));
    this.sun.position.set(-9,10,-35);this.scene.add(this.sun);
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
    this.label('REDROCK GORGE',3.8,.56,0,.48,1.77);
    for(const x of [-4.35,4.35]){
      this.box(.15,3.5,.15,0x754936,x,1.75,-2.2);
      this.box(.70,.13,.15,0x754936,x+.28,3.48,-2.2);
      this.box(.51,.76,.035,x<0?0xe4774e:0xe8b65e,x+.29,3.03,-2.2);
      this.box(.39,.085,.05,0xffdeb0,x+.29,3.16,-2.17);
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
    this.box(.48,.12,.38,0xb74843,0,.446,0,this.body);
    this.box(.29,.062,.038,0x23394e,0,.493,.19,this.body);
    this.box(.25,.075,.21,skin,0,.536,0,this.body);
    this.box(.62,.105,.39,white,0,.18,0,this.body);
    this.box(.64,.16,.40,ink,0,-.18,0,this.body);
    this.box(.23,.055,.035,0xffd57a,0,.34,.197,this.body);
    this.box(.28,.23,.026,0xf3e0b9,0,.035,.198,this.body);
    this.box(.049,.125,.017,ink,-.025,.038,.218,this.body);
    this.box(.086,.031,.017,ink,-.04,.091,.219,this.body);
    for(const side of [-1,1]){
      this.box(.026,.42,.11,0x9a3a42,side*.298,.22,.08,this.body);
      this.box(.06,.17,.024,0xffaa76,side*.246,.366,.199,this.body);
      this.box(.042,.12,.025,0xffcc92,side*.204,.395,.199,this.body);
      this.box(.12,.049,.027,0xeeb96d,side*.225,-.098,.201,this.body);
    }
    this.box(.43,.43,.39,skin,0,.75,0,this.body);
    this.box(.46,.14,.42,0x43383d,0,.94,-.015,this.body);
    this.box(.15,.23,.09,0x43383d,-.16,.83,-.16,this.body);
    this.box(.39,.05,.05,0x594048,0,.895,.202,this.body);
    this.box(.095,.13,.05,0x594048,-.146,.848,.202,this.body);
    this.box(.31,.075,.34,0x4a3539,-.052,1.022,-.035,this.body);
    this.box(.19,.045,.29,0x5d4140,-.084,1.079,-.051,this.body);
    this.box(.124,.044,.18,0x765148,-.081,1.089,.002,this.body);
    this.box(.109,.082,.072,0x49373b,.132,.904,.192,this.body);
    this.box(.058,.062,.064,0x5d4140,.167,.857,.188,this.body);
    for(const side of [-1,1]){
      this.box(.043,.101,.10,0xc78e72,side*.222,.724,.019,this.body);
      this.box(.014,.047,.042,0xe8b691,side*.248,.727,.038,this.body);
      this.box(.092,.029,.014,0x59403a,side*.104,.813,.201,this.body);
      this.box(.089,.056,.018,0xf3dfc6,side*.104,.766,.205,this.body);
      this.box(.038,.055,.019,0x293e4b,side*.098,.766,.217,this.body);
      this.box(.013,.014,.013,0xfff4d6,side*.098-.007,.777,.229,this.body);
      this.box(.068,.024,.014,0xc4836d,side*.139,.704,.201,this.body);
    }
    this.box(.059,.059,.034,0xe7b08c,0,.721,.203,this.body);
    this.box(.104,.027,.022,0x914d46,0,.665,.208,this.body);
    this.box(.071,.010,.014,0xf4d6b5,0,.672,.222,this.body);
    this.limbs=[-1,1].map(side=>{
      const arm=this.group(this.body,side*.405,.42,0);
      this.box(.19,.36,.21,skin,0,-.17,0,arm);
      this.box(.218,.124,.234,red,0,-.056,0,arm);
      this.box(.222,.028,.237,white,0,-.114,0,arm);
      const elbow=this.group(arm,0,-.34,0);
      this.box(.16,.33,.19,skin,0,-.14,0,elbow);
      this.box(.17,.077,.2,white,0,-.22,0,elbow);
      this.box(.175,.022,.204,0x53a8af,0,-.233,0,elbow);
      this.box(.143,.102,.167,skin,0,-.302,0,elbow);
      this.box(.056,.067,.075,0xc88d74,-side*.074,-.286,.046,elbow);
      const leg=this.group(this.body,side*.15,-.22,0);
      this.box(.235,.40,.25,ink,0,-.18,0,leg);
      this.box(.027,.33,.056,0x60b6b3,side*.119,-.18,.078,leg);
      this.box(.239,.035,.254,0x415d70,0,-.353,0,leg);
      const knee=this.group(leg,0,-.38,0);
      this.box(.20,.35,.22,skin,0,-.15,0,knee);
      this.box(.24,.13,.36,white,0,-.36,.045,knee);
      this.box(.244,.036,.368,0x415a71,0,-.405,.046,knee);
      this.box(.20,.052,.232,0xffedcf,0,-.266,.006,knee);
      this.box(.19,.045,.041,0xe8cdb1,0,-.353,.221,knee);
      for(const z of [.089,.127,.165])this.box(.134,.017,.018,0x557a85,0,-.290,z,knee);
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
      for(const dx of [-.082,.082]){
        this.box(.068,.019,.018,0x634842,x+dx,1.673,z+.008);
        this.box(.025,.12,.025,0x34526b,x+dx,1.315,z+.005);
      }
      this.box(.071,.018,.018,0x965a50,x,1.55,z+.008);
      this.box(.091,.039,.020,0xe9bd72,x+.146,1.304,z+.007);
      this.box(.26,.018,.17,0xf2e3bf,x+.36,1.132,z+.285);
      this.box(.116,.012,.02,0x385664,x+.34,1.146,z+.296);
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
    const evening=cup.color===0xa6a3ff;
    const sunset=cup.color===0xffbb70;
    this.scene.background.setHex(evening?0x766284:sunset?0xf1aa79:0x9fcad5);
    this.scene.fog.color.setHex(evening?0x98728a:sunset?0xe8ae86:0xb5cdd1);
    this.sun.material.color.setHex(evening?0xdedcf9:0xffe4ad);
    this.sun.position.y=sunset?6.8:10;
    this.ripples.position.z=Math.sin(t*.7)*.38;
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
      this.camera.position.set(4.7-intro*2.2,7.6-intro*1.5,14.4);
      this.camera.lookAt(0,2.7,-.35);
    }else if(intro!==null&&intro<2.9){
      this.camera.position.set(2.9,3.1,2.2);
      this.camera.lookAt(0,1.32,-3.75);
    }else if(intro!==null||celebrate){
      this.camera.position.set(2.8,3.45,7.8);
      this.camera.lookAt(0,2.37,0);
    }else{
      this.camera.position.set(2.8,4.4+height*.14,12.8);
      this.camera.lookAt(0,3.4+height*.12,0);
    }
    const zoom=intro===null&&!celebrate?1+Math.min(height,3)*.019:1;
    if(Math.abs(this.camera.zoom-zoom)>.003){this.camera.zoom=zoom;this.camera.updateProjectionMatrix();}
    this.renderer.render(this.scene,this.camera);
  }
}
