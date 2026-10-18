import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { confirmedFaq } from '../data/faq';
import { featuredTestimonials, moreTestimonials } from '../data/landing';

test.beforeEach(async ({page}) => {
  await page.route('https://assets.calendly.com/**',r=>r.fulfill({contentType:'text/javascript',body:"window.Calendly={initInlineWidget(o){const f=document.createElement('iframe');f.src=o.url;o.parentElement.appendChild(f)}}"}));
  await page.route('https://calendly.com/**',r=>r.fulfill({contentType:'text/html',body:'<body></body>'}));
  // Nitro's local node preview omits byte ranges for public files. Serve the
  // unchanged MP4 as a static host does, so seek tests exercise real playback.
  await page.route('**/videos/founder-intro.mp4',async route=>{
    const body = await readFile('public/videos/founder-intro.mp4');
    const range = /bytes=(\d+)-(\d*)/.exec(route.request().headers().range || '');
    const start = range ? Number(range[1]) : 0;
    const end = range?.[2] ? Math.min(Number(range[2]),body.length-1) : body.length-1;
    await route.fulfill({status:range ? 206 : 200,contentType:'video/mp4',headers:{'accept-ranges':'bytes',...(range ? {'content-range':`bytes ${start}-${end}/${body.length}`} : {})},body:body.subarray(start,end+1)});
  });
});
async function booked(page: Page) {
  await page.context().addCookies([{name:'solvenek-booking',value:encodeURIComponent(JSON.stringify({completedAt:Date.now(),date:null,timeRange:null,timezone:null,meetingType:'Google Meet'})),url: test.info().project.use.baseURL!,sameSite:'Lax'}]);
  await page.goto('/confirmed');
  await page.evaluate(()=>document.fonts.ready);
}
async function geometry(page: Page, rootSelector: string, cardSelector: string) {
  return page.locator(rootSelector).evaluate((root,selector) => {
    const path = root.querySelector<SVGPathElement>('[data-process-path]')!;
    const length = path.getTotalLength();
    const matrix = path.getScreenCTM()!;
    const points = Array.from({length:201},(_,i) => {const p=path.getPointAtLength(length*i/200);return new DOMPoint(p.x,p.y).matrixTransform(matrix);});
    const rects = [...root.querySelectorAll(selector)].map(card=>card.getBoundingClientRect());
    const bounds = root.getBoundingClientRect();
    const contains = (r:DOMRect,p:DOMPoint)=>p.x>=r.left-.5&&p.x<=r.right+.5&&p.y>=r.top-.5&&p.y<=r.bottom+.5;
    return {length,hits:rects.map(r=>points.some(p=>contains(r,p))),first:contains(rects[0]!,points[0]!),last:contains(rects.at(-1)!,points.at(-1)!),outside:points.filter(p=>!contains(bounds,p)).length,thresholds:[...root.querySelectorAll<HTMLElement>(selector)].map(card=>Number(card.dataset.pathThreshold))};
  },cardSelector);
}
for (const width of [1440,1366,1024,768,390]) {
  for (const zoom of [1,1.25]) {
    test(`process measured path ${width} at ${zoom*100}%`,async ({page},info)=>{
      test.skip(info.project.name==='mobile','Explicit viewport matrix runs once.');
      await page.setViewportSize({width:Math.round(width/zoom),height:Math.round(900/zoom)});
      if (zoom !== 1) {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Emulation.setDeviceMetricsOverride',{width:Math.round(width/zoom),height:Math.round(900/zoom),deviceScaleFactor:zoom,mobile:false});
      }
      await page.goto('/');
      await page.evaluate(()=>document.fonts.ready);
      for (const card of await page.locator('.story-card').all()) { await card.scrollIntoViewIfNeeded(); await expect(card).toHaveClass(/is-visible/); }
      await page.locator('.story-card').last().evaluate(card=>card.scrollIntoView({block:'center',behavior:'instant'}));
      await page.waitForTimeout(1000);
      const result = await geometry(page,'.process-story','.story-card');
      expect(result.hits).toEqual([true,true,true,true]);expect(result.first).toBe(true);expect(result.last).toBe(true);expect(result.outside).toBe(0);
      expect(result.thresholds[0]).toBe(0);expect(result.thresholds[3]).toBe(1);
      await expect(page.locator('.story-card').last()).toHaveClass(/is-lit/);
      await expect(page.locator('.process-dot')).toHaveClass(/at-rest/);
      await page.locator('.process-story').screenshot({path:`.qa/confirmed/process-${width}-${zoom*100}.png`,style:'.skip-link,.mobile-calendar-cta { visibility:hidden !important; }'});
      await info.attach('geometry',{body:JSON.stringify(result),contentType:'application/json'});
    });
  }
}
for (const viewport of [{width:1440,height:900},{width:1366,height:768},{width:1024,height:768},{width:390,height:844}]) {
  test(`confirmed views and geometry ${viewport.width}`,async({page},info)=>{
    test.skip(info.project.name==='mobile','Explicit viewport matrix runs once.');
    const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    await page.addInitScript(()=>{
      (window as unknown as {confirmationCLS:number}).confirmationCLS=0;
      new PerformanceObserver(list=>list.getEntries().forEach(entry=>{
        const shift=entry as PerformanceEntry & {hadRecentInput:boolean;value:number};
        if(!shift.hadRecentInput)(window as unknown as {confirmationCLS:number}).confirmationCLS+=shift.value;
      })).observe({type:'layout-shift',buffered:true});
    });
    await page.setViewportSize(viewport);await booked(page);await page.waitForTimeout(1200);
    await page.screenshot({path:`.qa/confirmed/confirmed-${viewport.width}-fold.png`});
    if(viewport.width===1440) {const hero=await page.locator('.confirmation-hero').boundingBox();expect(hero!.y+hero!.height).toBeLessThan(900);}
    await page.locator('.expect-flow').scrollIntoViewIfNeeded();await page.waitForTimeout(800);
    const result=await geometry(page,'.expect-flow','.expect-card');expect(result.hits).toEqual([true,true,true]);expect(result.first&&result.last).toBe(true);expect(result.outside).toBe(0);
    await page.screenshot({path:`.qa/confirmed/confirmed-${viewport.width}-mid.png`});
    await page.locator('#faq').evaluate(el=>el.scrollIntoView({block:'start'}));await page.waitForTimeout(800);
    await page.screenshot({path:`.qa/confirmed/confirmed-${viewport.width}-faq.png`});
    expect(await page.evaluate(()=>(window as unknown as {confirmationCLS:number}).confirmationCLS)).toBeLessThan(.02);
    await info.attach('CLS',{body:String(await page.evaluate(()=>(window as unknown as {confirmationCLS:number}).confirmationCLS)),contentType:'text/plain'});
    expect(errors).toEqual([]);
  });
}
test('checklist persists, keyboard toggles, video prepares and completes',async({page})=>{
  await booked(page);
  const invite=page.getByLabel('Open the invite in your email',{exact:true});
  await invite.focus();await page.keyboard.press('Space');await expect(invite).toBeChecked();
  await page.getByLabel('Click Add to Calendar',{exact:true}).check();
  await page.reload();await expect(invite).toBeChecked();await expect(page.getByLabel('Click Add to Calendar',{exact:true})).toBeChecked();
  await page.locator('video').evaluate(async element=>{const video=element as HTMLVideoElement;video.muted=true;await video.play();video.currentTime=11;});
  await expect(page.getByLabel('Watch the intro video',{exact:true})).toBeChecked();
  await expect(page.locator('#prep-heading')).toHaveText('You’re all set.');
  await expect(page.locator('[aria-live="polite"]')).toHaveText('3 of 3 done');
  await page.getByLabel('Watch the intro video',{exact:true}).uncheck();await expect(page.locator('#prep-heading')).toHaveText('Your prep checklist');
  await page.locator('video').evaluate(element=>{const video=element as HTMLVideoElement;video.currentTime=video.duration-.1;});
  await page.waitForFunction(()=>document.querySelector('video')!.ended);
  // Manual overrides remain usable even after the automatic completion.
  await page.getByLabel('Watch the intro video',{exact:true}).check();await page.reload();
  await expect(page.locator('#prep-heading')).toHaveText('You’re all set.');
});
test('visible FAQ copy, real proof, local FAQ link, contact, print and reduced motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await booked(page);
  await expect(page.locator('.answer-card h3')).toHaveText(confirmedFaq.map(item=>item.question));
  await expect(page.locator('.answer-card p')).toHaveText(confirmedFaq.map(item=>item.answer));
  expect(await page.locator('.answer-card button,.answer-card a,.answer-card[tabindex]').count()).toBe(0);
  expect(await page.locator('body').innerText()).not.toContain('TODO');
  await expect(page.locator('.result-card blockquote')).toHaveText([featuredTestimonials[1]!,featuredTestimonials[0]!,...moreTestimonials].map(item=>item.quote));
  await expect(page.locator('.contact-band a')).toHaveAttribute('href','mailto:support@solvenek.com');
  await page.locator('header .faq-link').click();await expect(page).toHaveURL(/\/confirmed#faq$/);await expect(page.locator('#faq')).toBeFocused();
  const faq=await page.locator('#faq').boundingBox();expect(faq!.y).toBeGreaterThanOrEqual(90);
  await expect(page.locator('.expect-card.is-lit')).toHaveCount(3);
  await page.emulateMedia({media:'print'});
  for(const answer of await page.locator('.answer-card p').all())await expect(answer).toBeVisible();
});
test('conditions ad spend range, both counters, emphasis, date and 90 cells',async({page})=>{
  await page.goto('/conditions');await page.locator('.key-terms').scrollIntoViewIfNeeded();
  await expect(page.locator('.key-term').last().locator('.term-counter')).toHaveText('$30–50');
  await expect(page.locator('.key-term').last().locator('p')).toHaveText('a day ad spend');
  await expect(page.locator('#ad-spend .condition-copy strong')).toHaveText(['$30–50/day','90 days']);
  await expect(page.locator('time')).toHaveAttribute('datetime','2026-10-19');
  await expect(page.locator('.stage-scenes .visual-2 .spend-grid i')).toHaveCount(90);
  await expect(page.locator('.mobile-visual .visual-2 .spend-amount')).toHaveCSS('white-space','nowrap');
  if(page.viewportSize()!.width < 768) expect((await page.locator('.mobile-visual .visual-2 .spend-amount').boundingBox())!.height).toBeLessThan(40);
  await page.locator('#ad-spend').scrollIntoViewIfNeeded();await page.waitForTimeout(800);
  await page.screenshot({path:`.qa/confirmed/conditions-${test.info().project.name}.png`});
});

test('all published answers remain readable without JavaScript',async({browser,baseURL})=>{
  const context = await browser.newContext({javaScriptEnabled:false,baseURL});
  await context.addCookies([{name:'solvenek-booking',value:encodeURIComponent(JSON.stringify({completedAt:Date.now(),date:null,timeRange:null,timezone:null,meetingType:'Google Meet'})),url:baseURL!,sameSite:'Lax'}]);
  const page = await context.newPage();await page.goto('/confirmed');
  await expect(page.locator('.answer-card p')).toHaveText(confirmedFaq.map(item=>item.answer));
  for(const answer of await page.locator('.answer-card p').all()) await expect(answer).toBeVisible();
  expect(await page.locator('body').innerText()).not.toContain('TODO');
  await context.close();
});

test('ten seconds of uninterrupted playback automatically ticks the video item',async({page})=>{
  await page.unroute('**/videos/founder-intro.mp4');
  await booked(page);
  await page.locator('video').evaluate(async element=>{const video=element as HTMLVideoElement;video.muted=true;await video.play();});
  await expect(page.getByLabel('Watch the intro video',{exact:true})).toBeChecked({timeout:15000});
});
