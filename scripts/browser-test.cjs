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
    assert.match(await page.$eval('#results-count',el=>el.textContent),/182 of 182/);
    assert.equal(await page.$$eval('[data-group-link]',els=>els.length),34);
  });
  await page.screenshot({path:output+'/catalog-desktop.png',fullPage:false});
  await check('Acceptance summary shows total subfeatures, implementation gaps and accepted items',async()=>{
    assert.deepEqual(await page.$$eval('.stats-grid .stat strong',els=>els.map(el=>el.textContent)),['182','49','133']);
    assert.equal(await page.$eval('.nav-count',el=>el.textContent),'49');
    assert.equal(await page.$eval('#review-progress-text',el=>el.textContent),'133 / 182');
    await page.click('[data-stat="implementation"]');
    await page.waitForFunction(()=>document.querySelectorAll('.criterion-result').length===49);
    const gaps=await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent));
    assert.ok(gaps.includes('F07.S01'));assert.ok(gaps.includes('F15.S03'));assert.ok(gaps.includes('F03.S04'));assert.ok(!gaps.includes('F04.S02'));
    await page.reload({waitUntil:'networkidle0'});
    assert.equal(await page.$eval('[data-filter="parity"]',el=>el.value),'incomplete');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),49);
    await page.click('[data-stat="accepted"]');
    await page.waitForFunction(()=>document.querySelectorAll('.criterion-result').length===133);
    const accepted=await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent));
    assert.ok(accepted.includes('F09.S03'));assert.ok(accepted.includes('F19.S01'));
    assert.equal(new Set([...gaps,...accepted]).size,182);
    assert.equal(await page.$$eval('[data-acceptance="accepted"]',els=>els.length),133);
    await value('[data-filter="review"]','pending');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),49);
    await page.click('[data-action="clear-filters"]');
  });
  await check('Watch-only export is counted once, combines proof, and redirects old links and searches',async()=>{
    const context=await browser.createBrowserContext();const merged=await context.newPage();
    merged.on('pageerror',error=>errors.push(error.message));
    await merged.goto(base+'#feature/F05?item=F05.S02',{waitUntil:'networkidle0'});
    assert.equal(await merged.evaluate(()=>location.hash),'#feature/F05?item=F05.S01');
    assert.equal(await merged.$$eval('.criterion-card',els=>els.length),2);
    assert.equal(await merged.$('[id="F05.S02"]'),null);
    assert.match(await merged.$eval('[id="F05.S01"] h2',el=>el.textContent),/Export a watch-only copy/);
    assert.match(await merged.$eval('[id="F05.S01"] .application-evidence',el=>el.textContent),/private keys disabled/);
    assert.match(await merged.$eval('[id="F05.S01"] .application-evidence',el=>el.textContent),/nonempty watch-only backup/);
    assert.equal(await merged.evaluate(()=>window.REVIEW_EVIDENCE.criterionAliases['F05.S02']),'F05.S01');
    assert.equal(await merged.$eval('[id="F05.S01"] [data-acceptance]',el=>el.dataset.acceptance),'unreviewed');
    await merged.screenshot({path:output+'/merged-watch-only.png'});
    await merged.goto(base+'#catalog?q=F05.S02&view=criteria',{waitUntil:'networkidle0'});
    assert.deepEqual(await merged.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent)),['F05.S01']);
    const inventory=await merged.evaluate(async()=>({
      current:await (await fetch('current-catalog.md')).text(),
      original:await (await fetch('gui-feature-evidence/inventory.json')).json()
    }));
    assert.match(inventory.current,/182 current subfeatures/);
    assert.ok(!inventory.current.includes('| F05.S02 |'));
    assert.equal(inventory.original.flatMap(g=>g.subfeatures).length,203);
    await context.close();
  });
  await check('Merged criteria preserve old reviews, conflicts, resolution and export/import history',async()=>{
    const context=await browser.createBrowserContext();const merged=await context.newPage();
    merged.on('pageerror',error=>errors.push(error.message));
    await merged.goto(base+'#feature/F05?item=F05.S01',{waitUntil:'networkidle0'});
    const old={status:'reviewed',requirement:'release',note:'Export proof <keep this literal>.',updatedAt:'2026-10-09T12:00:00Z'};
    await merged.evaluate(old=>localStorage.setItem('bitcoin-gui-evidence-review-v3:'+window.REVIEW_EVIDENCE.catalogId,JSON.stringify({'F05.S02':old})),old);
    await merged.reload({waitUntil:'networkidle0'});
    assert.equal(await merged.$eval('[id="F05.S01"] [data-acceptance]',el=>el.dataset.acceptance),'reviewed');
    assert.equal(await merged.$eval('[data-set-requirement="F05.S01"]',el=>el.value),'release');
    await merged.click('[data-review="F05.S01"]');
    assert.equal(await merged.$eval('#review-note',el=>el.value),old.note);
    assert.match(await merged.$eval('#merged-review-history',el=>el.textContent),/Export proof <keep this literal>/);
    await merged.click('#review-form [data-close-dialog]');
    await merged.click('[data-quick-review="F05.S01"]');
    await merged.reload({waitUntil:'networkidle0'});
    const records=()=>merged.evaluate(()=>JSON.parse(localStorage.getItem('bitcoin-gui-evidence-review-v4:'+window.REVIEW_EVIDENCE.catalogId+':'+window.REVIEW_EVIDENCE.catalogRevision)));
    assert.deepEqual((await records()).priorReviews['F05.S02'],old);
    assert.equal((await records()).reviews['F05.S01'].status,'accepted');
    assert.equal((await records()).schemaVersion,4);
    await fs.rm(output+'/merge-downloads',{recursive:true,force:true});
    await fs.mkdir(output+'/merge-downloads',{recursive:true});
    const session=await merged.createCDPSession();
    await session.send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:output+'/merge-downloads'});
    await merged.click('#export-review');
    let filename;
    for(let i=0;i<50;i++) { filename=(await fs.readdir(output+'/merge-downloads')).find(name=>name.endsWith('.json')); if(filename)break; await new Promise(resolve=>setTimeout(resolve,100)); }
    assert.ok(filename);
    const payload=JSON.parse(await fs.readFile(output+'/merge-downloads/'+filename,'utf8'));
    assert.deepEqual(payload.priorReviews['F05.S02'],old);
    assert.equal(payload.reviews['F05.S01'].status,'accepted');
    await merged.evaluate(()=>localStorage.clear());
    await merged.reload({waitUntil:'networkidle0'});
    await (await merged.$('#import-file')).uploadFile(output+'/merge-downloads/'+filename);
    await merged.waitForFunction(()=>document.querySelector('[data-quick-review="F05.S01"]').getAttribute('aria-pressed')==='true');
    assert.deepEqual((await records()).priorReviews['F05.S02'],old);
    // Conflicting old decisions must not silently accept or assign the combined item.
    await merged.evaluate(()=>{localStorage.clear();localStorage.setItem('bitcoin-gui-evidence-review-v3:'+window.REVIEW_EVIDENCE.catalogId,JSON.stringify({
      'F05.S01':{status:'accepted',requirement:'merge',note:'Copy has no keys.',updatedAt:null},
      'F05.S02':{status:'followup',requirement:'release',note:'Check the file.',updatedAt:null}
    }));});
    await merged.reload({waitUntil:'networkidle0'});
    assert.equal(await merged.$eval('[id="F05.S01"] [data-acceptance]',el=>el.dataset.acceptance),'followup');
    assert.equal(await merged.$eval('[data-set-requirement="F05.S01"]',el=>el.value),'unassigned');
    await merged.click('[data-review="F05.S01"]');
    assert.equal(await merged.$eval('#review-note',el=>el.value),'Copy has no keys.');
    assert.match(await merged.$eval('#merged-review-history',el=>el.textContent),/Check the file/);
    assert.match(await merged.$eval('#merged-review-history',el=>el.textContent),/F05.S01 · Accepted · Needed for merge/);
    assert.match(await merged.$eval('#merged-review-history',el=>el.textContent),/F05.S02 · Needs follow-up · Needed for release/);
    assert.equal(await merged.$eval('#merged-review-history',el=>el.open),true);
    await merged.screenshot({path:output+'/merged-review-conflict.png'});
    await merged.select('#review-state','accepted');
    await merged.select('#review-requirement','merge');
    await merged.click('#review-form button[type="submit"]');
    await merged.reload({waitUntil:'networkidle0'});
    assert.equal(await merged.$eval('[id="F05.S01"] [data-acceptance]',el=>el.dataset.acceptance),'accepted');
    assert.equal(await merged.$eval('[data-set-requirement="F05.S01"]',el=>el.value),'merge');
    assert.equal((await records()).priorReviews['F05.S02'].note,'Check the file.');
    assert.ok(!await merged.$eval('[id="F05.S01"]',el=>el.textContent.includes('Earlier review decisions differ')));
    // Maximum-length notes remain valid; source notes are never concatenated or truncated.
    await merged.evaluate(()=>{localStorage.clear();localStorage.setItem('bitcoin-gui-evidence-review-v3:'+window.REVIEW_EVIDENCE.catalogId,JSON.stringify({
      'F05.S01':{status:'reviewed',requirement:'inherit',note:'a'.repeat(10000)},
      'F05.S02':{status:'reviewed',requirement:'inherit',note:'b'.repeat(10000)}
    }));});
    await merged.reload({waitUntil:'networkidle0'});
    await merged.click('[data-quick-review="F05.S01"]');
    await merged.reload({waitUntil:'networkidle0'});
    assert.equal((await records()).reviews['F05.S01'].note.length,10000);
    assert.equal((await records()).priorReviews['F05.S02'].note.length,10000);
    await context.close();
  });
  await check('Duplicate audit covers every original criterion and remains readable on mobile',async()=>{
    const context=await browser.createBrowserContext();const audit=await context.newPage();
    audit.on('pageerror',error=>errors.push(error.message));
    await audit.goto(base+'#audit',{waitUntil:'networkidle0'});
    const report=await audit.evaluate(()=>window.REVIEW_EVIDENCE.catalogAudit);
    assert.equal(report.reviewedCount,203);assert.equal(report.currentCount,182);
    assert.equal(report.groups.length,34);
    assert.equal(new Set(report.groups.flatMap(g=>g.reviewedCriteria)).size,203);
    assert.equal(report.findings.filter(f=>f.kind==='duplicate').length,9);
    assert.equal(report.findings.filter(f=>f.kind==='overlap').length,12);
    assert.equal(report.findings.filter(f=>f.kind==='distinct').length,8);
    assert.match(await audit.$eval('.audit-report',el=>el.textContent),/All findings applied/);
    assert.ok(await audit.$('.audit-report a[href="#feature/F31?item=F31.S05"]'));
    await audit.screenshot({path:output+'/duplicate-audit-desktop.png'});
    await audit.setViewport({width:390,height:844});
    assert.equal(await audit.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await audit.screenshot({path:output+'/duplicate-audit-mobile.png'});
    await context.close();
  });
  await check('All retired links reach their replacement outcomes without adding counted rows',async()=>{
    const context=await browser.createBrowserContext();const audit=await context.newPage();currentPage=audit;
    audit.on('pageerror',error=>errors.push(error.message));
    await audit.goto(base+'#catalog',{waitUntil:'networkidle0'});
    const mapping=await audit.evaluate(()=>window.REVIEW_EVIDENCE.criterionReplacements);
    assert.equal(Object.keys(mapping).length,21);
    for(const [id,targets] of Object.entries(mapping)){
      await audit.evaluate(id=>{location.hash=`feature/${id.split('.')[0]}?item=${id}`;},id);
      const expected=targets.length===1?`#feature/${targets[0].split('.')[0]}?item=${targets[0]}`:`#feature/${id.split('.')[0]}?item=${id}`;
      await audit.waitForFunction(expected=>location.hash===expected&&document.querySelector('#main').dataset.route===expected,{},expected);
      assert.equal(await audit.$(`[id="${id}"]`),null,id);
      if(targets.length===1)assert.ok(await audit.$(`[id="${targets[0]}"]`),id);
      else {
        assert.deepEqual(await audit.$$eval('.replacement-links a',els=>els.map(el=>el.textContent.split(' · ')[0])),targets);
        assert.equal(await audit.$$eval('.criterion-card',els=>els.length),0);
      }
    }
    await audit.goto(base+'#feature/F23?item=F23.S09',{waitUntil:'networkidle0'});
    await audit.setViewport({width:390,height:844});
    assert.equal(await audit.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await audit.screenshot({path:output+'/retired-scope-mobile.png'});
    await audit.goto(base+'#feature/F28',{waitUntil:'networkidle0'});
    assert.ok(await audit.$('.related-criteria a[href="#feature/F02?item=F02.S03"]'));
    assert.equal(await audit.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await audit.screenshot({path:output+'/related-outcomes-mobile.png'});
    await audit.goto(base+'#catalog?q=F23.S09&view=criteria',{waitUntil:'networkidle0'});
    assert.deepEqual((await audit.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent))).sort(),mapping['F23.S09'].sort());
    await context.close();currentPage=page;
  });
  await check('Moved outcomes preserve inherited scope and expose conflicting source-group decisions',async()=>{
    const context=await browser.createBrowserContext();const moved=await context.newPage();currentPage=moved;
    moved.on('pageerror',error=>errors.push(error.message));
    await moved.goto(base+'#feature/F02?item=F02.S03',{waitUntil:'networkidle0'});
    const group=requirement=>({status:'unreviewed',requirement,note:'Original group decision',updatedAt:null});
    async function seed(records){await moved.evaluate(records=>{localStorage.clear();localStorage.setItem('bitcoin-gui-evidence-review-v3:'+window.REVIEW_EVIDENCE.catalogId,JSON.stringify(records));},records);await moved.reload({waitUntil:'networkidle0'});}
    await seed({F28:group('release')});
    assert.equal(await moved.$eval('[data-set-requirement="F02.S03"]',el=>el.value),'release');
    assert.equal(await moved.$eval('[id="F02.S03"] [data-acceptance]',el=>el.dataset.acceptance),'accepted');
    await moved.click('[data-review="F02.S03"]');
    assert.match(await moved.$eval('#merged-review-history',el=>el.textContent),/F28.S02 · Evidence default · Needed for release/);
    await moved.keyboard.press('Escape');
    await seed({F28:group('release'),F02:group('merge')});
    assert.equal(await moved.$eval('[data-set-requirement="F02.S03"]',el=>el.value),'unassigned');
    assert.equal(await moved.$eval('[id="F02.S03"] [data-acceptance]',el=>el.dataset.acceptance),'followup');
    await moved.click('[data-review="F02.S03"]');
    assert.equal(await moved.$eval('#merged-review-history',el=>el.open),true);
    await moved.setViewport({width:390,height:844});
    assert.equal(await moved.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await moved.screenshot({path:output+'/moved-review-history-mobile.png'});
    await moved.select('#review-state','accepted');await moved.select('#review-requirement','release');
    await moved.click('#review-form button[type="submit"]');
    await moved.reload({waitUntil:'networkidle0'});
    assert.equal(await moved.$eval('[id="F02.S03"] [data-acceptance]',el=>el.dataset.acceptance),'accepted');
    const saved=await moved.evaluate(()=>JSON.parse(localStorage.getItem('bitcoin-gui-evidence-review-v4:'+window.REVIEW_EVIDENCE.catalogId+':'+window.REVIEW_EVIDENCE.catalogRevision)));
    assert.equal(saved.priorReviews.F28.requirement,'release');assert.equal(saved.priorReviews.F02.requirement,'merge');
    await context.close();currentPage=page;
  });
  await check('Broad and narrowed approvals require reassessment, while resolved duplicate approvals survive',async()=>{
    const context=await browser.createBrowserContext();const changed=await context.newPage();currentPage=changed;
    changed.on('pageerror',error=>errors.push(error.message));
    await changed.goto(base+'#catalog',{waitUntil:'networkidle0'});
    const old={status:'accepted',requirement:'release',note:'Earlier broad approval <literal>',updatedAt:null};
    await changed.evaluate(old=>localStorage.setItem('bitcoin-gui-evidence-review-v3:'+window.REVIEW_EVIDENCE.catalogId,JSON.stringify({'F23.S09':old,'F09.S07':old})),old);
    await changed.reload({waitUntil:'networkidle0'});
    for(const id of ['F27.S01','F27.S02','F26.S03','F24.S05','F09.S07']){
      await changed.goto(base+`#feature/${id.split('.')[0]}?item=${id}`,{waitUntil:'networkidle0'});
      assert.equal(await changed.$eval(`[id="${id}"] [data-acceptance]`,el=>el.dataset.acceptance),'followup',id);
      assert.equal(await changed.$eval(`[data-set-requirement="${id}"]`,el=>el.value),'release',id);
      await changed.click(`[data-review="${id}"]`);
      assert.match(await changed.$eval('#merged-review-history',el=>el.textContent),/Earlier broad approval <literal>/);
      await changed.keyboard.press('Escape');
    }
    await changed.evaluate(()=>{
      localStorage.clear();localStorage.setItem('bitcoin-gui-evidence-review-v3:'+window.REVIEW_EVIDENCE.catalogId,JSON.stringify({
        'F05.S01':{status:'accepted',requirement:'merge',note:'Resolved export decision',mergedIds:['F05.S02']},
        'F05.S02':{status:'followup',requirement:'release',note:'Earlier file question'}
      }));
    });
    await changed.reload({waitUntil:'networkidle0'});
    await changed.goto(base+'#feature/F05?item=F05.S01',{waitUntil:'networkidle0'});
    assert.equal(await changed.$eval('[id="F05.S01"] [data-acceptance]',el=>el.dataset.acceptance),'accepted');
    await changed.evaluate(()=>{
      const key='bitcoin-gui-evidence-review-v3:'+window.REVIEW_EVIDENCE.catalogId;
      const saved=JSON.parse(localStorage.getItem(key));saved['F05.S04']={status:'followup',requirement:'merge',note:'Newly combined key-separation concern'};
      localStorage.setItem(key,JSON.stringify(saved));
    });
    await changed.reload({waitUntil:'networkidle0'});
    assert.equal(await changed.$eval('[id="F05.S01"] [data-acceptance]',el=>el.dataset.acceptance),'followup');
    await changed.click('[data-review="F05.S01"]');
    assert.match(await changed.$eval('#merged-review-history',el=>el.textContent),/Earlier file question/);
    assert.match(await changed.$eval('#merged-review-history',el=>el.textContent),/key-separation concern/);
    await context.close();currentPage=page;
  });
  await check('Current review storage ignores older tabs, synchronizes new tabs and rejects invalid imports atomically',async()=>{
    const context=await browser.createBrowserContext();const current=await context.newPage();currentPage=current;
    current.on('pageerror',error=>errors.push(error.message));
    await current.goto(base+'#feature/F19?item=F19.S01',{waitUntil:'networkidle0'});
    await current.select('[data-set-requirement="F19.S01"]','release');
    const peer=await context.newPage();await peer.goto(base+'#feature/F19?item=F19.S01',{waitUntil:'networkidle0'});
    await peer.evaluate(()=>localStorage.setItem('bitcoin-gui-evidence-review-v3:'+window.REVIEW_EVIDENCE.catalogId,JSON.stringify({'F19.S01':{status:'followup',requirement:'not-needed',note:'Old tab'}})));
    await current.reload({waitUntil:'networkidle0'});
    assert.equal(await current.$eval('[data-set-requirement="F19.S01"]',el=>el.value),'release');
    assert.equal(await current.$eval('[id="F19.S01"] [data-acceptance]',el=>el.dataset.acceptance),'accepted');
    await peer.select('[data-set-requirement="F19.S01"]','merge');
    await current.waitForFunction(()=>document.querySelector('[data-set-requirement="F19.S01"]').value==='merge');
    const before=await current.evaluate(()=>localStorage.getItem('bitcoin-gui-evidence-review-v4:'+window.REVIEW_EVIDENCE.catalogId+':'+window.REVIEW_EVIDENCE.catalogRevision));
    const envelope=JSON.parse(before);const catalogId=await current.evaluate(()=>window.REVIEW_EVIDENCE.catalogId);
    const validRecord={status:'followup',requirement:'not-needed',note:'Must not apply',updatedAt:null};
    await fs.writeFile(output+'/invalid-history.json',JSON.stringify({...envelope,catalogId,reviews:{'F19.S02':validRecord},priorReviews:{'F99.S99':validRecord}}));
    await (await current.$('#import-file')).uploadFile(output+'/invalid-history.json');
    await current.waitForFunction(()=>document.querySelector('#toast').textContent.includes('invalid review record'));
    assert.equal(await current.evaluate(()=>localStorage.getItem('bitcoin-gui-evidence-review-v4:'+window.REVIEW_EVIDENCE.catalogId+':'+window.REVIEW_EVIDENCE.catalogRevision)),before);
    await fs.writeFile(output+'/wrong-revision.json',JSON.stringify({...envelope,catalogId,catalogRevision:'different-catalog-scope'}));
    await (await current.$('#import-file')).uploadFile(output+'/wrong-revision.json');
    await current.waitForFunction(()=>document.querySelector('#toast').textContent.includes('different catalog revision'));
    assert.equal(await current.evaluate(()=>localStorage.getItem('bitcoin-gui-evidence-review-v4:'+window.REVIEW_EVIDENCE.catalogId+':'+window.REVIEW_EVIDENCE.catalogRevision)),before);
    await context.close();currentPage=page;
  });
  await check('Removed navigation criterion preserves old notes without changing individual task reviews',async()=>{
    const context=await browser.createBrowserContext();const removed=await context.newPage();currentPage=removed;
    removed.on('pageerror',error=>errors.push(error.message));
    await removed.goto(base+'#catalog',{waitUntil:'networkidle0'});
    const envelope=await removed.evaluate(()=>{
      const record=(status,note)=>({status,requirement:'release',note,updatedAt:'2026-10-11T15:00:00Z'});
      const payload={schemaVersion:4,catalogId:window.REVIEW_EVIDENCE.catalogId,catalogRevision:'2026-10-11-all-findings',
        reviews:{'F28.S03':record('accepted','Saved navigation note <keep>'),'F19.S01':record('followup','Keep this task decision')},
        priorReviews:{'F28.S03':record('reviewed','Original navigation note')}};
      localStorage.clear();localStorage.setItem('bitcoin-gui-evidence-review-v4:'+payload.catalogId,JSON.stringify(payload));
      return payload;
    });
    await removed.reload({waitUntil:'networkidle0'});
    const read=()=>removed.evaluate(()=>JSON.parse(localStorage.getItem('bitcoin-gui-evidence-review-v4:'+window.REVIEW_EVIDENCE.catalogId+':'+window.REVIEW_EVIDENCE.catalogRevision)));
    let saved=await read();
    assert.equal(saved.reviews['F28.S03'],undefined);
    assert.deepEqual(saved.retiredReviews['F28.S03'],envelope.reviews['F28.S03']);
    assert.deepEqual(saved.priorReviews,envelope.priorReviews);
    assert.deepEqual(saved.reviews['F19.S01'],envelope.reviews['F19.S01']);
    assert.equal(await removed.$eval('#review-progress-text',el=>el.textContent),'132 / 182');
    // An older open tab still writes the old key and cannot overwrite migrated decisions.
    const peer=await context.newPage();await peer.goto(base+'#catalog',{waitUntil:'networkidle0'});
    await peer.evaluate(payload=>localStorage.setItem('bitcoin-gui-evidence-review-v4:'+payload.catalogId,JSON.stringify({...payload,reviews:{}})),envelope);
    await removed.reload({waitUntil:'networkidle0'});
    assert.deepEqual((await read()).reviews,saved.reviews);
    await removed.goto(base+'#feature/F28?item=F28.S03',{waitUntil:'networkidle0'});
    assert.match(await removed.$eval('.removed-criterion',el=>el.textContent),/REMOVED CRITERION/);
    assert.match(await removed.$eval('#main',el=>el.textContent),/Saved navigation note <keep>/);
    assert.match(await removed.$eval('#main',el=>el.textContent),/Original navigation note/);
    assert.equal(await removed.$('[data-review="F28.S03"]'),null);
    assert.equal(await removed.$('[data-quick-review="F28.S03"]'),null);
    await removed.screenshot({path:output+'/removed-navigation-desktop.png'});
    await removed.goto(base+'#feature/F28',{waitUntil:'networkidle0'});
    assert.deepEqual(await removed.$$eval('.criterion-card',els=>els.map(el=>el.id)),['F28.S01','F28.S05']);
    await removed.goto(base+'#catalog?parity=parity&evidence=partial&view=criteria',{waitUntil:'networkidle0'});
    assert.equal(await removed.$$eval('.criterion-result',els=>els.length),0);
    await removed.goto(base+'#catalog?q=F28.S03&view=criteria',{waitUntil:'networkidle0'});
    assert.equal(await removed.$$eval('.criterion-result',els=>els.length),0);
    await fs.writeFile(output+'/pre-removal-review.json',JSON.stringify(envelope));
    const importedContext=await browser.createBrowserContext();const imported=await importedContext.newPage();
    imported.on('pageerror',error=>errors.push(error.message));
    await imported.goto(base+'#feature/F28?item=F28.S03',{waitUntil:'networkidle0'});
    await (await imported.$('#import-file')).uploadFile(output+'/pre-removal-review.json');
    await imported.waitForFunction(()=>document.querySelector('#toast').textContent==='Review imported.');
    assert.match(await imported.$eval('#main',el=>el.textContent),/Saved navigation note <keep>/);
    const download=output+'/removed-downloads';await fs.rm(download,{recursive:true,force:true});await fs.mkdir(download,{recursive:true});
    const session=await imported.createCDPSession();await session.send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:download});
    await imported.click('#export-review');
    let files=[];for(let i=0;i<50&&!files.length;i++){files=(await fs.readdir(download)).filter(f=>f.endsWith('.json'));if(!files.length)await new Promise(resolve=>setTimeout(resolve,100));}
    assert.equal(files.length,1);const exported=JSON.parse(await fs.readFile(download+'/'+files[0],'utf8'));
    assert.deepEqual(exported.retiredReviews['F28.S03'],envelope.reviews['F28.S03']);
    assert.deepEqual(exported.priorReviews,envelope.priorReviews);
    assert.equal(exported.reviews['F28.S03'],undefined);
    await imported.setViewport({width:390,height:844,deviceScaleFactor:1});
    assert.equal(await imported.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await imported.screenshot({path:output+'/removed-navigation-mobile.png'});
    await importedContext.close();await context.close();currentPage=page;
  });
  await check('Applied scope changes retain proof limits, scenario checks and modules from both source groups',async()=>{
    const context=await browser.createBrowserContext();const proof=await context.newPage();currentPage=proof;
    proof.on('pageerror',error=>errors.push(error.message));
    await proof.goto(base+'#feature/F07?item=F07.S01',{waitUntil:'networkidle0'});
    assert.ok(await proof.$('[id="F07.S01"] .parity-badge[data-parity="partial"]'));
    assert.equal(await proof.$eval('[data-quick-review="F07.S01"]',el=>el.getAttribute('aria-pressed')),'false');
    assert.match(await proof.$eval('[id="F07.S01"] .parity-detail',el=>el.textContent),/Pending payments are implemented and verified/);
    assert.match(await proof.$eval('[id="F07.S01"] .application-evidence[aria-label^="GUI-QML"]',el=>el.textContent),/Verified: pending payments\./);
    await proof.screenshot({path:output+'/pending-balance-verified.png'});
    await proof.goto(base+'#feature/F26?item=F26.S03',{waitUntil:'networkidle0'});
    assert.equal(await proof.$eval('[data-quick-review="F26.S03"]',el=>el.getAttribute('aria-pressed')),'true');
    assert.ok(await proof.$('[id="F26.S03"] a[href="#feature/F24?tab=tests"]'));
    assert.ok(await proof.$('[id="F26.S03"] a[href="#feature/F26?tab=tests"]'));
    assert.match(await proof.$eval('[id="F26.S05"] .application-evidence[aria-label^="GUI-QML"] .capture-preview img',el=>el.src),/032-multiple-loaded-wallets.png$/);
    assert.ok(await proof.$('[id="F26.S05"] a[href="#feature/F02?tab=tests"]'));
    await proof.goto(base+'#feature/F09?item=F09.S07',{waitUntil:'networkidle0'});
    assert.match(await proof.$eval('[id="F09.S07"] h2',el=>el.textContent),/local spending keys/);
    assert.equal(await proof.$eval('[data-quick-review="F09.S07"]',el=>el.getAttribute('aria-pressed')),'true');
    assert.ok(await proof.$('[id="F09.S07"] a[href="#feature/F15?item=F15.S04"]'));
    await proof.goto(base+'#feature/F22?item=F22.S05',{waitUntil:'networkidle0'});
    assert.equal(await proof.$eval('[data-quick-review="F22.S05"]',el=>el.getAttribute('aria-pressed')),'true');
    assert.match(await proof.$eval('[id="F22.S05"] .criterion-checks',el=>el.textContent),/wallet context.*replaying every backend command is not required/);
    const assessment=await proof.evaluate(async()=>await (await fetch('current-assessments.json')).json());
    assert.equal(Object.keys(assessment.criteria).length,182);
    assert.equal(assessment.criteria['F15.S03'].status,'not-implemented');
    assert.equal(assessment.criteria['F29.S04'].status,'not-implemented');
    await proof.screenshot({path:output+'/merged-rpc-scenarios.png',fullPage:true});
    await context.close();currentPage=page;
  });
  await check('Evidence defaults survive scope edits and can be overridden and restored',async()=>{
    const context=await browser.createBrowserContext();const acceptance=await context.newPage();
    acceptance.on('pageerror',error=>errors.push(error.message));
    await acceptance.goto(base+'#feature/F19?item=F19.S01',{waitUntil:'networkidle0'});
    const quick='[data-quick-review="F19.S01"]';
    const badge='[id="F19.S01"] [data-acceptance]';
    assert.match(await acceptance.$eval(badge,el=>el.textContent),/Accepted · evidence default/);
    await acceptance.select('[data-set-requirement="F19.S01"]','release');
    const saved=()=>acceptance.evaluate(()=>JSON.parse(localStorage.getItem('bitcoin-gui-evidence-review-v4:'+window.REVIEW_EVIDENCE.catalogId+':'+window.REVIEW_EVIDENCE.catalogRevision)).reviews['F19.S01']);
    assert.equal((await saved()).status,'default');
    await acceptance.click(quick);
    assert.equal((await saved()).status,'unreviewed');
    await acceptance.reload({waitUntil:'networkidle0'});
    assert.equal(await acceptance.$eval(quick,el=>el.getAttribute('aria-pressed')),'false');
    assert.equal(await acceptance.$eval('#review-progress-text',el=>el.textContent),'132 / 182');
    await acceptance.click('[data-review="F19.S01"]');
    await acceptance.select('#review-state','default');
    await acceptance.type('#review-note','Keep my scope and note while using evidence defaults.');
    await acceptance.click('#review-form button[type="submit"]');
    assert.equal((await saved()).status,'default');
    assert.equal((await saved()).requirement,'release');
    assert.match(await acceptance.$eval(badge,el=>el.textContent),/evidence default/);
    // A later evidence failure withdraws only the automatic acceptance.
    await acceptance.evaluate(()=>{
      window.REVIEW_EVIDENCE.groups.find(g=>g.id==='F19').criteria[0].hasFailure=true;
      location.hash='feature/F19?item=F19.S02';
    });
    await acceptance.waitForFunction(()=>document.querySelector('[data-quick-review="F19.S01"]').getAttribute('aria-pressed')==='false');
    assert.match((await saved()).note,/Keep my scope/);
    await acceptance.click(quick);
    assert.equal((await saved()).status,'accepted');
    await acceptance.reload({waitUntil:'networkidle0'});
    assert.equal(await acceptance.$eval(quick,el=>el.getAttribute('aria-pressed')),'true');
    assert.equal(await acceptance.$eval(badge,el=>el.textContent),'Accepted');
    await acceptance.goto(base+'#feature/F21?item=F21.S04',{waitUntil:'networkidle0'});
    assert.equal(await acceptance.$eval('[data-quick-review="F21.S04"]',el=>el.getAttribute('aria-pressed')),'true');
    assert.ok(await acceptance.$('[id="F21.S04"] .application-evidence[aria-label^="Qt Widgets"] .capture-preview'));
    await acceptance.goto(base+'#feature/F15?item=F15.S03',{waitUntil:'networkidle0'});
    assert.equal(await acceptance.$eval('[data-quick-review="F15.S03"]',el=>el.getAttribute('aria-pressed')),'false');
    await context.close();
  });

  await check('Hardware/platform review links connected QML and recorded tests, preserving raw scope and manual choices',async()=>{
    const context=await browser.createBrowserContext();const hardware=await context.newPage();currentPage=hardware;
    hardware.on('pageerror',error=>errors.push(error.message));
    await hardware.goto(base+'#feature/F21?item=F21.S04',{waitUntil:'networkidle0'});
    const card='[id="F21.S04"]';const quick='[data-quick-review="F21.S04"]';
    assert.ok(await hardware.$(card+' [data-evidence-basis="qml-tests-hooks"]'));
    assert.match(await hardware.$eval(card+' .qml-review',el=>el.textContent),/NAT-PMP/);
    assert.ok(await hardware.$(card+' .qml-review a[href$="/qml/pages/settings/ConnectionSettingsPage.qml"]'));
    assert.ok(await hardware.$(card+' .qml-review a[href$="/test/test_options_model.cpp#L662"]'));
    assert.ok(await hardware.$(card+' .qml-review a[href="gui-feature-evidence/logs/qml-unit-tests.log"]'));
    assert.equal(await hardware.$eval(card+' .recorded-evidence',el=>el.open),false);
    await hardware.click(card+' .recorded-evidence summary');
    assert.equal(await hardware.$eval(card+' .recorded-evidence',el=>el.open),true);
    assert.match(await hardware.$eval(card+' .recorded-evidence',el=>el.textContent),/router/i);
    await hardware.click(card+' .recorded-evidence summary');
    await hardware.screenshot({path:output+'/hardware-review-desktop.png'});
    await hardware.click(quick);
    await hardware.reload({waitUntil:'networkidle0'});
    assert.equal(await hardware.$eval(quick,el=>el.getAttribute('aria-pressed')),'false');
    await hardware.click('[data-review="F21.S04"]');
    await hardware.select('#review-state','default');
    await hardware.click('#review-form button[type="submit"]');
    assert.equal(await hardware.$eval(quick,el=>el.getAttribute('aria-pressed')),'true');
    // The runtime guard also withdraws this basis if a later failure appears.
    await hardware.evaluate(()=>{
      window.REVIEW_EVIDENCE.groups.find(g=>g.id==='F21').criteria.find(c=>c.id==='F21.S04').hasFailure=true;
      location.hash='feature/F21?item=F21.S03';
    });
    await hardware.waitForFunction(()=>document.querySelector('[data-quick-review="F21.S04"]').getAttribute('aria-pressed')==='false');
    assert.equal(await hardware.$(card+' [data-evidence-basis="qml-tests-hooks"]'),null);
    await hardware.setViewport({width:390,height:844,deviceScaleFactor:1});
    await hardware.goto(base+'#feature/F15?item=F15.S04',{waitUntil:'networkidle0'});
    assert.equal(await hardware.$eval('[data-quick-review="F15.S03"]',el=>el.getAttribute('aria-pressed')),'false');
    assert.equal(await hardware.$eval('[data-quick-review="F15.S04"]',el=>el.getAttribute('aria-pressed')),'true');
    assert.equal(await hardware.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await hardware.screenshot({path:output+'/hardware-review-mobile.png'});
    await hardware.goto(base+'#about?section=hardware-platform',{waitUntil:'networkidle0'});
    assert.equal(await hardware.$eval('#hardware-platform details',el=>el.open),true);
    assert.match(await hardware.$eval('#hardware-platform',el=>el.textContent),/no new application, device or operating-system run/i);
    assert.equal(await hardware.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await hardware.screenshot({path:output+'/hardware-guide-mobile.png'});
    await context.close();currentPage=page;
  });

  await check('Coin viewer screenshot acceptance is explicit, opens the approved image and preserves manual review',async()=>{
    const context=await browser.createBrowserContext();const visual=await context.newPage();currentPage=visual;
    visual.on('pageerror',error=>errors.push(error.message));
    await visual.goto(base+'#feature/F12?item=F12.S04',{waitUntil:'networkidle0'});
    const card='[id="F12.S04"]';const qml=card+' .application-evidence[aria-label^="GUI-QML"]';
    const quick='[data-quick-review="F12.S04"]';
    assert.equal(await visual.$eval(quick,el=>el.getAttribute('aria-pressed')),'true');
    assert.match(await visual.$eval(qml+' [data-evidence-basis="reviewed-screenshot"]',el=>el.textContent),/Screenshot accepted/);
    assert.match(await visual.$eval(qml+' .qml-review',el=>el.textContent),/reviewer accepted/);
    assert.match(await visual.$eval(qml+' .qml-review',el=>el.textContent),/confirmation counts remain absent/);
    assert.match(await visual.$eval(qml+' .capture-preview img',el=>el.src),/019-wallet-coin-locked.png$/);
    const raw=await visual.evaluate(()=>window.REVIEW_EVIDENCE.groups.find(g=>g.id==='F12').criteria.find(c=>c.id==='F12.S04').applications.qml);
    assert.equal(raw.status,'limited');assert.equal(raw.captures.length,1);
    await visual.click(qml+' .capture-preview');
    assert.match(await visual.$eval('#capture-image',el=>el.src),/019-wallet-coin-locked.png$/);
    assert.match(await visual.$eval('#capture-metadata',el=>el.textContent),/Screenshot accepted for: F12.S04/);
    await visual.keyboard.press('Escape');
    await visual.screenshot({path:output+'/coin-viewer-accepted-desktop.png'});
    await visual.click(quick);
    await visual.reload({waitUntil:'networkidle0'});
    assert.equal(await visual.$eval(quick,el=>el.getAttribute('aria-pressed')),'false');
    await visual.click('[data-review="F12.S04"]');await visual.select('#review-state','default');
    await visual.click('#review-form button[type="submit"]');
    assert.equal(await visual.$eval(quick,el=>el.getAttribute('aria-pressed')),'true');
    // Changing the approved image's identity withdraws its automatic acceptance.
    await visual.evaluate(()=>{
      window.REVIEW_EVIDENCE.groups.find(g=>g.id==='F12').criteria.find(c=>c.id==='F12.S04').qmlReview.sha256='changed';
      location.hash='feature/F12?item=F12.S03';
    });
    await visual.waitForFunction(()=>document.querySelector('[data-quick-review="F12.S04"]').getAttribute('aria-pressed')==='false');
    await visual.reload({waitUntil:'networkidle0'});
    await visual.setViewport({width:390,height:844,deviceScaleFactor:1});
    await visual.goto(base+'#feature/F12?item=F12.S04',{waitUntil:'networkidle0'});
    await visual.$eval(qml,el=>el.scrollIntoView());
    assert.equal(await visual.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await visual.screenshot({path:output+'/coin-viewer-accepted-mobile.png'});
    await context.close();currentPage=page;
  });
  await check('Full-parity groups and subfeatures default to merge without assigning partial or missing items',async()=>{
    await value('[data-filter="requirement"]','merge');
    assert.equal(await page.$$eval('.group-card',els=>els.length),18);
    await page.click('[data-view="criteria"]');
    const ids=await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent));
    assert.equal(ids.length,133);
    assert.ok(ids.includes('F03.S01')); // Full-parity subfeature inside a partial group.
    assert.ok(ids.includes('F25.S04')); // Full-parity fallback inside an absent group.
    assert.ok(!ids.includes('F01.S04')); // Missing subfeature inside a full-parity group.
    assert.ok(ids.includes('F09.S03')); // Corrected input proves the note outcome.
    await value('[data-filter="requirement"]','unassigned');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),49);
    await value('[data-filter="requirement"]','release');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),0);
    await value('[data-filter="requirement"]','not-needed');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),0);
    assert.equal(await page.$eval('#review-progress-text',el=>el.textContent),'133 / 182');
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
    assert.deepEqual(await page.$$eval('[data-filter="parity"] option',els=>els.map(el=>el.textContent)),['Any implementation','Partial or not implemented','Parity','Partial parity','Not implemented']);
    assert.deepEqual(await page.$$eval('.group-card .group-card-top .criterion-id',els=>els.map(el=>el.textContent)),['F01','F02','F04','F06','F08','F10','F11','F12','F16','F19','F20','F21','F22','F24','F26','F28','F30','F33']);
    assert.equal(await page.$$eval('.group-card .parity-badge[data-parity="parity"]',els=>els.length),18);
    assert.match(await page.$eval('#filter-scope',el=>el.textContent),/whole feature groups/);
    await page.reload({waitUntil:'networkidle0'});
    assert.equal(await page.$eval('[data-filter="parity"]',el=>el.value),'parity');
  });
  await check('Group filters assess the main goal even when secondary capabilities differ',async()=>{
    await value('[data-filter="parity"]','partial');
    assert.equal(await page.$$eval('.group-card',els=>els.length),13);
    assert.ok(await page.$('.group-card[href="#feature/F03"]'));
    assert.ok(await page.$('.group-card[href="#feature/F07"]'));
    assert.match(await page.$eval('.group-card[href="#feature/F07"] .implementation-summary',el=>el.textContent),/3 parity.*1 partial/);
    assert.equal(await page.$('.group-card[href="#feature/F01"]'),null);
    assert.ok(await page.$('.group-card[href="#feature/F34"]')); // RPC rescan exists; progress/cancel do not.
    await value('[data-filter="parity"]','not-implemented');
    assert.deepEqual(await page.$$eval('.group-card .group-card-top .criterion-id',els=>els.map(el=>el.textContent)),['F05','F25','F32']);
    assert.match(await page.$eval('.group-card[href="#feature/F25"] .implementation-summary',el=>el.textContent),/Subfeature parity: 1 parity/); // In-app errors do not fulfill desktop notifications.
    assert.equal(await page.$('.group-card[href="#feature/F01"]'),null);
    await page.screenshot({path:output+'/parity-groups.png'});
  });
  await check('Subfeature parity distinguishes partial functionality from absence',async()=>{
    await page.click('[data-view="criteria"]');
    const absent=await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent));
    assert.equal(absent.length,35);
    assert.ok(absent.includes('F01.S04'));
    assert.ok(absent.includes('F03.S04'));
    assert.ok(absent.includes('F15.S03')); // Device verification now has its own scope.
    await value('[data-filter="parity"]','partial');
    const partial=await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent));
    assert.equal(partial.length,14);
    assert.ok(!partial.includes('F15.S03'));
    assert.ok(partial.includes('F13.S02'));assert.ok(partial.includes('F07.S01'));
    assert.ok(!partial.includes('F09.S03'));
    assert.ok(partial.includes('F14.S01')); // File import exists; compatibility still blocks some transactions.
    await value('[data-filter="parity"]','parity');
    const parity=await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent));
    assert.equal(parity.length,133);
    assert.ok(!parity.includes('F07.S01'));assert.ok(parity.includes('F04.S02')); // Migration now has direct runtime proof.
    assert.ok(parity.includes('F21.S04')); // Router mapping is accepted through QML and tested hooks.
    for(const id of ['F02.S04','F08.S06','F13.S05','F14.S06'])assert.ok(parity.includes(id),id); // Equivalent reachable workflows.
    assert.equal(new Set([...parity,...partial,...absent]).size,182);
    assert.match(await page.$eval('#filter-scope',el=>el.textContent),/individual subfeatures/);
  });
  await check('Parity and evidence coverage can be combined without conflating them',async()=>{
    await value('[data-filter="evidence"]','partial');
    await page.type('#catalog-search','F23.S12');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),0);
    await value('[data-filter="evidence"]','full');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),1);
    assert.ok(await page.$('.criterion-result .parity-badge[data-parity="parity"]'));
    await page.reload({waitUntil:'networkidle0'});
    assert.equal(await page.$eval('[data-filter="parity"]',el=>el.value),'parity');
    assert.equal(await page.$eval('[data-filter="evidence"]',el=>el.value),'full');
    await page.click('.criterion-result');
    await page.waitForSelector('[id="F23.S12"] .parity-detail');
    assert.ok(await page.$('[id="F23.S12"] .parity-badge[data-parity="parity"]'));
    assert.equal(await page.$$eval('[id="F23.S12"] .application-evidence',els=>els.length),2);
    assert.match(await page.$eval('[id="F23.S12"] .parity-detail',el=>el.textContent),/backup/);
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
    assert.ok(await page.$('[id="F08.S06"] .application-evidence[aria-label^="GUI-QML"] .badge-assertions'));
    assert.equal(await page.$$eval('[id="F08.S06"] .application-evidence',els=>els.length),2);
    await page.screenshot({path:output+'/outcome-subfeature.png'});
  });
  await go('#catalog?evidence=full&view=criteria');
  let fullIds, partialIds;
  await check('Full evidence accepts targeted captures, tested integrations or an explicitly accepted screenshot',async()=>{
    assert.deepEqual(await page.$$eval('[data-filter="evidence"] option',els=>els.map(el=>el.textContent)),['Any evidence','Full','Partial']);
    assert.equal(await page.$('[data-filter="app"]'),null);
    fullIds=await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent));
    assert.equal(fullIds.length,133);
    assert.ok(fullIds.includes('F01.S01'));
    assert.ok(fullIds.includes('F12.S04'));
    assert.ok(fullIds.includes('F09.S08')); // Fresh watch-only export proof and capture.
    assert.ok(fullIds.includes('F09.S03')); // Rerun assertion and matching captures.
    assert.equal(await page.$$eval('.result-statuses',els=>els.every(el=>el.textContent.includes('Qt Widgets')&&el.textContent.includes('GUI-QML'))),true);
  });
  await check('Partial evidence includes every incomplete criterion and missing workflow',async()=>{
    await value('[data-filter="evidence"]','partial');
    partialIds=await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent));
    assert.equal(partialIds.length,49);
    assert.ok(!partialIds.includes('F09.S03'));
    assert.ok(!partialIds.includes('F12.S04'));
    assert.ok(partialIds.includes('F23.S01')); // The new regression must remain unaccepted.
    assert.ok(!partialIds.includes('F21.S04'));
    assert.ok(!partialIds.includes('F23.S12'));assert.ok(partialIds.includes('F27.S03'));
    assert.equal(await page.$$eval('.result-statuses .badge-gap:not(.parity-badge)',els=>els.length),34);
    assert.equal(new Set([...fullIds,...partialIds]).size,182);
    assert.equal(fullIds.some(id=>partialIds.includes(id)),false);
    await page.reload({waitUntil:'networkidle0'});
    assert.equal(await page.$eval('[data-filter="evidence"]',el=>el.value),'partial');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),49);
  });
  await check('Capture filters use GUI-QML and preserve the Widgets reference',async()=>{
    await value('[data-filter="captures"]','yes');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),7);
    await value('[data-filter="captures"]','no');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),42);
    await value('[data-filter="evidence"]','full');
    assert.deepEqual((await page.$$eval('.criterion-result .criterion-id',els=>els.map(el=>el.textContent))).sort(),['F16.S09','F20.S07','F21.S04','F27.S04']);
    await page.$eval('#catalog-search',el=>{el.value='F20.S07';el.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),1); // Widgets has a capture; QML has none.
    await page.click('.criterion-result');
    await page.waitForSelector('[id="F20.S07"]');
    assert.equal(await page.$$eval('[id="F20.S07"] .application-evidence',els=>els.length),2);
    assert.ok(await page.$('[id="F20.S07"] .application-evidence[aria-label^="Qt Widgets"] .capture-preview'));
    assert.match(await page.$eval('[id="F20.S07"]',el=>el.textContent),/other chains/);
    await go('#feature/F20');
    await page.click('[data-action="clear-filters"]');
    const count=await page.evaluate(()=>window.REVIEW_EVIDENCE.groups.find(g=>g.id==='F20').criteria.length);
    assert.equal(await page.$$eval('.criterion-card',els=>els.length),count);
  });
  await check('Legacy application and evidence links migrate to GUI-QML coverage',async()=>{
    await page.goto(base+'#catalog?app=widgets&evidence=gap&view=criteria',{waitUntil:'networkidle0'});
    assert.equal(await page.evaluate(()=>location.hash),'#catalog?evidence=partial&view=criteria');
    assert.equal(await page.$eval('[data-filter="evidence"]',el=>el.value),'partial');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),49);
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
  await check('A group requirement becomes the default without changing acceptance',async()=>{
    await page.click('[data-review="F19"]');
    assert.equal(await page.$eval('#review-detail-fields',el=>el.hidden),true);
    assert.deepEqual(await page.$$eval('#review-requirement option',els=>els.map(el=>el.textContent)),['Needed for merge','Needed for release','Not needed','Unassigned']);
    await page.select('#review-requirement','merge');
    await page.click('#review-form button[type="submit"]');
    assert.ok(await page.$('[id="F19.S01"] [data-requirement="merge"]'));
    assert.match(await page.$eval('[id="F19.S01"] .requirement-badge',el=>el.textContent),/from group/);
    assert.equal(await page.$eval('#review-progress-text',el=>el.textContent),'133 / 182');
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
    assert.equal(await page.$eval('#review-progress-text',el=>el.textContent),'133 / 182');
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
    assert.equal(await page.$eval('[data-quick-review="F19.S01"]',el=>el.getAttribute('aria-pressed')),'false');
    assert.match(await page.$eval('#review-progress-text',el=>el.textContent),/^132 \/ 182$/);
  });
  await check('Review export includes the snapshot identity and personal notes',async()=>{
    await page.click('[data-review="F19.S03"]');
    await page.select('#review-state','accepted');
    await page.click('#review-form button[type="submit"]');
    await page.click('#export-review');
    let files=[];
    for(let tries=0;tries<50&&!files.length;tries++){files=(await fs.readdir(output+'/downloads')).filter(f=>f.endsWith('.json'));if(!files.length)await new Promise(r=>setTimeout(r,100));}
    assert.equal(files.length,1);
    const payload=JSON.parse(await fs.readFile(output+'/downloads/'+files[0],'utf8'));
    assert.equal(payload.schemaVersion,4);assert.equal(payload.reviews['F19.S01'].status,'reviewed');assert.equal(payload.evidenceDate,'2026-10-08');
    assert.equal(payload.reviews.F19.requirement,'merge');
    assert.equal(payload.reviews['F19.S01'].requirement,'inherit');
    assert.equal(payload.reviews['F19.S02'].requirement,'release');
    assert.equal(payload.reviews['F19.S03'].requirement,'not-needed');
    assert.equal(payload.reviews['F19.S03'].status,'accepted');
    assert.equal(payload.reviews['F19.S02'].status,'default');
    assert.equal(payload.acceptanceDefaults.rule,'parity-and-full-qml-evidence');
    assert.ok(payload.acceptanceDefaults.accepted.includes('F19.S02'));
    assert.ok(!payload.acceptanceDefaults.accepted.includes('F19.S01'));
    assert.ok(!payload.acceptanceDefaults.accepted.includes('F19.S03'));
    await fs.writeFile(output+'/roundtrip.json',JSON.stringify(payload));
    await fs.writeFile(output+'/import.json',JSON.stringify({...payload,schemaVersion:1,reviews:{'F01.S01':{status:'followup',note:'Review import check',updatedAt:new Date().toISOString()}}}));
    await fs.writeFile(output+'/wrong-snapshot.json',JSON.stringify({...payload,catalogId:'wrong-snapshot'}));
    await fs.writeFile(output+'/conflict.json',JSON.stringify({...payload,schemaVersion:2,reviews:{F19:{...payload.reviews.F19,requirement:'not-needed'},'F19.S01':{...payload.reviews['F19.S01'],note:'Must not replace existing note',requirement:'release'}}}));
    await fs.writeFile(output+'/invalid.json',JSON.stringify({...payload,reviews:{'F19.S03':{...payload.reviews['F19.S03'],requirement:'urgent'}}}));
  });
  await check('Older review files remain importable and wrong snapshots are rejected',async()=>{
    await (await page.$('#import-file')).uploadFile(output+'/import.json');
    await page.waitForFunction(()=>document.querySelector('#review-progress-text').textContent==='131 / 182');
    await (await page.$('#import-file')).uploadFile(output+'/wrong-snapshot.json');
    await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('different evidence snapshot'));
    assert.equal(await page.$eval('#review-progress-text',el=>el.textContent),'131 / 182');
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
    assert.equal(await imported.$eval('[id="F19.S03"] [data-acceptance]',el=>el.textContent),'Accepted');
    assert.match(await imported.$eval('[id="F19.S02"] [data-acceptance]',el=>el.textContent),/Accepted · evidence default/);
    assert.equal(await imported.$eval('[id="F19.S01"] [data-acceptance]',el=>el.textContent),'Reviewed');
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
    assert.equal(await legacy.$eval('#review-progress-text',el=>el.textContent),'132 / 182');
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
    assert.equal(await saved.$eval('#review-progress-text',el=>el.textContent),'131 / 182');
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
    assert.equal(await page.$$eval('.group-card',els=>els.length),16);
    await page.click('[data-view="criteria"]');
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),49);
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
    assert.match(await page.$eval('.functional-table tbody',el=>el.textContent),/qml_evidence_cache_limit/);
    assert.equal(await page.$('.finding-panel'),null);
    assert.ok(await page.$('a[href="gui-feature-evidence/logs/qml_test_send_create.log"]'));
    await go('#tests');
    assert.equal(await page.$$eval('.functional-table tbody tr',els=>els.length),42);
    assert.equal(await page.$$eval('.functional-table .failed-row',els=>els.length),2);
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
  await check('All feature routes expose every current criterion',async()=>{
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
    const captures = await page.evaluate(()=>window.REVIEW_EVIDENCE.groups.find(g=>g.id==='F17').criteria.slice(0,2).map(c=>c.applications.qml.captures));
    assert.deepEqual(captures.map(c=>c.length),[3,1]);
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
      return {collection:d.collections.find(c=>c.application==='widgets'),missing:rows.filter(c=>!c.applications.widgets.captures.length).map(c=>c.id),
        backup:rows.find(c=>c.id==='F04.S02'),device:rows.find(c=>c.id==='F15.S03'),total:d.captures.length};
    });
    assert.equal(proof.collection.selectedCaptures.length,61);
    assert.equal(proof.collection.newlyCapturedCriteria,58);
    assert.equal(proof.collection.assertions,44);
    assert.equal(proof.missing.length,9);
    assert.equal(proof.total,221);
    assert.equal(proof.backup.applications.widgets.status,'assertions');
    assert.equal(proof.backup.snapshotWidgetsEvidence.captures.length,0);
    assert.ok(proof.backup.applications.widgets.captures.every(p=>p.startsWith('collections/20261010-widgets/')));
    assert.equal(proof.backup.applications.qml.status,'assertions');
    assert.equal(proof.backup.snapshotQmlEvidence.status,'source');
    assert.equal(proof.backup.implementation.status,'parity');
    assert.equal(proof.device.applications.widgets.captures.length,0);
    assert.equal(proof.device.implementation.status,'not-implemented');
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
  await check('New QML evidence accepts proven outcomes and exposes the cache regression and test backlog',async()=>{
    await go('#feature/F23?item=F23.S01');
    assert.equal(await page.$eval('[data-quick-review="F23.S01"]',el=>el.getAttribute('aria-pressed')),'false');
    assert.ok(await page.$('[id="F23.S01"] .parity-badge[data-parity="partial"]'));
    assert.match(await page.$eval('[id="F23.S01"]',el=>el.textContent),/768/);
    assert.ok(await page.$('[id="F23.S01"] a[href$="missing-functional-tests.md#f23-s01"]'));
    await page.screenshot({path:output+'/qml-cache-regression.png',fullPage:true});
    await go('#feature/F04?item=F04.S02');
    assert.equal(await page.$eval('[data-quick-review="F04.S02"]',el=>el.getAttribute('aria-pressed')),'true');
    const proof=await page.evaluate(()=>{
      const c=window.REVIEW_EVIDENCE.collections.find(c=>c.application==='qml');
      return {captures:c.selectedCaptures.length,closed:c.closedProofGaps,remaining:c.remainingProofGaps,checks:c.assertions,failed:c.failedAssertions};
    });
    assert.deepEqual(proof,{captures:37,closed:35,remaining:26,checks:50,failed:1});
    await go('#tests');
    assert.match(await page.$eval('.assertion-links',el=>el.textContent),/49 passed · 1 failed/);
    await page.click('[data-collection="20261010-qml"] summary');
    assert.ok(await page.$('[data-collection="20261010-qml"] a[href$="missing-functional-tests.md"]'));
    assert.match(await page.$eval('[data-collection="20261010-qml"]',el=>el.textContent),/35 of the 61 proof gaps/);
    const plan=await page.evaluate(async()=>await (await fetch('gui-feature-evidence/collections/20261010-qml/functional-test-plan.json')).json());
    assert.equal(plan.length,61);
    assert.equal(plan.filter(c=>c.status==='proved').length,35);
    assert.deepEqual(plan.filter(c=>c.status==='failing-regression').map(c=>c.id),['F23.S01']);
    await page.setViewport({width:390,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
    await page.screenshot({path:output+'/qml-evidence-mobile.png'});
    await page.setViewport({width:1440,height:1000});
  });
  await check('Pending payments have passing proof and a separate maturity failure remains visible',async()=>{
    await go('#feature/F07?item=F07.S01');
    const row='[id="F07.S01"]';
    assert.match(await page.$eval(row,el=>el.textContent),/Verified: pending payments\./);
    assert.match(await page.$eval(row,el=>el.textContent),/13 passing checks/);
    assert.match(await page.$eval(row,el=>el.textContent),/51\.625 BTC/);
    assert.equal(await page.$eval('[data-quick-review="F07.S01"]',el=>el.getAttribute('aria-pressed')),'false');
    const proof=await page.evaluate(()=>{
      const c=window.REVIEW_EVIDENCE.collections.find(c=>c.id==='20261011-pending-balance');
      const row=window.REVIEW_EVIDENCE.groups.find(g=>g.id==='F07').criteria.find(c=>c.id==='F07.S01');
      return {tests:c.functional.map(r=>[r.test,r.status]),captures:c.selectedCaptures.map(p=>p.path),prior:row.collectionEvidenceHistory.length};
    });
    assert.deepEqual(proof.tests,[['qml_evidence_pending_balance','passed'],['qml_evidence_maturity_refresh','failed']]);
    assert.equal(proof.captures.length,3);assert.equal(proof.prior,1);
    assert.match(await page.$eval(row+' .application-evidence[aria-label^="GUI-QML"] .capture-preview img',el=>el.src),/001-pending-mempool-payment-and-wallet-funds\.png$/);
    assert.ok(await page.$(row+' a[href$="collections/20261011-pending-balance/report.md"]'));
    await go('#feature/F07?tab=tests');
    assert.match(await page.$eval('.tests-table',el=>el.textContent),/2026-10-11/);
    assert.match(await page.$eval('.tests-table',el=>el.textContent),/mining-maturity balance refresh failed/);
    await go('#tests?result=failed');
    assert.match(await page.$eval('.functional-table',el=>el.textContent),/qml_evidence_maturity_refresh/);
    assert.doesNotMatch(await page.$eval('.functional-table',el=>el.textContent),/qml_evidence_pending_balance/);
    await page.click('[data-collection="20261011-pending-balance"] summary');
    await page.setViewport({width:390,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
    await page.$eval('[data-collection="20261011-pending-balance"]',el=>el.scrollIntoView());
    await page.screenshot({path:output+'/pending-proof-mobile.png'});
    await page.setViewport({width:1440,height:1000});
  });
  await check('All 221 selected captures decode in the browser',async()=>{
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
    assert.equal(await page.$$eval('.criterion-result',els=>els.length),35);
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
  const savedAction=()=>actionsPage.evaluate(()=>JSON.parse(localStorage.getItem('bitcoin-gui-evidence-review-v4:'+window.REVIEW_EVIDENCE.catalogId+':'+window.REVIEW_EVIDENCE.catalogRevision)).reviews['F19.S01']);
  const settleActions=()=>actionsPage.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await check('Quick acceptance toggles immediately and preserves notes, scope, focus and scroll',async()=>{
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
    assert.equal(await actionsPage.$eval('#review-progress-text',el=>el.textContent),'133 / 182');
    let record=await savedAction();
    assert.equal(record.status,'accepted');assert.equal(record.note,reviewNote);assert.equal(record.requirement,'release');
    assert.ok(Number.isFinite(Date.parse(record.updatedAt)));
    await actionsPage.screenshot({path:output+'/card-actions-desktop-dark.png'});
    await actionsPage.reload({waitUntil:'networkidle0'});
    assert.equal(await actionsPage.$eval(quick,el=>el.getAttribute('aria-pressed')),'true');
    await actionsPage.focus(quick);
    await actionsPage.keyboard.press('Space');
    assert.equal(await actionsPage.$eval(quick,el=>el.getAttribute('aria-pressed')),'false');
    assert.equal(await actionsPage.$eval('#review-progress-text',el=>el.textContent),'132 / 182');
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
    assert.equal(record.status,'accepted');assert.equal(record.note,reviewNote);assert.equal(record.requirement,'release');
    await actionsPage.goto(base+'#catalog?view=criteria&requirement=release&review=accepted&q=F19.S01',{waitUntil:'networkidle0'});
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
        assert.equal(await actionsPage.$eval('#review-state',el=>el.value),'accepted');
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
