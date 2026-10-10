/* Run with the existing Puppeteer image; all network traffic stays on loopback. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const puppeteer = require('/home/pptruser/node_modules/puppeteer');
const root = '/site/dist';
const output = '/qa';
const basePath = process.env.SITE_BASE_PATH || '/';
assert.match(basePath, /^\/(?:[a-zA-Z0-9_-]+\/)*$/);
const outcomes = [];
const errors = [];
const failedRequests = [];
let browser, server, currentPage;

async function check(name, callback) {
  await callback();
  outcomes.push({name, status:'passed'});
  console.log('PASS '+name);
}
async function main() {
  await fs.rm(output+'/downloads',{recursive:true,force:true});
  await fs.mkdir(output+'/downloads',{recursive:true});
  const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
  server=http.createServer(async(req,res)=>{
    try {
      const requestPath=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if(!requestPath.startsWith(basePath))throw Error('outside site path');
      const relative='/'+requestPath.slice(basePath.length);
      const filename=path.resolve(root,'.'+(relative==='/'?'/index.html':relative));
      if(!filename.startsWith(root+'/'))throw Error('outside root');
      const body=await fs.readFile(filename);
      res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'text/plain'});res.end(body);
    }catch{res.writeHead(404);res.end('Not found');}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}${basePath}`;
  browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage'],defaultViewport:{width:1440,height:1000,deviceScaleFactor:1}});
  const page=await browser.newPage();
  currentPage=page;
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400)failedRequests.push({url:response.url(),status:response.status()});});
  await page.setRequestInterception(true);
  page.on('request',request=>{const url=request.url();if(url.startsWith(base)||url.startsWith('data:')||url.startsWith('blob:')||url.startsWith('file:'))request.continue();else request.abort();});
  const cdp=await page.createCDPSession();
  await cdp.send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:output+'/downloads'});
  async function go(hash){
    await page.goto(base+hash,{waitUntil:'networkidle0'});
    await page.waitForFunction(expected=>location.hash===expected&&document.querySelector('#main').dataset.route===expected,{},hash);
  }
  async function value(selector,value){await page.select(selector,value);}
  async function setRequirement(id, requirement){
    await page.click(`[data-review="${id}"]`);
    await page.select('#review-requirement',requirement);
    await page.click('#review-form button[type="submit"]');
  }
  await go('#catalog');
  await check('Catalog has all 34 groups and the pinned totals',async()=>{
    assert.equal(await page.$$eval('.group-card',els=>els.length),34);
    assert.match(await page.$eval('#results-count',el=>el.textContent),/203 of 203/);
    assert.equal(await page.$$eval('[data-group-link]',els=>els.length),34);
  });
  await page.screenshot({path:output+'/catalog-desktop.png',fullPage:false});
  await check('Full-parity groups and subfeatures default to merge without assigning partial or missing items',async()=>{
    await value('[data-filter="requirement"]','merge');
    assert.equal(await page.$$eval('.group-card',els=>els.length),19);
    await page.click('[data-view="criteria"]');
    const ids=await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent));
    assert.equal(ids.length,151);
    assert.ok(ids.includes('F03.S01')); // Full-parity subfeature inside a partial group.
    assert.ok(ids.includes('F25.S04')); // Full-parity fallback inside an absent group.
    assert.ok(!ids.includes('F01.S04')); // Missing subfeature inside a full-parity group.
    assert.ok(ids.includes('F09.S03')); // Corrected input proves the note outcome.
    await value('[data-filter="requirement"]','unassigned');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),52);
    await value('[data-filter="requirement"]','release');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),0);
    await value('[data-filter="requirement"]','not-needed');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),0);
    assert.equal(await page.$eval('#review-progress-text',el=>el.textContent),'0 / 203');
    await page.click('[data-action="clear-filters"]');
  });
  await check('Criterion search and subfeature view return the exact ID',async()=>{
    await page.type('#catalog-search','F19.S03');
    assert.equal(await page.$$eval('.group-card',els=>els.length),1);
    await page.click('[data-view="criteria"]');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),1);
    assert.match(await page.$eval('.criterion-result',el=>el.textContent),/Copy the resulting signature/);
  });
  await check('Filter state survives a page reload',async()=>{
    await page.reload({waitUntil:'networkidle0'});
    assert.equal(await page.$eval('#catalog-search',el=>el.value),'F19.S03');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),1);
  });
  await check('Direct criterion navigation opens the relevant comparison',async()=>{
    await page.click('.criterion-result');
    await page.waitForSelector('[id="F19.S03"]');
    assert.equal(await page.$eval('h1',el=>el.textContent),'Sign and Verify Messages');
    assert.equal(await page.$$eval('.application-evidence',els=>els.length),6);
  });
  await check('Capture viewer opens originals and supports zoom and Escape',async()=>{
    await page.click('[id="F19.S03"] .capture-preview');
    await page.waitForFunction(()=>document.querySelector('#capture-image').complete&&document.querySelector('#capture-image').naturalWidth>0);
    assert.equal(await page.$eval('#capture-dialog',el=>el.open),true);
    await page.click('#capture-zoom');
    assert.equal(await page.$eval('#capture-canvas',el=>el.classList.contains('actual-size')),true);
    await page.keyboard.press('Escape');
    assert.equal(await page.$eval('#capture-dialog',el=>el.open),false);
  });
  await go('#catalog?parity=parity');
  await check('Group parity filters the whole feature, independently of evidence',async()=>{
    assert.deepEqual(await page.$$eval('[data-filter="parity"] option',els=>els.map(el=>el.textContent)),['Any implementation','Parity','Partial parity','Not implemented']);
    assert.deepEqual(await page.$$eval('.group-card .group-card-top .criterion-id',els=>els.map(el=>el.textContent)),['F01','F02','F04','F06','F07','F08','F10','F11','F12','F16','F19','F20','F21','F22','F24','F26','F28','F30','F33']);
    assert.equal(await page.$$eval('.group-card .parity-badge[data-parity="parity"]',els=>els.length),19);
    assert.match(await page.$eval('#filter-scope',el=>el.textContent),/whole feature groups/);
    await page.reload({waitUntil:'networkidle0'});
    assert.equal(await page.$eval('[data-filter="parity"]',el=>el.value),'parity');
  });
  await check('Group filters assess the main goal even when secondary capabilities differ',async()=>{
    await value('[data-filter="parity"]','partial');
    assert.equal(await page.$$eval('.group-card',els=>els.length),12);
    assert.ok(await page.$('.group-card[href="#feature/F03"]'));
    assert.equal(await page.$('.group-card[href="#feature/F01"]'),null);
    assert.ok(await page.$('.group-card[href="#feature/F34"]')); // RPC rescan exists; progress/cancel do not.
    await value('[data-filter="parity"]','not-implemented');
    assert.deepEqual(await page.$$eval('.group-card .group-card-top .criterion-id',els=>els.map(el=>el.textContent)),['F05','F25','F32']);
    assert.match(await page.$eval('.group-card[href="#feature/F25"] .implementation-summary',el=>el.textContent),/Criterion detail: 1 parity/); // In-app errors do not fulfill desktop notifications.
    assert.equal(await page.$('.group-card[href="#feature/F01"]'),null);
    await page.screenshot({path:output+'/parity-groups.png'});
  });
  await check('Subfeature parity distinguishes partial functionality from absence',async()=>{
    await page.click('[data-view="criteria"]');
    const absent=await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent));
    assert.equal(absent.length,38);
    assert.ok(absent.includes('F01.S04'));
    assert.ok(absent.includes('F03.S04'));
    assert.ok(!absent.includes('F15.S03')); // Receiving exists; device verification is missing.
    await value('[data-filter="parity"]','partial');
    const partial=await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent));
    assert.equal(partial.length,14);
    assert.ok(partial.includes('F15.S03'));
    assert.ok(!partial.includes('F09.S03'));
    assert.ok(partial.includes('F14.S01')); // File import exists; compatibility still blocks some transactions.
    await value('[data-filter="parity"]','parity');
    const parity=await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent));
    assert.equal(parity.length,151);
    assert.ok(parity.includes('F04.S02')); // Source evidence, without a runtime assertion or capture.
    assert.ok(parity.includes('F21.S04')); // Physical router not tested.
    for(const id of ['F02.S04','F08.S06','F13.S05','F14.S06','F24.S03'])assert.ok(parity.includes(id),id); // Equivalent reachable workflows.
    assert.equal(new Set([...parity,...partial,...absent]).size,203);
    assert.match(await page.$eval('#filter-scope',el=>el.textContent),/individual criteria/);
  });
  await check('Parity and evidence coverage can be combined without conflating them',async()=>{
    await value('[data-filter="evidence"]','partial');
    await page.type('#catalog-search','F04.S02');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),1);
    assert.ok(await page.$('.criterion-result .parity-badge[data-parity="parity"]'));
    await page.reload({waitUntil:'networkidle0'});
    assert.equal(await page.$eval('[data-filter="parity"]',el=>el.value),'parity');
    assert.equal(await page.$eval('[data-filter="evidence"]',el=>el.value),'partial');
    await page.click('.criterion-result');
    await page.waitForSelector('[id="F04.S02"] .parity-detail');
    assert.ok(await page.$('[id="F04.S02"] .parity-badge[data-parity="parity"]'));
    assert.equal(await page.$$eval('[id="F04.S02"] .application-evidence',els=>els.length),2);
    assert.match(await page.$eval('[id="F04.S02"] .parity-detail',el=>el.textContent),/automatic backup/);
    await page.screenshot({path:output+'/parity-feature.png'});
  });
  await go('#catalog?parity=parity');
  await check('Opening a parity group explains its goal and preserves secondary gaps',async()=>{
    await page.click('.group-card[href="#feature/F01"]');
    await page.waitForSelector('[id="F01.S04"]');
    assert.equal(await page.$$eval('.criterion-card',els=>els.length),6);
    assert.equal(await page.$$eval('.criterion-card .parity-badge[data-parity="parity"]',els=>els.length),5);
    assert.equal(await page.$$eval('.criterion-card .parity-badge[data-parity="not-implemented"]',els=>els.length),1);
    assert.ok(await page.$('.feature-heading .parity-badge[data-parity="parity"]'));
    assert.match(await page.$eval('.outcome-assessment',el=>el.textContent),/Create a usable wallet/);
    assert.match(await page.$eval('.outcome-assessment',el=>el.textContent),/blank-wallet creation remains a secondary gap/);
    await page.screenshot({path:output+'/outcome-group.png'});
  });
  await go('#feature/F08?item=F08.S06');
  await check('Equivalent sharing workflow reaches parity while original missing-method evidence remains visible',async()=>{
    assert.ok(await page.$('[id="F08.S06"] .parity-badge[data-parity="parity"]'));
    assert.match(await page.$eval('[id="F08.S06"] .parity-detail',el=>el.textContent),/copied or saved/);
    assert.ok(await page.$('[id="F08.S06"] .application-evidence[aria-label^="GUI-QML"] .badge-gap'));
    assert.equal(await page.$$eval('[id="F08.S06"] .application-evidence',els=>els.length),2);
    await page.screenshot({path:output+'/outcome-subfeature.png'});
  });
  await go('#catalog?evidence=full&view=criteria');
  let fullIds, partialIds;
  await check('Full evidence requires GUI-QML automation and a capture',async()=>{
    assert.deepEqual(await page.$$eval('[data-filter="evidence"] option',els=>els.map(el=>el.textContent)),['Any evidence','Full','Partial']);
    assert.equal(await page.$('[data-filter="app"]'),null);
    fullIds=await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent));
    assert.equal(fullIds.length,90);
    assert.ok(fullIds.includes('F01.S01'));
    assert.ok(!fullIds.includes('F09.S08')); // Scoped automated tests, but no QML capture.
    assert.ok(fullIds.includes('F09.S03')); // Rerun assertion and matching captures.
    assert.equal(await page.$$eval('.result-statuses',els=>els.every(el=>el.textContent.includes('Qt Widgets')&&el.textContent.includes('GUI-QML'))),true);
  });
  await check('Partial evidence includes every incomplete criterion and missing workflow',async()=>{
    await value('[data-filter="evidence"]','partial');
    partialIds=await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent));
    assert.equal(partialIds.length,113);
    assert.ok(!partialIds.includes('F09.S03'));
    assert.ok(partialIds.includes('F09.S08'));
    assert.ok(partialIds.includes('F04.S02'));
    assert.equal(await page.$$eval('.result-statuses .badge-gap:not(.parity-badge)',els=>els.length),43);
    assert.equal(new Set([...fullIds,...partialIds]).size,203);
    assert.equal(fullIds.some(id=>partialIds.includes(id)),false);
    await page.reload({waitUntil:'networkidle0'});
    assert.equal(await page.$eval('[data-filter="evidence"]',el=>el.value),'partial');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),113);
  });
  await check('Capture filters use GUI-QML and preserve the Widgets reference',async()=>{
    await value('[data-filter="captures"]','yes');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),26);
    await value('[data-filter="captures"]','no');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),87);
    await page.$eval('#catalog-search',el=>{el.value='F09.S02';el.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),1); // Widgets has a capture; QML has none.
    await page.click('.criterion-result');
    await page.waitForSelector('[id="F09.S02"]');
    assert.equal(await page.$$eval('[id="F09.S02"] .application-evidence',els=>els.length),2);
    assert.ok(await page.$('[id="F09.S02"] .application-evidence[aria-label^="Qt Widgets"] .capture-preview'));
    assert.match(await page.$eval('[id="F09.S02"]',el=>el.textContent),/no saved-recipient picker/);
    await go('#feature/F09');
    await page.click('[data-action="clear-filters"]');
    const count=await page.evaluate(()=>window.REVIEW_EVIDENCE.groups.find(g=>g.id==='F09').criteria.length);
    assert.equal(await page.$$eval('.criterion-card',els=>els.length),count);
  });
  await check('Legacy application and evidence links migrate to GUI-QML coverage',async()=>{
    await page.goto(base+'#catalog?app=widgets&evidence=gap&view=criteria',{waitUntil:'networkidle0'});
    assert.equal(await page.evaluate(()=>location.hash),'#catalog?evidence=partial&view=criteria');
    assert.equal(await page.$eval('[data-filter="evidence"]',el=>el.value),'partial');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),113);
    assert.equal(await page.$('[data-filter="app"]'),null);
  });
  await check('Reset restores the full catalog',async()=>{
    await page.click('[data-action="clear-filters"]');
    assert.equal(await page.$$eval('.group-card',els=>els.length),34);
  });
  await check('Feature-area navigation filters by the selected area',async()=>{
    await page.click('[data-area="application"]');
    assert.equal(await page.$$eval('.group-card',els=>els.length),9);
    await page.click('[data-area="all"]');
  });
  await go('#feature/F19');
  await check('A group requirement becomes the default without marking subfeatures reviewed',async()=>{
    await page.click('[data-review="F19"]');
    assert.equal(await page.$eval('#review-detail-fields',el=>el.hidden),true);
    assert.deepEqual(await page.$$eval('#review-requirement option',els=>els.map(el=>el.textContent)),['Needed for merge','Needed for release','Not needed','Unassigned']);
    await page.select('#review-requirement','merge');
    await page.click('#review-form button[type="submit"]');
    assert.ok(await page.$('[id="F19.S01"] [data-requirement="merge"]'));
    assert.match(await page.$eval('[id="F19.S01"] .requirement-badge',el=>el.textContent),/from group/);
    assert.equal(await page.$eval('#review-progress-text',el=>el.textContent),'0 / 203');
    await page.reload({waitUntil:'networkidle0'});
    assert.ok(await page.$('.group-requirement [data-requirement="merge"]'));
    await page.screenshot({path:output+'/requirement-group.png'});
  });
  await check('Subfeature overrides survive group edits, and inheritance or Unassigned can be restored',async()=>{
    await setRequirement('F19.S02','release');
    await setRequirement('F19.S03','not-needed');
    await setRequirement('F19','release');
    assert.ok(await page.$('[id="F19.S01"] [data-requirement="release"]'));
    assert.ok(await page.$('[id="F19.S03"] [data-requirement="not-needed"]'));
    await setRequirement('F19','merge');
    assert.ok(await page.$('[id="F19.S02"] [data-requirement="release"]'));
    await setRequirement('F19.S01','unassigned');
    assert.ok(await page.$('[id="F19.S01"] [data-requirement="unassigned"]'));
    await setRequirement('F19.S01','inherit');
    assert.ok(await page.$('[id="F19.S01"] [data-requirement="merge"]'));
    await setRequirement('F19','unassigned');
    assert.ok(await page.$('[id="F19.S01"] [data-requirement="unassigned"]'));
    assert.ok(await page.$('[id="F19.S02"] [data-requirement="release"]'));
    await setRequirement('F19','merge');
    assert.equal(await page.$eval('#review-progress-text',el=>el.textContent),'0 / 203');
  });
  await check('Personal review notes save literally and survive reload',async()=>{
    await page.click('[data-review="F19.S01"]');
    assert.equal(await page.$eval('#review-detail-fields',el=>el.hidden),false);
    assert.equal(await page.$eval('#review-requirement',el=>el.value),'inherit');
    await page.select('#review-state','reviewed');
    await page.type('#review-note','Checked signing scope. <script>window.noteInjected = true</script>');
    await page.screenshot({path:output+'/requirement-review.png'});
    await page.click('#review-form button[type="submit"]');
    await page.reload({waitUntil:'networkidle0'});
    assert.match(await page.$eval('[id="F19.S01"] .saved-note',el=>el.textContent),/<script>/);
    assert.equal(await page.evaluate(()=>window.noteInjected),undefined);
    assert.match(await page.$eval('[data-review="F19.S01"]',el=>el.textContent),/Review details/);
    assert.equal(await page.$eval('[data-quick-review="F19.S01"]',el=>el.getAttribute('aria-pressed')),'true');
    assert.match(await page.$eval('#review-progress-text',el=>el.textContent),/^1 \/ 203$/);
  });
  await check('Review export includes the snapshot identity and personal notes',async()=>{
    await page.click('#export-review');
    let files=[];
    for(let tries=0;tries<50&&!files.length;tries++){files=(await fs.readdir(output+'/downloads')).filter(f=>f.endsWith('.json'));if(!files.length)await new Promise(r=>setTimeout(r,100));}
    assert.equal(files.length,1);
    const payload=JSON.parse(await fs.readFile(output+'/downloads/'+files[0],'utf8'));
    assert.equal(payload.schemaVersion,2);assert.equal(payload.reviews['F19.S01'].status,'reviewed');assert.equal(payload.evidenceDate,'2026-10-08');
    assert.equal(payload.reviews.F19.requirement,'merge');
    assert.equal(payload.reviews['F19.S01'].requirement,'inherit');
    assert.equal(payload.reviews['F19.S02'].requirement,'release');
    assert.equal(payload.reviews['F19.S03'].requirement,'not-needed');
    await fs.writeFile(output+'/roundtrip.json',JSON.stringify(payload));
    await fs.writeFile(output+'/import.json',JSON.stringify({...payload,schemaVersion:1,reviews:{'F01.S01':{status:'followup',note:'Review import check',updatedAt:new Date().toISOString()}}}));
    await fs.writeFile(output+'/wrong-snapshot.json',JSON.stringify({...payload,catalogId:'wrong-snapshot'}));
    await fs.writeFile(output+'/conflict.json',JSON.stringify({...payload,reviews:{F19:{...payload.reviews.F19,requirement:'not-needed'},'F19.S01':{...payload.reviews['F19.S01'],note:'Must not replace existing note',requirement:'release'}}}));
    await fs.writeFile(output+'/invalid.json',JSON.stringify({...payload,reviews:{'F19.S03':{...payload.reviews['F19.S03'],requirement:'urgent'}}}));
  });
  await check('Older review files remain importable and wrong snapshots are rejected',async()=>{
    await (await page.$('#import-file')).uploadFile(output+'/import.json');
    await page.waitForFunction(()=>document.querySelector('#review-progress-text').textContent==='2 / 203');
    await (await page.$('#import-file')).uploadFile(output+'/wrong-snapshot.json');
    await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('different evidence snapshot'));
    assert.equal(await page.$eval('#review-progress-text',el=>el.textContent),'2 / 203');
  });
  await check('Review import preserves conflicting requirements and notes and rejects invalid choices',async()=>{
    await (await page.$('#import-file')).uploadFile(output+'/conflict.json');
    await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('Kept 2 existing records'));
    assert.ok(await page.$('.group-requirement [data-requirement="merge"]'));
    assert.match(await page.$eval('[id="F19.S01"] .saved-note',el=>el.textContent),/Checked signing scope/);
    await (await page.$('#import-file')).uploadFile(output+'/invalid.json');
    await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('invalid requirement'));
    assert.ok(await page.$('[id="F19.S03"] [data-requirement="not-needed"]'));
  });
  await check('Exported requirements and notes round-trip into a fresh browser',async()=>{
    const context=await browser.createBrowserContext();
    const imported=await context.newPage();
    imported.on('pageerror',error=>errors.push(error.message));
    await imported.goto(base+'#feature/F19',{waitUntil:'networkidle0'});
    assert.ok(await imported.$('.group-requirement [data-requirement="merge"]'));
    await (await imported.$('#import-file')).uploadFile(output+'/roundtrip.json');
    await imported.waitForFunction(()=>document.querySelector('#toast').textContent==='Review imported.');
    assert.ok(await imported.$('[id="F19.S01"] [data-requirement="merge"] .requirement-origin'));
    assert.ok(await imported.$('[id="F19.S02"] [data-requirement="release"]'));
    assert.ok(await imported.$('[id="F19.S03"] [data-requirement="not-needed"]'));
    assert.match(await imported.$eval('[id="F19.S01"] .saved-note',el=>el.textContent),/Checked signing scope/);
    await context.close();
  });
  await check('Older review notes are preserved while full-parity items receive the merge default',async()=>{
    const context=await browser.createBrowserContext();
    const legacy=await context.newPage();
    legacy.on('pageerror',error=>errors.push(error.message));
    await legacy.goto(base+'#feature/F19',{waitUntil:'networkidle0'});
    await legacy.evaluate(()=>localStorage.setItem('bitcoin-gui-evidence-review-v1:'+window.REVIEW_EVIDENCE.catalogId,JSON.stringify({'F19.S01':{status:'reviewed',note:'Existing local note',updatedAt:'2026-10-08T12:00:00Z'}})));
    await legacy.reload({waitUntil:'networkidle0'});
    assert.match(await legacy.$eval('[id="F19.S01"] .saved-note',el=>el.textContent),/Existing local note/);
    assert.ok(await legacy.$('[id="F19.S01"] [data-requirement="merge"]'));
    assert.equal(await legacy.$eval('#review-progress-text',el=>el.textContent),'1 / 203');
    await legacy.click('[data-review="F19.S01"]');
    assert.equal(await legacy.$eval('#review-requirement',el=>el.value),'inherit');
    await context.close();
  });
  await check('Saved requirements including explicit Unassigned take precedence over automatic merge defaults',async()=>{
    const context=await browser.createBrowserContext();
    const saved=await context.newPage();
    saved.on('pageerror',error=>errors.push(error.message));
    await saved.goto(base+'#feature/F19',{waitUntil:'networkidle0'});
    await saved.evaluate(()=>{
      const record=requirement=>({status:'unreviewed',note:'Saved choice',requirement,updatedAt:'2026-10-09T12:00:00Z'});
      localStorage.setItem('bitcoin-gui-evidence-review-v2:'+window.REVIEW_EVIDENCE.catalogId,JSON.stringify({
        F19:record('release'), 'F19.S01':record('unassigned'), 'F19.S02':record('not-needed'), F02:record('unassigned')
      }));
    });
    await saved.reload({waitUntil:'networkidle0'});
    assert.ok(await saved.$('.group-requirement [data-requirement="release"]'));
    assert.ok(await saved.$('[id="F19.S01"] [data-requirement="unassigned"]'));
    assert.ok(await saved.$('[id="F19.S02"] [data-requirement="not-needed"]'));
    assert.ok(await saved.$('[id="F19.S03"] [data-requirement="release"]'));
    await saved.goto(base+'#feature/F02',{waitUntil:'networkidle0'});
    assert.ok(await saved.$('.group-requirement [data-requirement="unassigned"]'));
    assert.equal(await saved.$$eval('.criterion-card [data-requirement="merge"]',els=>els.length),0);
    assert.equal(await saved.$eval('#review-progress-text',el=>el.textContent),'0 / 203');
    await context.close();
  });
  await go('#catalog?review=reviewed&view=criteria');
  await check('Review status filters use the saved local decisions',async()=>{
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),1);
    assert.match(await page.$eval('.criterion-result',el=>el.textContent),/F19.S01/);
    await value('[data-filter="review"]','followup');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),1);
    assert.match(await page.$eval('.criterion-result',el=>el.textContent),/F01.S01/);
  });
  await go('#catalog?requirement=merge&q=F19');
  await check('Requirement filters follow group or subfeature scope and persist in links',async()=>{
    assert.deepEqual(await page.$$eval('.group-card .criterion-id',els=>els.map(el=>el.textContent)),['F19']);
    assert.ok(await page.$('.group-card [data-requirement="merge"]'));
    await page.click('[data-view="criteria"]');
    assert.deepEqual(await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent)),['F19.S01']);
    await value('[data-filter="requirement"]','release');
    assert.deepEqual(await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent)),['F19.S02']);
    await value('[data-filter="requirement"]','not-needed');
    assert.deepEqual(await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent)),['F19.S03']);
    await page.reload({waitUntil:'networkidle0'});
    assert.equal(await page.$eval('[data-filter="requirement"]',el=>el.value),'not-needed');
    await page.click('[data-view="groups"]');
    assert.equal(await page.$$eval('.group-card',els=>els.length),0);
    await value('[data-filter="requirement"]','unassigned');
    await page.$eval('#catalog-search',el=>{el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal(await page.$$eval('.group-card',els=>els.length),15);
    await page.click('[data-view="criteria"]');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),52);
  });
  await go('#catalog?requirement=merge&parity=parity&review=reviewed&view=criteria');
  await check('Requirement combines with parity and review filters and clearing filters restores everything',async()=>{
    assert.deepEqual(await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent)),['F19.S01']);
    assert.equal(await page.$$eval('.result-statuses',els=>els.every(el=>el.textContent.includes('Qt Widgets')&&el.textContent.includes('GUI-QML'))),true);
    await page.click('.criterion-result');
    await page.waitForSelector('[id="F19.S01"]');
    assert.equal(await page.$$eval('.criterion-card',els=>els.length),3); // Direct links retain access to the whole group.
    await go('#catalog?requirement=merge&q=F19');
    await page.click('.group-card');
    await page.waitForSelector('[id="F19.S03"]');
    assert.equal(await page.$$eval('.criterion-card',els=>els.length),3); // Group filter does not hide overrides.
    await page.click('[data-action="clear-filters"]');
    await go('#catalog');
    assert.equal(await page.$$eval('.group-card',els=>els.length),34);
    assert.equal(await page.$eval('[data-filter="requirement"]',el=>el.value),'any');
    await page.screenshot({path:output+'/requirement-catalog.png'});
  });
  await go('#tests?result=failed');
  await check('Resolved failure shows the rerun and retains historical proof',async()=>{
    assert.match(await page.$eval('.functional-table tbody',el=>el.textContent),/No unresolved failures/);
    assert.equal(await page.$('.finding-panel'),null);
    assert.ok(await page.$('a[href="gui-feature-evidence/logs/qml_test_send_create.log"]'));
    await go('#tests');
    assert.equal(await page.$$eval('.functional-table tbody tr',els=>els.length),34);
    assert.equal(await page.$$eval('.functional-table .failed-row',els=>els.length),0);
    const rerun = await page.$eval('.functional-table',el=>[...el.querySelectorAll('tr')].find(r=>r.textContent.includes('qml_test_send_create')).textContent);
    assert.match(rerun,/2026-10-10/);
    assert.match(rerun,/Corrected script/);
    await go('#feature/F09?item=F09.S03');await page.waitForSelector('[id="F09.S03"]');
    assert.match(await page.$eval('[id="F09.S03"]',el=>el.textContent),/Three complete runs passed/);
    assert.ok(await page.$('[id="F09.S03"] .application-evidence[aria-label^="GUI-QML"] .capture-preview'));
  });
  await check('Rerun report is readable on desktop and mobile with original capture links',async()=>{
    await page.screenshot({path:output+'/rerun-criterion.png',fullPage:true});
    await go('#tests');
    await page.screenshot({path:output+'/rerun-results.png'});
    await page.$eval('[data-rerun="20261010-send-create"]',el=>{el.open=true;el.scrollIntoView();});
    assert.ok(await page.$('.detailed-report[open] a[href="gui-feature-evidence/reruns/20261010-send-create/test-fix.patch"]'));
    await page.setViewport({width:390,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
    await page.screenshot({path:output+'/rerun-report-mobile.png'});
    await page.setViewport({width:1440,height:1000});
  });
  await go('#catalog?evidence=any');
  await go('#feature/F01');
  await check('All feature routes expose every original criterion',async()=>{
    const groups=await page.evaluate(()=>window.REVIEW_EVIDENCE.groups.map(g=>({id:g.id,count:g.criteria.length})));
    for(const group of groups){
      await page.evaluate(id=>{location.hash='feature/'+id;},group.id);
      await page.waitForFunction(id=>document.querySelector('.feature-heading .eyebrow')?.textContent.startsWith(id),{},group.id);
      assert.equal(await page.$$eval('.criterion-card',els=>els.length),group.count,group.id);
    }
  });
  await go('#feature/F19?tab=tests');
  await check('Feature test view contains source modules and recorded test logs',async()=>{
    assert.ok(await page.$('.module-list a[href*="signverifymessagedialog.cpp"]'));
    assert.ok(await page.$('.tests-table a[href$="qml_test_wallet_settings.log"]'));
  });
  await go('#feature/F19?tab=captures');
  await check('Capture gallery always includes both applications',async()=>{
    assert.equal(await page.$$eval('.gallery-card',els=>els.length),5);
    assert.equal(await page.$$eval('.gallery-card .app-dot.widgets',els=>els.length),3);
    assert.equal(await page.$$eval('.gallery-card .app-dot.qml',els=>els.length),2);
    assert.equal(await page.$('[data-filter="app"]'),null);
  });
  await check('Unconfirmed transaction evidence uses clear rerun captures for each outcome',async()=>{
    await go('#feature/F17');
    const captures = await page.evaluate(()=>window.REVIEW_EVIDENCE.groups.find(g=>g.id==='F17').criteria.slice(0,3).map(c=>c.applications.qml.captures));
    assert.deepEqual(captures.map(c=>c.length),[3,1,2]);
    assert.ok(captures.every(c=>c.every(p=>p.startsWith('reruns/20261010-wallet-rbf/'))));
    assert.ok(captures[0][0].endsWith('replacement-details-no-dialog.png'));
    assert.ok(captures[1][0].endsWith('fee-review-password-dismissed.png'));
    assert.equal(await page.$$eval('.criterion-card .capture-preview img',images=>images.some(i=>i.src.includes('006-click-updatetransactionbutton'))),false);
    await page.screenshot({path:output+'/unconfirmed-criteria.png'});
    await go('#feature/F17?tab=captures');
    assert.equal(await page.$$eval('.gallery-card .app-dot.qml',els=>els.length),3);
    assert.equal(await page.$$eval('.gallery-card .app-dot.widgets',els=>els.length),3);
    await page.screenshot({path:output+'/unconfirmed-gallery.png'});
  });
  await check('Additional Widgets evidence is criterion-specific and preserves QML assessments',async()=>{
    await go('#feature/F04');
    const proof = await page.evaluate(()=>{
      const d=window.REVIEW_EVIDENCE;
      const rows=d.groups.flatMap(g=>g.criteria);
      return {collection:d.collections[0],missing:rows.filter(c=>!c.applications.widgets.captures.length).map(c=>c.id),
        backup:rows.find(c=>c.id==='F04.S02'),device:rows.find(c=>c.id==='F15.S03'),total:d.captures.length};
    });
    assert.equal(proof.collection.selectedCaptures.length,61);
    assert.equal(proof.collection.newlyCapturedCriteria,58);
    assert.equal(proof.collection.assertions,44);
    assert.equal(proof.missing.length,11);
    assert.equal(proof.total,181);
    assert.equal(proof.backup.applications.widgets.status,'assertions');
    assert.equal(proof.backup.snapshotWidgetsEvidence.captures.length,0);
    assert.ok(proof.backup.applications.widgets.captures.every(p=>p.startsWith('collections/20261010-widgets/')));
    assert.equal(proof.backup.applications.qml.status,'source');
    assert.equal(proof.backup.implementation.status,'parity');
    assert.equal(proof.device.applications.widgets.captures.length,0);
    assert.equal(proof.device.implementation.status,'partial');
    assert.ok(await page.$('.criterion-card a[href="gui-feature-evidence/collections/20261010-widgets/report.md"]'));
    await page.screenshot({path:output+'/widgets-migration-criteria.png'});
    await go('#feature/F04?tab=tests');
    assert.ok(await page.$('.module-list a[href*="walletcontroller.cpp"]'));
    assert.ok(await page.$('.tests-table a[href$="collections/20261010-widgets/logs/checks.json"]'));
    await go('#tests');
    await page.click('[data-collection="20261010-widgets"] summary');
    const report=await page.$eval('[data-collection="20261010-widgets"]',el=>el.textContent);
    assert.ok(report.includes('Remaining screenshot gaps'));
    assert.ok(report.includes('F27.S04'));
    assert.ok(report.includes('Failed attempts and validation limits'));
  });
  await check('All 181 selected captures decode in the browser',async()=>{
    const bad=await page.evaluate(async()=>{
      const results=await Promise.all(window.REVIEW_EVIDENCE.captures.map(photo=>new Promise(resolve=>{
        const img=new Image();img.onload=()=>resolve(img.naturalWidth===photo.width&&img.naturalHeight===photo.height?null:photo.path);img.onerror=()=>resolve(photo.path);img.src='gui-feature-evidence/'+photo.path;
      })));return results.filter(Boolean);
    });
    assert.deepEqual(bad,[]);
  });
  await go('#catalog?evidence=any');
  await go('#feature/F19');
  await page.screenshot({path:output+'/feature-desktop.png',fullPage:false});
  await check('Browser-local file opening also supports the catalog',async()=>{
    const local=await browser.newPage();
    await local.goto('file:///site/dist/index.html#catalog',{waitUntil:'load'});
    assert.equal(await local.$$eval('.group-card',els=>els.length),34);
    await local.type('#catalog-search','F01.S01');
    assert.equal(await local.$$eval('.group-card',els=>els.length),1);
    await local.close();
    await page.bringToFront();
  });
  await page.setViewport({width:390,height:844,deviceScaleFactor:1});
  await check('Expanded Widgets capture report fits on mobile',async()=>{
    await go('#tests');
    await page.click('[data-collection="20261010-widgets"] summary');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.$eval('[data-collection="20261010-widgets"]',el=>el.scrollIntoView());
    await page.screenshot({path:output+'/widgets-report-mobile.png'});
  });
  await go('#catalog?evidence=any');
  await check('Mobile catalog fits without horizontal overflow',async()=>{
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.click('#open-navigation');
    await page.waitForFunction(()=>document.querySelector('#open-navigation').getAttribute('aria-expanded')==='true');
    assert.equal(await page.$eval('#open-navigation',el=>el.getAttribute('aria-expanded')),'true');
    await page.click('[data-group-link="F24"]');await page.waitForSelector('[id="F24.S01"]');
    assert.equal(await page.$eval('#open-navigation',el=>el.getAttribute('aria-expanded')),'false');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  });
  await page.screenshot({path:output+'/feature-mobile.png',fullPage:false});
  await go('#catalog?evidence=any');
  await check('Parity filtering is usable on mobile and keeps both references visible',async()=>{
    await value('[data-filter="parity"]','not-implemented');
    assert.equal(await page.$$eval('.group-card',els=>els.length),3);
    await page.click('[data-view="criteria"]');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),38);
    assert.equal(await page.$$eval('.result-statuses',els=>els.every(el=>el.textContent.includes('Qt Widgets')&&el.textContent.includes('GUI-QML'))),true);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.click('[data-action="clear-filters"]');
  });
  await page.screenshot({path:output+'/catalog-mobile.png',fullPage:false});
  await check('Requirements can be filtered and edited on mobile in both themes without losing review notes',async()=>{
    await value('[data-filter="requirement"]','merge');
    await page.type('#catalog-search','F19');
    assert.equal(await page.$$eval('.group-card',els=>els.length),1);
    await page.click('[data-view="criteria"]');
    assert.deepEqual(await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent)),['F19.S01']);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.click('.criterion-result');
    await page.waitForSelector('[id="F19.S01"]');
    await page.click('[data-review="F19.S01"]');
    assert.equal(await page.$eval('#review-state',el=>el.value),'reviewed');
    assert.match(await page.$eval('#review-note',el=>el.value),/Checked signing scope/);
    assert.equal(await page.$eval('#review-dialog',el=>el.scrollWidth<=el.clientWidth),true);
    await page.screenshot({path:output+'/requirement-mobile-dark.png'});
    await page.select('#review-requirement','release');
    await page.click('#review-form button[type="submit"]');
    assert.ok(await page.$('[id="F19.S01"] [data-requirement="release"]'));
    assert.match(await page.$eval('[id="F19.S01"] .saved-note',el=>el.textContent),/Checked signing scope/);
    await page.click('#theme-toggle');
    await page.click('[data-review="F19.S01"]');
    await page.screenshot({path:output+'/requirement-mobile-light.png'});
    assert.equal(await page.$eval('#review-dialog',el=>el.scrollWidth<=el.clientWidth),true);
    await page.select('#review-requirement','inherit');
    await page.click('#review-form button[type="submit"]');
    await page.click('#theme-toggle');
    await go('#catalog');
    await page.click('[data-action="clear-filters"]');
  });
  await check('Mobile tests and provenance remain navigable',async()=>{
    await go('#tests');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await go('#about');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.screenshot({path:output+'/acceptance-guide-mobile.png'});
    assert.ok(await page.$('a[href="gui-feature-evidence/selected-captures.json"]'));
  });
  await check('Keyboard search shortcut focuses the catalog search',async()=>{
    await page.keyboard.press('/');await page.waitForSelector('#catalog-search');
    await page.waitForFunction(()=>document.activeElement?.id==='catalog-search');
  });
  const actionsContext=await browser.createBrowserContext();
  const actionsPage=await actionsContext.newPage();
  currentPage=actionsPage;
  actionsPage.on('pageerror',error=>errors.push(error.message));
  actionsPage.on('response',response=>{if(response.status()>=400)failedRequests.push({url:response.url(),status:response.status()});});
  const quick='[data-quick-review="F19.S01"]';
  const scope='[data-set-requirement="F19.S01"]';
  const details='[data-review="F19.S01"]';
  const reviewNote='Keep the signing evidence note when reviewing quickly.';
  const savedAction=()=>actionsPage.evaluate(()=>JSON.parse(localStorage.getItem('bitcoin-gui-evidence-review-v2:'+window.REVIEW_EVIDENCE.catalogId))['F19.S01']);
  const settleActions=()=>actionsPage.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await check('Quick review toggles immediately and preserves notes, scope, focus and scroll',async()=>{
    await actionsPage.goto(base+'#feature/F19?item=F19.S01',{waitUntil:'networkidle0'});
    await actionsPage.click(details);
    await actionsPage.select('#review-state','followup');
    await actionsPage.select('#review-requirement','release');
    await actionsPage.type('#review-note',reviewNote);
    await actionsPage.click('#review-form button[type="submit"]');
    await settleActions();
    await actionsPage.$eval(quick,el=>el.scrollIntoView({block:'center'}));
    const before=await actionsPage.evaluate(()=>scrollY);
    await actionsPage.click(quick);
    await settleActions();
    assert.equal(await actionsPage.$eval('#review-dialog',el=>el.open),false);
    assert.equal(await actionsPage.$eval(quick,el=>el.getAttribute('aria-pressed')),'true');
    assert.equal(await actionsPage.evaluate(()=>document.activeElement.dataset.quickReview),'F19.S01');
    assert.ok(Math.abs(await actionsPage.evaluate(()=>scrollY)-before)<2);
    assert.equal(await actionsPage.$eval('#review-progress-text',el=>el.textContent),'1 / 203');
    let record=await savedAction();
    assert.equal(record.status,'reviewed');assert.equal(record.note,reviewNote);assert.equal(record.requirement,'release');
    assert.ok(Number.isFinite(Date.parse(record.updatedAt)));
    await actionsPage.screenshot({path:output+'/card-actions-desktop-dark.png'});
    await actionsPage.reload({waitUntil:'networkidle0'});
    assert.equal(await actionsPage.$eval(quick,el=>el.getAttribute('aria-pressed')),'true');
    await actionsPage.focus(quick);
    await actionsPage.keyboard.press('Space');
    assert.equal(await actionsPage.$eval(quick,el=>el.getAttribute('aria-pressed')),'false');
    assert.equal(await actionsPage.$eval('#review-progress-text',el=>el.textContent),'0 / 203');
    record=await savedAction();
    assert.equal(record.status,'unreviewed');assert.equal(record.note,reviewNote);assert.equal(record.requirement,'release');
  });
  await check('Scope labels open a direct selector with persistent overrides, inheritance and filtering',async()=>{
    assert.deepEqual(await actionsPage.$$eval(scope+' option',els=>els.map(el=>el.textContent)),['Use default (Needed for merge)','Needed for merge','Needed for release','Not needed','Unassigned']);
    await actionsPage.click('[id="F19.S01"] .requirement-picker');
    await actionsPage.keyboard.press('End');
    await actionsPage.keyboard.press('Enter');
    await settleActions();
    assert.equal(await actionsPage.$eval(scope,el=>el.value),'unassigned');
    assert.equal(await actionsPage.$eval('#review-dialog',el=>el.open),false);
    assert.equal(await actionsPage.evaluate(()=>document.activeElement.dataset.setRequirement),'F19.S01');
    assert.ok(await actionsPage.$('[id="F19.S01"] [data-requirement="unassigned"]'));
    let record=await savedAction();
    assert.equal(record.status,'unreviewed');assert.equal(record.note,reviewNote);assert.equal(record.requirement,'unassigned');
    await actionsPage.click('[data-review="F19"]');
    await actionsPage.select('#review-requirement','not-needed');
    await actionsPage.click('#review-form button[type="submit"]');
    await actionsPage.select(scope,'inherit');
    assert.ok(await actionsPage.$('[id="F19.S01"] [data-requirement="not-needed"]'));
    assert.equal((await savedAction()).requirement,'inherit');
    for(const requirement of ['merge','not-needed','release']){
      await actionsPage.select(scope,requirement);
      assert.ok(await actionsPage.$(`[id="F19.S01"] [data-requirement="${requirement}"]`));
    }
    await actionsPage.click(quick);
    await actionsPage.reload({waitUntil:'networkidle0'});
    record=await savedAction();
    assert.equal(record.status,'reviewed');assert.equal(record.note,reviewNote);assert.equal(record.requirement,'release');
    await actionsPage.goto(base+'#catalog?view=criteria&requirement=release&review=reviewed&q=F19.S01',{waitUntil:'networkidle0'});
    assert.deepEqual(await actionsPage.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent)),['F19.S01']);
    await actionsPage.goto(base+'#feature/F19?item=F19.S01',{waitUntil:'networkidle0'});
  });
  await check('Three card actions fit mobile in both themes and retain keyboard access to the full dialog',async()=>{
    for(const width of [390,320]){
      await actionsPage.setViewport({width,height:844,deviceScaleFactor:1});
      for(const theme of ['dark','light']){
        await actionsPage.evaluate(theme=>window.EvidenceTheme.set(theme),theme);
        await actionsPage.$eval(quick,el=>el.scrollIntoView({block:'center'}));
        const boxes=await actionsPage.$$eval('[id="F19.S01"] .criterion-review-actions > *',els=>els.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,height:r.height};}));
        assert.equal(boxes.length,3);
        assert.ok(boxes.every(r=>r.x>=0&&r.right<=width&&r.height>=30));
        assert.ok(boxes[0].right<=boxes[1].x&&boxes[1].right<=boxes[2].x);
        assert.ok(boxes.every(r=>Math.abs(r.y-boxes[0].y)<2));
        assert.equal(await actionsPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        await actionsPage.focus(quick);
        await actionsPage.keyboard.press('Tab');
        assert.equal(await actionsPage.evaluate(()=>document.activeElement.dataset.setRequirement),'F19.S01');
        await actionsPage.keyboard.press('Tab');
        assert.equal(await actionsPage.evaluate(()=>document.activeElement.dataset.review),'F19.S01');
        await actionsPage.screenshot({path:output+`/card-actions-mobile-${width}-${theme}.png`});
        await actionsPage.keyboard.press('Enter');
        assert.equal(await actionsPage.$eval('#review-dialog',el=>el.open),true);
        assert.equal(await actionsPage.$eval('#review-state',el=>el.value),'reviewed');
        assert.equal(await actionsPage.$eval('#review-note',el=>el.value),reviewNote);
        assert.equal(await actionsPage.$eval('#review-requirement',el=>el.value),'release');
        await actionsPage.keyboard.press('Escape');
      }
    }
  });
  await actionsContext.close();
  currentPage=page;
  await check('No JavaScript errors or missing local assets',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);});
}
main().catch(async error=>{outcomes.push({name:'Browser verification',status:'failed',error:error.stack});console.error(error);process.exitCode=1;if(currentPage)await currentPage.screenshot({path:output+'/failure.png'});}).finally(async()=>{
  await fs.writeFile(output+'/browser-results.json',JSON.stringify({checkedAt:new Date().toISOString(),basePath,outcomes,errors,failedRequests},null,2)+'\n');
  if(browser)await browser.close();if(server)server.close();
});
