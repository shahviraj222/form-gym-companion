(function (root) {
  'use strict';
  const ex = (name, sets, amount, seconds=0, sides=false) => ({name,sets,amount,seconds,sides});
  const PLAN = [
    {day:'Sunday',focus:'Chest + Abs',tag:'UPPER BODY',kind:'workout',exercises:[ex('Push-ups',3,'12 reps'),ex('Pike push-ups',3,'8 reps'),ex('Chair dips',3,'10 reps'),ex('Crunches',3,'20 reps'),ex('Leg raises',3,'12 reps'),ex('Plank',3,'40 sec',40)]},
    {day:'Monday',focus:'Legs + Core',tag:'LOWER BODY',kind:'workout',exercises:[ex('Squats',3,'20 reps'),ex('Reverse lunges',3,'10 reps / leg'),ex('Glute bridges',3,'20 reps'),ex('Wall sit',3,'40 sec',40),ex('Mountain climbers',3,'30 sec',30),ex('Side plank',3,'30 sec / side',30,true)]},
    {day:'Tuesday',focus:'Back + Abs',tag:'PULL + CORE',kind:'workout',exercises:[ex('Backpack rows',3,'15 reps'),ex('Superman',3,'15 reps'),ex('Reverse snow angels',3,'12 reps'),ex('Bicycle crunches',3,'20 reps'),ex('Leg raises',3,'12 reps'),ex('Plank',3,'45 sec',45)]},
    {day:'Wednesday',focus:'Active recovery',tag:'RESET & RECHARGE',kind:'recovery',exercises:[ex('Walking',1,'30–45 min',1800),ex('Stretching',1,'10 min',600)]},
    {day:'Thursday',focus:'Full Body + Abs',tag:'TOTAL BODY',kind:'workout',exercises:[ex('Push-ups',3,'12 reps'),ex('Squats',3,'20 reps'),ex('Backpack rows',3,'15 reps'),ex('Lunges',3,'10 reps / leg'),ex('Chair dips',3,'10 reps'),ex('Leg raises',3,'15 reps'),ex('Plank',3,'45 sec',45)]},
    {day:'Friday',focus:'Conditioning + Abs',tag:'MOVE & SWEAT',kind:'workout',exercises:[ex('Jumping jacks',4,'45 sec',45),ex('High knees',4,'30 sec',30),ex('Mountain climbers',4,'30 sec',30),ex('Burpees',4,'8 reps'),ex('Crunches',4,'20 reps'),ex('Hollow-body hold',3,'20–30 sec',25)]},
    {day:'Saturday',focus:'Rest & recharge',tag:'RECOVERY IS PROGRESS',kind:'rest',exercises:[]}
  ];
  function dateKey(d=new Date()) {return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function shiftDate(key, delta) {const [y,m,d]=key.split('-').map(Number);return dateKey(new Date(y,m-1,d+delta,12));}
  function dayOf(key) {const [y,m,d]=key.split('-').map(Number);return new Date(y,m-1,d,12).getDay();}
  function streak(history, today=dateKey()) {
    const done=new Set(history.filter(h=>h.completed && h.kind!=='rest').map(h=>h.date));
    let cursor=today,count=0;
    if(!done.has(cursor)) cursor=shiftDate(cursor,-1);
    for(let i=0;i<36600;i++,cursor=shiftDate(cursor,-1)) {
      if(dayOf(cursor)===6) continue;
      if(!done.has(cursor)) break;
      count++;
    }
    return count;
  }
  function stepsFor(day,settings={}) {
    const list=[];
    PLAN[day].exercises.forEach((e,ei)=>{
      for(let set=1;set<=e.sets;set++) {
        for(let side=0;side<(e.sides?2:1);side++) {
          let seconds=e.name==='Walking'?(settings.walkMinutes||30)*60:e.name==='Hollow-body hold'?(settings.hollowSeconds||25):e.seconds;
          list.push({...e,seconds,ei,set,side:e.sides?(side===0?'Left':'Right'):null});
        }
      }
    });
    return list;
  }
  class Session {
    constructor(day,settings={},now=Date.now()) {
      this.id=`${now}-${Math.random().toString(36).slice(2,8)}`;
      this.day=day;this.date=dateKey(new Date(now));this.steps=stepsFor(day,settings);this.index=0;this.phase=this.steps.length?'work':'finished';this.activeMs=0;this.restMs=0;this.stepMs=0;this.restLeft=0;this.restDuration=(settings.restSeconds||45)*1000;this.logs=[];this.last=now;this.beforePause='work';
    }
    get current(){return this.steps[this.index];}
    tick(now=Date.now()) {
      let delta=Math.max(0,now-this.last);this.last=now;
      if(this.phase==='work') {
        const target=this.current.seconds*1000;
        if(target)delta=Math.min(delta,Math.max(0,target-this.stepMs));
        this.activeMs+=delta;this.stepMs+=delta;
        if(target&&this.stepMs>=target)this.phase='setDone';
      } else if(this.phase==='rest') {
        delta=Math.min(delta,this.restLeft);this.restMs+=delta;this.restLeft=Math.max(0,this.restLeft-delta);
        if(!this.restLeft)this.phase='ready';
      }
    }
    pause(now=Date.now()){this.tick(now);if(['work','rest'].includes(this.phase)){this.beforePause=this.phase;this.phase='paused';}}
    resume(now=Date.now()){if(this.phase==='paused'){this.phase=this.beforePause;this.last=now;}}
    complete(withRest=true,now=Date.now()) {
      this.tick(now);
      if(!['work','setDone'].includes(this.phase))return;
      this.logs.push({name:this.current.name,set:this.current.set,side:this.current.side,amount:this.current.amount,activeMs:this.stepMs});
      this.index++;this.stepMs=0;
      if(this.index>=this.steps.length){this.phase='finished';return;}
      this.phase=withRest?'rest':'work';this.restLeft=withRest?this.restDuration:0;this.last=now;
    }
    startNext(now=Date.now()){this.tick(now);if(['rest','ready'].includes(this.phase)){this.phase='work';this.last=now;}}
    breakNow(now=Date.now()){this.tick(now);if(this.phase==='work'){this.phase='rest';this.restLeft=this.restDuration;}}
    record(completed,now=new Date()) {return {id:this.id,date:dateKey(now),startedDate:this.date,day:this.day,focus:PLAN[this.day].focus,kind:PLAN[this.day].kind,completed,activeMs:this.activeMs,restMs:this.restMs,logs:this.logs,at:now.toISOString()};}
    static restore(data,now=Date.now()) {const s=Object.assign(Object.create(Session.prototype),data);s.last=now;if(['work','rest'].includes(s.phase)){s.beforePause=s.phase;s.phase='paused';}return s;}
  }
  const api={PLAN,dateKey,shiftDate,dayOf,streak,stepsFor,Session};
  if(typeof module!=='undefined')module.exports=api;
  root.GymCore=api;
})(typeof window!=='undefined'?window:globalThis);
