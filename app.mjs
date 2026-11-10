import {cups,turn,speed,points,stars} from './core.mjs';
import {Arena} from './view.mjs';
import {BeaconHost} from './sdk.mjs';
const game='airtime-arena';
const key=game+'-v1';
const el=id=>document.getElementById(id);
function clean(value){
  const profile={
    medals:cups.map((_,i)=>Math.max(0,Math.min(3,Math.trunc(Number(value?.profile?.medals?.[i])||0)))),
    gold:value?.profile?.gold===true,
    confetti:value?.profile?.confetti===true
  };
  const cup=Number.isInteger(value?.cup)&&value.cup>=0&&value.cup<cups.length&&profile.medals.slice(0,value.cup).every(Boolean)?value.cup:0;
  const results=Array.isArray(value?.results)?value.results.slice(0,3).map(n=>Number.isInteger(n)&&n>=0&&n<=3?n:0):[];
  return {game,v:1,profile,cup,results};
}
let local;
try{local=JSON.parse(localStorage.getItem(key));}catch{}
let state=clean(local), view, support={}, flight=null, holding=false, active=false, mute=false, audio, impact=0, pointer=null;
let introStarted=null, scoreUntil=0;
const host=new BeaconHost(window,{
  status(value){support=value;rewardText();},
  reward(key){
    if(state.profile[key])return;
    state.profile[key]=true;save();sync();
    el('feedback').textContent=key==='gold'?'Gold uniform unlocked':'Finale confetti unlocked';
  },
  load(value){
    const remote=clean(value);
    if(!local&&!active&&!state.results.length)state=remote;
    else{
      state.profile.medals=state.profile.medals.map((n,i)=>Math.max(n,remote.profile.medals[i]));
      state.profile.gold ||= remote.profile.gold;
      state.profile.confetti ||= remote.profile.confetti;
    }
    sync();save();
  }
});
function rewardText(){
  const text=[];
  if(support.gold)text.push(state.profile.gold?'Gold uniform earned':'Like in GameWave for a gold uniform');
  if(support.confetti)text.push(state.profile.confetti?'Finale confetti earned':'Comment in GameWave for finale confetti');
  el('rewards').hidden=!text.length;
  el('rewards').textContent=text.join(' · ')+(text.length?' · Once per saved profile.':'');
}
function save(){
  try{localStorage.setItem(key,JSON.stringify(state));}catch{}
  host.save(state);
}
const soundtrack = el('soundtrack');
soundtrack.volume = 0.45;
let musicStarted = false;
function syncSoundtrack() {
  if (musicStarted && !mute && !document.hidden && state.results.length < 3) {
    if (soundtrack.paused) soundtrack.play().catch(() => {});
  } else {
    soundtrack.pause();
  }
}
function chime(f){
  if(mute)return;
  try{
    audio ||= new AudioContext();
    audio.resume().catch(()=>{});
    const o=audio.createOscillator(),g=audio.createGain(),now=audio.currentTime;
    o.frequency.setValueAtTime(f,now);o.frequency.exponentialRampToValueAtTime(f*.78,now+.22);
    g.gain.setValueAtTime(.09,now);g.gain.exponentialRampToValueAtTime(.001,now+.26);
    o.connect(g);g.connect(audio.destination);o.start();o.stop(now+.27);
  }catch{}
}
const cup=()=>cups[state.cup];
const target=()=>cup().targets[Math.min(state.results.length,2)];
function sync(){
  const done=state.results.length===3,medal=stars(state.results);
  el('cup').textContent=cup().name.toUpperCase();
  el('event').textContent=done?'Routine judged':'Jump '+(state.results.length+1)+' / 3';
  el('score').textContent=state.results.reduce((a,b)=>a+b,0)+' / 9 pts';
  el('target').textContent=target()===1?'Single somersault':'Double somersault';
  el('line').style.left='83.33%';
  el('action').disabled=done||introStarted!==null;
  el('action').textContent=flight?(holding?'Release to extend':'Hold to tuck'):'Jump ↑';
  el('result').hidden=!done;
  el('medal').textContent=['Keep practicing','Bronze medal','Silver medal','Gold medal'][medal]+(state.profile.confetti&&medal?' ✦ 🎉 ✦':'');
  el('summary').textContent=state.results.join(' + ')+' points across three landings';
  el('next').hidden=!medal||state.cup===cups.length-1;
  el('cups').replaceChildren(...cups.map((c,i)=>{
    const button=document.createElement('button');
    button.textContent=c.name+(state.profile.medals[i]?' ★'+state.profile.medals[i]:'');
    button.disabled=!state.profile.medals.slice(0,i).every(Boolean);
    button.classList.toggle('current',i===state.cup);
    button.onclick=()=>select(i);
    return button;
  }));
  rewardText();
}
function select(index){
  if(!cups[index]||!state.profile.medals.slice(0,index).every(Boolean))return;
  host.end();active=false;flight=null;holding=false;pointer=null;impact=0;
  state.cup=index;state.results=[];
  view.setScore(null);
  musicStarted = false;
  syncSoundtrack();
  openIntro();
  el('feedback').textContent='Ready on the deck';
  sync();save();
}
function jump(){
  if(flight||state.results.length===3||introStarted!==null)return;
  if(!active){active=true;host.start();}
  musicStarted = true;
  syncSoundtrack();
  flight={elapsed:0,angle:0,tuck:0};
  scoreUntil=0;
  el('judges').hidden=true;
  view.setScore(null);
  chime(330);
  el('feedback').textContent='Hold the button to tuck';
  sync();
}
function release(){
  holding=false;pointer=null;
  if(flight)el('action').textContent='Hold to tuck';
}
function land(){
  const score=points(flight.angle,target());
  flight=null;holding=false;impact=1;
  state.results.push(score);
  view.setScore(score);
  el('landing-score').textContent=score+' / 3';
  el('judges').hidden=false;
  scoreUntil=performance.now()+1700;
  el('feedback').textContent=['Off balance','Landing saved · +1','Clean landing · +2','Perfect landing · +3'][score];
  chime(score?475+score*87:165);
  if(state.results.length===3){
    state.profile.medals[state.cup]=Math.max(state.profile.medals[state.cup],stars(state.results));
    active=false;host.end();
    syncSoundtrack();
  }
  sync();save();
}
try{view=new Arena(document.querySelector('canvas'));}catch{
  el('feedback').textContent='This arena needs a browser with WebGL.';
  el('action').disabled=true;
}
function openIntro(){
  introStarted=performance.now();
  el('broadcast').hidden=false;
  el('shot').textContent='Arena overview';
  el('judges').hidden=true;
  scoreUntil=0;
}
function closeIntro(){
  introStarted=null;
  el('broadcast').hidden=true;
  el('feedback').textContent='Hold to jump and tuck';
  sync();
}
if(view){
  const action=el('action');
  action.onpointerdown=e=>{
    if(pointer!==null||action.disabled)return;
    e.preventDefault();pointer=e.pointerId;
    action.setPointerCapture(pointer);
    if(!flight)jump();
    holding=true;action.textContent='Release to extend';
  };
  for(const event of ['pointerup','pointercancel','lostpointercapture'])action.addEventListener(event,e=>{if(e.pointerId===pointer)release();});
  action.onclick=e=>{if(e.detail===0&&!flight)jump();};
  addEventListener('keydown',e=>{
    if(e.code!=='Space'||e.repeat||e.target.matches('button')&&e.target!==action)return;
    e.preventDefault();if(!flight)jump();holding=true;
  });
  addEventListener('keyup',e=>{if(e.code==='Space')release();});
  addEventListener('blur',release);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){release();save();}syncSoundtrack();});
  addEventListener('pagehide',()=>{soundtrack.pause();save();host.stop();});
  addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
  el('next').onclick=()=>select(state.cup+1);
  el('replay').onclick=()=>select(state.cup);
  el('skip').onclick=closeIntro;
  el('sound').onclick=()=>{
    mute=!mute;el('sound').textContent=mute?'Sound off':'♪ Sound';
    el('sound').setAttribute('aria-pressed',String(!mute));
    syncSoundtrack();
  };
  el('feedback').textContent=state.results.length===3?'Routine saved':state.results.length?'Ready for the next jump':'Hold to jump and tuck';
  if(!state.results.length)openIntro();
  sync();host.poll();
  let last=performance.now();
  function frame(now){
    const dt=Math.min(.04,(now-last)/1000);
    last=now;
    let intro=introStarted===null?null:(now-introStarted)/1000;
    if(intro!==null){
      if(intro>=4.4){closeIntro();intro=null;}
      else el('shot').textContent=intro<1.45?'Arena overview':intro<2.9?'Official judges':'Athlete ready';
    }
    if(scoreUntil&&now>=scoreUntil){scoreUntil=0;el('judges').hidden=true;}
    if(flight&&!document.hidden){
      flight.elapsed+=dt;
      if(holding)flight.angle+=speed*dt;
      flight.tuck+=(Number(holding)-flight.tuck)*Math.min(1,dt*12);
      if(flight.elapsed>=cup().time)land();
    }
    const ratio=(flight?.angle??0)/(target()*turn);
    el('spin').style.width=Math.min(100,ratio*83.33)+'%';
    el('turns').textContent=(ratio*target()).toFixed(2)+' / '+target()+' turns';
    impact=Math.max(0,impact-dt*4);
    const height=flight?Math.sin(Math.PI*flight.elapsed/cup().time)*cup().height:0;
    view.draw(cup(),height,flight?.angle??0,flight?.tuck??0,stars(state.results),impact,now/1000,state.profile.gold,intro);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
