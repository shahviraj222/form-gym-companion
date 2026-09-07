const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {PLAN}=require('../app/src/main/assets/core.js');
const visuals=require('../app/src/main/assets/exercise-visuals.js');
const guides=require('../app/src/main/assets/exercise-guides.js');
const names=[...new Set(PLAN.flatMap(day=>day.exercises.map(e=>e.name)))];
test('every planned movement has a specific visual and a complete guide',()=>{
 for(const name of names){
  assert.ok(visuals.catalog[name],`Missing illustration: ${name}`);
  assert.ok(guides[name],`Missing guide: ${name}`);
  assert.equal(guides[name].steps.length,3,`${name}: expected three readable steps`);
  assert.ok(guides[name].cue && guides[name].equipment && guides[name].avoid,`${name}: incomplete cues`);
  assert.match(guides[name].source.url,/^https:\/\//);
  for(const compact of [true,false]){
   const svg=visuals.render(name,{compact});
   assert.match(svg,/<svg\b/);assert.match(svg,/viewBox=/);assert.match(svg,/role="img"/);
   assert.doesNotMatch(svg,/<image\b|<script\b|onload=|(?:href|src)=["\']https?:\/\//i,`${name}: SVG must be self contained`);
  }
 }
});
test('native and desktop asset allowlists include both visual libraries before app initialization',()=>{
 const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
 const native=fs.readFileSync('app/src/main/java/com/sixpack/trainer/MainActivity.java','utf8');
 const preview=fs.readFileSync('scripts/preview.cjs','utf8');
 for(const file of ['exercise-visuals.js','exercise-guides.js','nutrition.js']){
  assert.ok(html.indexOf(`src="${file}"`)<html.indexOf('src="app.js"'));
  assert.ok(native.includes(`"${file}"`));assert.ok(preview.includes(`'${file}'`));
 }
});
