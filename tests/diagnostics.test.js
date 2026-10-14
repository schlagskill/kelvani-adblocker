import test from 'node:test';import assert from 'node:assert/strict';
import {diagnosticReport} from '../diagnostics.js';import {defaults} from '../core.js';
test('diagnostic report describes current protection without exporting exception lists or page paths',()=>{
 const report=diagnosticReport({...defaults,exceptions:['example.com','private.example'],blocked:['secret.example']},'www.example.com','0.4.1',new Date('2026-10-14'));
 assert.equal(report.excluded,true);assert.equal(report.customRuleCount,1);
 assert.equal(JSON.stringify(report).includes('private.example'),false);assert.equal(JSON.stringify(report).includes('secret.example'),false);
 assert.equal(report.createdAt,'2026-10-14T00:00:00.000Z');
});
