// NEXT_PUBLIC_* vars are inlined at build time. Vercel preview deploys
// don't always have them set, so we hard-code public fallbacks (these
// URLs are already exposed in the client bundle — not secrets).
const SUPABASE_FN = 'https://rcfaashkfpurkvtmsmeb.supabase.co/functions/v1';

// Kill-switch for the public-facing Lauren chat. Set
// NEXT_PUBLIC_LAUREN_DISABLED=true in Vercel env (Production +/or Preview)
// to short-circuit the chat widget — it renders a static "offline" message
// instead of mounting. See RUNBOOK.md for the faster instant-kill paths
// (Supabase dashboard pauses the Edge Function in 1 click, no redeploy).
const LAUREN_DISABLED_RAW = (process.env.NEXT_PUBLIC_LAUREN_DISABLED || '').toLowerCase().trim();

export const CONFIG = {
  LAUREN_URL:      process.env.NEXT_PUBLIC_LAUREN_URL      || `${SUPABASE_FN}/lauren-chat`,
  SUBMIT_LEAD_URL: process.env.NEXT_PUBLIC_SUBMIT_LEAD_URL || `${SUPABASE_FN}/submit-lead`,
  GET_CASE_URL:    process.env.NEXT_PUBLIC_GET_CASE_URL    || `${SUPABASE_FN}/get-case`,
  LAUREN_DISABLED: LAUREN_DISABLED_RAW === 'true' || LAUREN_DISABLED_RAW === '1' || LAUREN_DISABLED_RAW === 'yes',
  LAUREN_DISABLED_MESSAGE:
    "Lauren is temporarily offline. Please email hello@refundlocators.com or call (513) 516-2306 — we'll respond within one business day.",
  NATHAN_PHONE: '+15135162306',
  NATHAN_PHONE_DISPLAY: '(513) 516-2306',
};

export const OHIO_COUNTIES = [
  'Adams','Allen','Ashland','Ashtabula','Athens','Auglaize','Belmont','Brown','Butler',
  'Carroll','Champaign','Clark','Clermont','Clinton','Columbiana','Coshocton','Crawford',
  'Cuyahoga','Darke','Defiance','Delaware','Erie','Fairfield','Fayette','Franklin','Fulton',
  'Gallia','Geauga','Greene','Guernsey','Hamilton','Hancock','Hardin','Harrison','Henry',
  'Highland','Hocking','Holmes','Huron','Jackson','Jefferson','Knox','Lake','Lawrence',
  'Licking','Logan','Lorain','Lucas','Madison','Mahoning','Marion','Medina','Meigs','Mercer',
  'Miami','Monroe','Montgomery','Morgan','Morrow','Muskingum','Noble','Ottawa','Paulding',
  'Perry','Pickaway','Pike','Portage','Preble','Putnam','Richland','Ross','Sandusky','Scioto',
  'Seneca','Shelby','Stark','Summit','Trumbull','Tuscarawas','Union','Van Wert','Vinton',
  'Warren','Washington','Wayne','Williams','Wood','Wyandot',
];
