import assert from 'node:assert/strict';
import {test} from 'node:test';
import {analyticsEvents,cleanAnalyticsEvent,privacyAllowsAnalytics} from './analyticsEvents.ts';
test('GPC and every supported DNT spelling block analytics',()=>{
  assert.equal(privacyAllowsAnalytics({globalPrivacyControl:true}),false);
  for(const doNotTrack of ['1','yes','YES'])assert.equal(privacyAllowsAnalytics({doNotTrack}),false);
  assert.equal(privacyAllowsAnalytics({},'1'),false);
  assert.equal(privacyAllowsAnalytics({msDoNotTrack:'1'}),false);
  for(const doNotTrack of ['0','unspecified',null,undefined])assert.equal(privacyAllowsAnalytics({doNotTrack}),true);
});
test('booking conversion maps to GA generate_lead and Meta Schedule',()=>{
  assert.deepEqual(analyticsEvents.booking_complete,{ga:'generate_lead',meta:'Schedule',standard:true});
});
test('identity, arbitrary strings, booking URLs and query data never enter params',()=>{
  const privateData={name:'Private',email:'private@example.test',phone:'+15555555555',eventUri:'https://api.calendly.com/private',page_location:'https://example.test/?email=private@example.test'};
  assert.deepEqual(cleanAnalyticsEvent('booking_complete',privateData),{name:'booking_complete',params:{}});
  assert.deepEqual(cleanAnalyticsEvent('page_view',{...privateData,page_path:'/?email=private@example.test'}),{name:'page_view',params:{page_path:'/404'}});
  assert.equal(cleanAnalyticsEvent('cta_click',{location:'private@example.test'}),null);
  assert.equal(cleanAnalyticsEvent('calendly_stage',{stage:'private'}),null);
  assert.equal(cleanAnalyticsEvent('unknown',{}),null);
});
test('only approved enum and numeric interaction params are accepted',()=>{
  assert.deepEqual(cleanAnalyticsEvent('cta_click',{location:'conditions',email:'private'}),{name:'cta_click',params:{location:'conditions'}});
  assert.deepEqual(cleanAnalyticsEvent('calendly_stage',{stage:'details'}),{name:'calendly_stage',params:{stage:'details'}});
  assert.deepEqual(cleanAnalyticsEvent('faq_toggle',{index:0}),{name:'faq_toggle',params:{index:0}});
  for(const index of [-1,101,'1',NaN])assert.equal(cleanAnalyticsEvent('faq_toggle',{index}),null);
});

test('confirmation interactions accept only anonymous enums and bounded counts',()=>{
  assert.deepEqual(cleanAnalyticsEvent('confirmed_checklist',{item:'invite',completed_count:2,email:'private@example.test'}),{name:'confirmed_checklist',params:{item:'invite',completed_count:2}});
  assert.deepEqual(cleanAnalyticsEvent('confirmed_video',{action:'play',email:'private@example.test'}),{name:'confirmed_video',params:{action:'play'}});
  assert.deepEqual(cleanAnalyticsEvent('confirmed_video',{action:'complete'}),{name:'confirmed_video',params:{action:'complete'}});
  for(const item of ['private@example.test','unknown',null])assert.equal(cleanAnalyticsEvent('confirmed_checklist',{item,completed_count:1}),null);
  for(const completed_count of [-1,4,'2',NaN])assert.equal(cleanAnalyticsEvent('confirmed_checklist',{item:'calendar',completed_count}),null);
  assert.equal(cleanAnalyticsEvent('confirmed_video',{action:'private@example.test'}),null);
});
