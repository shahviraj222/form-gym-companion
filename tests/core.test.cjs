const {test}=require('node:test');
const assert=require('node:assert/strict');
const {PLAN,Session,dateKey,shiftDate,streak,stepsFor}=require('../app/src/main/assets/core.js');
const start=new Date(2026,8,7,10).getTime();
test('PDF plan preserves seven days, exercise order, reps and sets',()=>{
 assert.deepEqual(PLAN.map(p=>p.exercises.length),[6,6,6,2,7,6,0]);
 assert.deepEqual(PLAN[1].exercises.map(e=>e.name),['Squats','Reverse lunges','Glute bridges','Wall sit','Mountain climbers','Side plank']);
 assert.equal(PLAN[4].exercises[5].amount,'15 reps');
 assert.equal(PLAN[5].exercises[4].sets,4);
 assert.equal(stepsFor(0).length,18);
 assert.equal(stepsFor(1).length,21);
 assert.equal(stepsFor(5).length,23);
});
test('Monday includes both sides in each side-plank set',()=>{
 const sides=stepsFor(1).filter(x=>x.name==='Side plank');
 assert.deepEqual(sides.map(x=>`${x.set}-${x.side}`),['1-Left','1-Right','2-Left','2-Right','3-Left','3-Right']);
 assert.ok(sides.every(x=>x.seconds===30));
});
test('separates exercise from rest; rest expiry requires explicit start',()=>{
 const s=new Session(0,{},start);s.tick(start+12000);s.complete(true,start+12000);
 assert.equal(s.activeMs,12000);assert.equal(s.index,1);assert.equal(s.phase,'rest');
 s.tick(start+100000);assert.equal(s.restMs,45000);assert.equal(s.activeMs,12000);assert.equal(s.phase,'ready');
 s.tick(start+200000);assert.equal(s.activeMs,12000);
 s.startNext(start+200000);s.tick(start+205000);assert.equal(s.activeMs,17000);
});
test('timed exercise clamps at target, prevents double completion',()=>{
 const s=new Session(5,{},start);s.tick(start+90000);
 assert.equal(s.activeMs,45000);assert.equal(s.phase,'setDone');
 s.complete(true,start+91000);s.complete(true,start+92000);assert.equal(s.index,1);assert.equal(s.logs.length,1);
});
test('pausing and restoring never count time away',()=>{
 const s=new Session(0,{},start);s.pause(start+8000);s.tick(start+18000);assert.equal(s.activeMs,8000);
 s.resume(start+20000);s.tick(start+25000);assert.equal(s.activeMs,13000);
 const copy=Session.restore(JSON.parse(JSON.stringify(s)),start+80000);assert.equal(copy.phase,'paused');
 copy.tick(start+90000);assert.equal(copy.activeMs,13000);copy.resume(start+100000);copy.tick(start+103000);assert.equal(copy.activeMs,16000);
});
test('mid-set rest retains work time and does not complete a set',()=>{
 const s=new Session(5,{},start);s.breakNow(start+10000);assert.equal(s.logs.length,0);assert.equal(s.stepMs,10000);
 s.startNext(start+20000);s.tick(start+25000);assert.equal(s.stepMs,15000);assert.equal(s.restMs,10000);
});
test('full session has ordered logs and an accurate completion record',()=>{
 const s=new Session(0,{},start);let now=start;
 for(let i=0;i<18;i++){now+=60000;s.complete(false,now)}
 assert.equal(s.phase,'finished');assert.equal(s.logs.length,18);
 assert.equal(s.logs[3].name,'Pike push-ups');assert.equal(s.logs[3].set,1);
 assert.equal(s.record(true,new Date(now)).completed,true);
 assert.equal(s.activeMs,15*60000+3*40000);
});
test('streak counts unique completed dates, preserves Saturday, ignores partial sessions',()=>{
 const h=['2026-09-03','2026-09-04','2026-09-06'].map(date=>({date,completed:true,kind:'workout'}));
 assert.equal(streak(h,'2026-09-06'),3);assert.equal(streak(h,'2026-09-07'),3);
 h.push(h[2]);assert.equal(streak(h,'2026-09-07'),3);
 h.push({date:'2026-09-07',completed:false});assert.equal(streak(h,'2026-09-07'),3);
 assert.equal(streak(h,'2026-09-08'),0);
 assert.equal(streak([],'2026-09-05'),0);
});
test('recovery completion counts and a missed recovery breaks the streak',()=>{
 const h=[{date:'2026-09-01',completed:true,kind:'workout'},{date:'2026-09-03',completed:true,kind:'workout'}];
 assert.equal(streak(h,'2026-09-03'),1);h.push({date:'2026-09-02',completed:true,kind:'recovery'});assert.equal(streak(h,'2026-09-03'),3);
});
test('calendar arithmetic crosses month/year without UTC day drift',()=>{
 assert.equal(shiftDate('2026-01-01',-1),'2025-12-31');assert.equal(shiftDate('2026-02-28',1),'2026-03-01');assert.equal(dateKey(new Date(2026,8,7,0,1)),'2026-09-07');
});
test('timer preferences remain within supplied plan ranges when selected',()=>{
 assert.equal(stepsFor(3,{walkMinutes:45})[0].seconds,2700);
 assert.equal(stepsFor(5,{hollowSeconds:20}).at(-1).seconds,20);
 assert.equal(new Session(6,{},start).phase,'finished');
});
