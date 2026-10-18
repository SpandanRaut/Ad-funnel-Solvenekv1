import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const mark = await fs.readFile(path.join(root, 'public/brand/solvenek-mark.svg'), 'utf8');
const paths = [...mark.matchAll(/<path[^>]*d="([^"]+)"/g)].map(match => match[1]);
if (paths.length !== 2) throw new Error('The brand mark must contain exactly two paths.');
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 376 376"><style>:root{--mark-navy:#001D61;--mark-blue:#1D5EF0}@media(prefers-color-scheme:dark){:root{--mark-navy:#EAF0FF}}</style><g transform="translate(38 0)"><path fill="var(--mark-navy)" d="${paths[0]}"/><path fill="var(--mark-blue)" d="${paths[1]}"/></g></svg>`;
await fs.writeFile(path.join(root, 'public/favicon.svg'), favicon + '\n');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width:1200, height:630 }, deviceScaleFactor:1 });
  await page.goto(pathToFileURL(path.join(root, 'scripts/og-image.html')).href);
  await page.locator('[data-brand-mark]').evaluate((el, svg) => { el.innerHTML = svg; }, mark);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path:path.join(root, 'public/og-image.png') });
  for (const [size, scale, name] of [[180,.7,'apple-touch-icon'],[192,.7,'icon-192'],[512,.7,'icon-512'],[512,.6,'icon-512-maskable']]) {
    await page.setViewportSize({ width:size, height:size });
    await page.setContent(`<style>html,body{padding:0;margin:0;width:100%;height:100%;background:#fff}body{display:flex;align-items:center;justify-content:center}svg{display:block;height:${scale*100}%;width:auto}</style>${mark}`);
    await page.screenshot({ path:path.join(root, `public/${name}.png`) });
  }
  // Create the clean opaque companion from the transparent source when the
  // supplied white PNG is absent. Never substitute or modify another original.
  const whiteSource = path.join(root, 'public/sovenek logo.png');
  try { await fs.copyFile(whiteSource, path.join(root, 'public/brand/solvenek-logo.png')); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await page.setViewportSize({width:1254,height:1254});
    const source = (await fs.readFile(path.join(root,'public/brand/solvenek-logo-transparent.png'))).toString('base64');
    await page.setContent(`<style>html,body{margin:0;background:#fff}img{display:block;width:1254px;height:1254px}</style><img src="data:image/png;base64,${source}" alt="">`);
    await page.locator('img').evaluate(image => image.decode());
    await page.screenshot({path:path.join(root,'public/brand/solvenek-logo.png')});
    console.log('Missing public/sovenek logo.png: clean opaque companion composited from the transparent source.');
  }
} finally { await browser.close(); }
await fs.writeFile(path.join(root,'public/site.webmanifest'), JSON.stringify({name:'Solvenek',short_name:'Solvenek',start_url:'/',display:'standalone',background_color:'#FFFFFF',theme_color:'#050B1A',icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},{src:'/icon-512-maskable.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]},null,2)+'\n');
console.log('Generated real-logo SVG favicon, Apple/app/maskable icons, manifest and OG image. favicon.ico is untouched.');
