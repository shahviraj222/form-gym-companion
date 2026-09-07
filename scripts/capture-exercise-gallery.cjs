require('node:fs').mkdirSync('output',{recursive:true});
const fs=require('node:fs');
const {chromium}=require(process.env.FORM_PLAYWRIGHT || 'playwright');
const {PLAN}=require('../app/src/main/assets/core.js');
const visuals=require('../app/src/main/assets/exercise-visuals.js');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.FORM_CHROMIUM || undefined});
 const page=await browser.newPage({viewport:{width:980,height:1000},deviceScaleFactor:1});
 const names=[...new Set(PLAN.flatMap(d=>d.exercises.map(e=>e.name)))];
 for(let i=0;i<names.length;i+=6){
  await page.setContent(`<html><head><style>${fs.readFileSync('app/src/main/assets/styles.css','utf8')} body{padding:24px;background:#111411}.gallery{display:grid;grid-template-columns:1fr 1fr;gap:18px}.gallery article{background:#192016;padding:18px;border:1px solid #34412b;border-radius:16px}.gallery h2{margin-bottom:12px;font-size:18px}.thumbnail{width:92px;height:73px;margin-top:8px;border:1px solid #34412b;border-radius:9px}.thumbnail svg{max-height:73px}</style></head><body><div class="gallery">${names.slice(i,i+6).map(n=>`<article><h2>${n}</h2>${visuals.render(n)}<div class="thumbnail">${visuals.render(n,{compact:true})}</div></article>`).join('')}</div></body></html>`);
  await page.screenshot({path:`output/visual-gallery-${1+i/6}.png`,fullPage:true});
 }
 for(const name of names){
  for(const compact of [true,false]){
   const svg=visuals.render(name,{compact});
   const error=await page.evaluate(s=>new DOMParser().parseFromString(s,'image/svg+xml').querySelector('parsererror')?.textContent,svg);
   if(error)throw Error(`${name}: ${error}`);
  }
 }
 console.log(`Visually inspect output/visual-gallery-1..4.png; all ${names.length*2} full/compact SVGs parse successfully.`);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
