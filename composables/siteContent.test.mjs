import assert from 'node:assert/strict';
import {test} from 'node:test';
import {siteSeo,guaranteeConditions,SITE_UPDATED} from './siteContent.ts';
test('all metadata respects title and description limits',()=>{
  for(const [page,meta]of Object.entries(siteSeo)){assert.ok(meta.title.length<=60,`${page} title ${meta.title.length}`);assert.ok(meta.description.length<=155,`${page} description ${meta.description.length}`);}
});
test('all six guarantee conditions remain verbatim',()=>{
  assert.deepEqual(guaranteeConditions.map(c=>c.text),[
    'The target is agreed in writing before launch. As a starting point, 8 booked estimates a month, or 24 over the 90 days.',
    'The client keeps an ad spend of $30–50/day for the full 90 days.',
    'The client supplies photos and videos before launch.',
    'The client gives feedback on every lead through the tracking sheet.',
    'The client attends the weekly check-ins.',
    '“Free” means our management fee for the next 30 days. The client still pays their own ad spend.',
  ]);
  assert.match(SITE_UPDATED,/^\d{4}-\d{2}-\d{2}$/);
});
