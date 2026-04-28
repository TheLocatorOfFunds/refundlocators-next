/**
 * County metadata — county seat + clerk-of-courts URL where the actual
 * surplus funds sit. Used by /ohio/[county] landing pages so each one
 * has unique content (good for SEO) and a real local reference for the
 * homeowner.
 *
 * Clerk URLs are best-effort — if a county hasn't been verified, the
 * page falls back to a Google search link for "{County} County Ohio
 * Clerk of Courts."
 */

export interface CountyMeta {
  name: string;          // "Hamilton"
  slug: string;          // "hamilton"
  seat: string;          // "Cincinnati"
  clerkUrl?: string;     // verified clerk-of-courts URL when known
}

const RAW: Array<[string, string, string?]> = [
  ['Adams',      'West Union'],
  ['Allen',      'Lima'],
  ['Ashland',    'Ashland'],
  ['Ashtabula',  'Jefferson'],
  ['Athens',     'Athens'],
  ['Auglaize',   'Wapakoneta'],
  ['Belmont',    'St. Clairsville'],
  ['Brown',      'Georgetown'],
  ['Butler',     'Hamilton',     'https://www.butlercountyclerk.org/'],
  ['Carroll',    'Carrollton'],
  ['Champaign',  'Urbana'],
  ['Clark',      'Springfield'],
  ['Clermont',   'Batavia',      'https://www.clermontclerk.org/'],
  ['Clinton',    'Wilmington'],
  ['Columbiana', 'Lisbon'],
  ['Coshocton',  'Coshocton'],
  ['Crawford',   'Bucyrus'],
  ['Cuyahoga',   'Cleveland',    'https://cpdocket.cp.cuyahogacounty.gov/'],
  ['Darke',      'Greenville'],
  ['Defiance',   'Defiance'],
  ['Delaware',   'Delaware'],
  ['Erie',       'Sandusky'],
  ['Fairfield',  'Lancaster'],
  ['Fayette',    'Washington Court House'],
  ['Franklin',   'Columbus',     'https://fcdcfcjs.co.franklin.oh.us/'],
  ['Fulton',     'Wauseon'],
  ['Gallia',     'Gallipolis'],
  ['Geauga',     'Chardon'],
  ['Greene',     'Xenia'],
  ['Guernsey',   'Cambridge'],
  ['Hamilton',   'Cincinnati',   'https://www.courtclerk.org/'],
  ['Hancock',    'Findlay'],
  ['Hardin',     'Kenton'],
  ['Harrison',   'Cadiz'],
  ['Henry',      'Napoleon'],
  ['Highland',   'Hillsboro'],
  ['Hocking',    'Logan'],
  ['Holmes',     'Millersburg'],
  ['Huron',      'Norwalk'],
  ['Jackson',    'Jackson'],
  ['Jefferson',  'Steubenville'],
  ['Knox',       'Mount Vernon'],
  ['Lake',       'Painesville'],
  ['Lawrence',   'Ironton'],
  ['Licking',    'Newark'],
  ['Logan',      'Bellefontaine'],
  ['Lorain',     'Elyria'],
  ['Lucas',      'Toledo',       'https://www.co.lucas.oh.us/85/Common-Pleas-Court'],
  ['Madison',    'London'],
  ['Mahoning',   'Youngstown'],
  ['Marion',     'Marion'],
  ['Medina',     'Medina'],
  ['Meigs',      'Pomeroy'],
  ['Mercer',     'Celina'],
  ['Miami',      'Troy'],
  ['Monroe',     'Woodsfield'],
  ['Montgomery', 'Dayton',       'https://www.clerk.co.montgomery.oh.us/'],
  ['Morgan',     'McConnelsville'],
  ['Morrow',     'Mount Gilead'],
  ['Muskingum',  'Zanesville'],
  ['Noble',      'Caldwell'],
  ['Ottawa',     'Port Clinton'],
  ['Paulding',   'Paulding'],
  ['Perry',      'New Lexington'],
  ['Pickaway',   'Circleville'],
  ['Pike',       'Waverly'],
  ['Portage',    'Ravenna'],
  ['Preble',     'Eaton'],
  ['Putnam',     'Ottawa'],
  ['Richland',   'Mansfield'],
  ['Ross',       'Chillicothe'],
  ['Sandusky',   'Fremont'],
  ['Scioto',     'Portsmouth'],
  ['Seneca',     'Tiffin'],
  ['Shelby',     'Sidney'],
  ['Stark',      'Canton'],
  ['Summit',     'Akron',        'https://clerkweb.summitoh.net/'],
  ['Trumbull',   'Warren'],
  ['Tuscarawas', 'New Philadelphia'],
  ['Union',      'Marysville'],
  ['Van Wert',   'Van Wert'],
  ['Vinton',     'McArthur'],
  ['Warren',     'Lebanon',      'https://www.co.warren.oh.us/clerkofcourts/'],
  ['Washington', 'Marietta'],
  ['Wayne',      'Wooster'],
  ['Williams',   'Bryan'],
  ['Wood',       'Bowling Green'],
  ['Wyandot',    'Upper Sandusky'],
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const COUNTIES: CountyMeta[] = RAW.map(([name, seat, clerkUrl]) => ({
  name,
  slug: slugify(name),
  seat,
  clerkUrl,
}));

export function findCounty(slug: string): CountyMeta | undefined {
  return COUNTIES.find(c => c.slug === slug);
}

export function clerkSearchUrl(c: CountyMeta): string {
  return c.clerkUrl
    || `https://www.google.com/search?q=${encodeURIComponent(c.name + ' County Ohio Clerk of Courts')}`;
}
