export const cups=[
  {name:'City Qualifier', targets:[1,1,1], time:2.65, height:2.6, color:0x56d8d1},
  {name:'Sunset Open', targets:[1,2,1], time:3.22, height:3.0, color:0xffbb70},
  {name:'Midnight Final', targets:[2,2,2], time:3.28, height:3.2, color:0xa6a3ff}
];
export const turn=Math.PI*2;
export const speed=5.65;
export function points(angle,target){
  const error=Math.abs(angle/turn-target);
  return error<=.07?3:error<=.18?2:error<=.33?1:0;
}
export function stars(results){
  const score=results.reduce((sum,n)=>sum+n,0);
  return results.length===3?(score>=8?3:score>=5?2:score>=3?1:0):0;
}
