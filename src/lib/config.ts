// NEXT_PUBLIC_* vars are inlined at build time. Vercel preview deploys
// don't always have them set, so we hard-code public fallbacks (these
// URLs are already exposed in the client bundle — not secrets).
const SUPABASE_FN = 'https://rcfaashkfpurkvtmsmeb.supabase.co/functions/v1';

export const CONFIG = {
  LAUREN_URL:      process.env.NEXT_PUBLIC_LAUREN_URL      || `${SUPABASE_FN}/lauren-chat`,
  SUBMIT_LEAD_URL: process.env.NEXT_PUBLIC_SUBMIT_LEAD_URL || `${SUPABASE_FN}/submit-lead`,
  GET_CASE_URL:    process.env.NEXT_PUBLIC_GET_CASE_URL    || `${SUPABASE_FN}/get-case`,
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
