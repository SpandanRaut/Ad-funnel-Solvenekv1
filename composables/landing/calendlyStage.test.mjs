import assert from 'node:assert/strict';
import { test } from 'node:test';
import { initialCalendlyState, reduceCalendlyStage } from './calendlyStage.ts';

// Replay the message payloads/timing recorded from the live iframe at both
// widths. No browser globals, fixtures containing invitee data, or dependencies.
const viewed = 'calendly.event_type_viewed';
const selected = 'calendly.date_and_time_selected';
const height = (value) => ['calendly.page_height', { height: `${value}px` }];
function replay(entries, initial = initialCalendlyState()) {
  return entries.reduce((state, [at, event, payload]) => reduceCalendlyStage(state, { at, event, payload }), initial);
}
function settled(value, at = 0) { return [[at, ...height(value)], [at + 125, 'settle']]; }
function details(base) {
  return replay([[0, viewed, {}], ...settled(602, 5), ...settled(939, 200), [400, selected, {}], ...settled(base, 405)]);
}
for (const base of [915, 989]) {
  test(`recorded ${base === 915 ? 'desktop' : 'mobile'} forward / back / forward`, () => {
    let state = details(base);
    assert.equal(state.stage, 'details');
    state = replay([[700, viewed, {}], [704, viewed, {}], [704, ...height(767)], [829, 'settle']], state);
    assert.equal(state.stage, 'time');
    state = replay([...settled(939, 1400), ...settled(602, 1600)], state);
    assert.equal(state.stage, 'date');
    state = replay([...settled(1249, 1800), [2000, selected, {}], ...settled(base, 2005)], state);
    assert.equal(state.stage, 'details');
  });
  test(`guests, removal, validation stay details at ${base}`, () => {
    const guest = base === 915 ? 117 : 138;
    let state = details(base);
    for (const value of [base + guest, base + guest + 98, base + 98, base, base + guest, base]) {
      state = replay(settled(value, 800), state);
      assert.equal(state.stage, 'details');
    }
  });
}
test('boot heights and malformed payloads cannot establish baseline', () => {
  const state = replay([[0, ...height(26)], [1, ...height(2)], [2, 'calendly.page_height', {height:'nope'}]]);
  assert.equal(state.height, undefined);
  assert.equal(state.dateHeight, undefined);
  assert.equal(state.stage, 'date');
});
test('six-row month synthetic +48px, and shorter month, are still day', () => {
  let state = replay([...settled(602), ...settled(650, 200)]);
  assert.equal(state.stage, 'date');
  state = replay([...settled(939, 400), ...settled(650, 600)], state);
  assert.equal(state.stage, 'date');
  assert.equal(replay([...settled(650), ...settled(602, 200)]).stage, 'date');
});
test('details height can exceed or be below a time list height', () => {
  for (const time of [939, 1249]) {
    for (const base of [915, 989, 1249]) {
      let state = replay([...settled(602), ...settled(time, 200), [400, selected, {}], ...settled(base, 405)]);
      assert.equal(state.stage, 'details');
      state = replay([[700, viewed, {}], ...settled(time, 705)], state);
      assert.equal(state.stage, 'time');
    }
  }
});
test('fast back / forward cancels stale pending height decisions', () => {
  const state = replay([[700, viewed, {}], [704, ...height(767)], [730, selected, {}], [780, 'settle'], ...settled(915, 800)], details(915));
  assert.equal(state.stage, 'details');
  assert.equal(state.phase, 'details');
});
test('125ms debounce and 64..90px hysteresis do not flicker', () => {
  let state = replay([...settled(602), [200, ...height(939)], [300, 'settle']]);
  assert.equal(state.stage, 'date');
  state = replay([[325, 'settle'], ...settled(677, 400)], state);
  assert.equal(state.stage, 'time');
  state = replay(settled(602, 600), state);
  assert.equal(state.stage, 'date');
});
test('unknown details resize conservatively falls back to neutral time', () => {
  const state = replay(settled(1400, 700), details(915));
  assert.equal(state.stage, 'time');
  assert.equal(state.evidence, 'fallback');
});
test('a nearby known time height cannot masquerade as details font settlement', () => {
  const state = replay(settled(939, 700), details(915));
  assert.equal(state.stage, 'time');
  assert.equal(state.evidence, 'fallback');
});
test('late 20px details font settlement recalibrates guest/validation offsets', () => {
  let state = details(895);
  state = replay(settled(915, 700), state);
  assert.equal(state.detailsHeight, 915);
  state = replay(settled(1032, 900), state);
  assert.equal(state.stage, 'details');
});
test('viewed without a resize leaves details; later day height resets it', () => {
  let state = replay([[700, viewed, {}], [825, 'settle']], details(915));
  assert.equal(state.stage, 'time');
  state = replay(settled(602, 900), state);
  assert.equal(state.stage, 'date');
});
test('no messages means no timeout-driven stage reset', () => {
  const state = details(915);
  assert.deepEqual(reduceCalendlyStage(state, {event:'settle', at:900000}), state);
});
test('booking flag still requires both booking identifiers', () => {
  const state = details(915);
  assert.equal(reduceCalendlyStage(state, {event:'calendly.event_scheduled', at:700}).booked, false);
  const booked = reduceCalendlyStage(state, {event:'calendly.event_scheduled', at:700, payload:{event:{uri:'test-event'},invitee:{uri:'test-invitee'}}});
  assert.equal(booked.booked, true);
  assert.equal(booked.stage, 'details');
});
