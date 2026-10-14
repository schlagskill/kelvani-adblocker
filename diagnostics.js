import {isExcluded} from './core.js';
export function diagnosticReport(settings, host, version, time=new Date()) {
  return {
    version, createdAt:time.toISOString(), host,
    protection:settings.enabled,
    excluded:host?isExcluded(host,settings.exceptions):false,
    cosmetic:settings.cosmetic, tracking:settings.tracking,
    youtube:settings.youtube, customRuleCount:settings.blocked.length,
  };
}
