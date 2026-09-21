import { chromium } from '@playwright/test';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const url=process.argv[2]||'http://127.0.0.1:4193';
const server=process.argv[2]?null:spawn('python',['-m','http.server','4193','--bind','127.0.0.1','--directory','dist'],{stdio:'ignore'});
let browser;
try{
 for(let i=0;i<40;i++){try{if((await fetch(url)).ok)break;}catch{} await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);await page.waitForFunction(()=>!!window.__elevator);
 const result=await page.evaluate(()=>{
  const e=window.__elevator;const results=[];
  for(const f of [3,0,2,1,3,0]){e.animateCabinTo(f);let n=0;while(e.getState().animating&&n++<3000)e.updateCabin(.016);results.push({...e.getState(),expected:100+200*f});}
  const cylinders=e.scene.children.filter(o=>o.geometry?.type==='CylinderGeometry');
  const rail=cylinders.find(o=>o.geometry.parameters.height===860);
  const drum=cylinders.find(o=>o.geometry.parameters.radiusTop===20);
  return {results,up:e.camera.up.toArray(),railRotation:rail.rotation.x,drumRotation:drum.rotation.x,rails:e.scene.children.filter(o=>o.name==='SensorRail').length};
 });
 for(const r of result.results){assert.equal(r.animating,false);assert.equal(r.z,r.expected);}
 assert.deepEqual(result.up,[0,0,1]);assert.ok(Math.abs(result.railRotation-Math.PI/2)<1e-8);assert.equal(result.drumRotation,0);assert.equal(result.rails,1);
 await page.locator('[data-floor="4"]').click();await page.waitForFunction(()=>window.__elevator.getState().currentFloor===3,{},{timeout:20000});
 await page.waitForTimeout(100);
 const rope=await page.evaluate(()=>({z:window.__elevator.rope.position.z,scale:window.__elevator.rope.scale.y}));assert.equal(rope.z,886);assert.ok(Math.abs(rope.scale-68/668)<1e-8);
 await page.screenshot({path:'qa-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);
 const layout=await page.evaluate(()=>{const ids=['info-panel','canvas-container','controls','camera-presets'];return Object.fromEntries(ids.map(id=>{const r=document.getElementById(id).getBoundingClientRect();return[id,{top:r.top,bottom:r.bottom,left:r.left,right:r.right}]}));});
 assert.ok(layout['info-panel'].bottom<=layout['camera-presets'].top);assert.ok(layout['camera-presets'].bottom<=layout['canvas-container'].top);assert.ok(layout['canvas-container'].bottom<=layout.controls.top);assert.ok(layout.controls.right<=390);
 await page.screenshot({path:'qa-mobile.png'});assert.deepEqual(errors,[]);
 console.log(JSON.stringify({url,result,rope,layout,errors,status:'PASS'},null,2));
}finally{await browser?.close();server?.kill();}
