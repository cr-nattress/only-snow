/**
 * Mapping from our resort slugs to Liftie API resort slugs.
 * Liftie (https://liftie.info) provides real-time lift status data.
 *
 * Only resorts with a known Liftie slug are included.
 * Resorts not in this map will be skipped during conditions refresh.
 */
export const RESORT_TO_LIFTIE: Record<string, string> = {
  // Colorado
  'vail': 'vail',
  'beaver-creek': 'beavercreek',
  'breckenridge': 'breck',
  'keystone': 'keystone',
  'copper-mountain': 'copper',
  'arapahoe-basin': 'abasin',
  'loveland': 'loveland',
  'winter-park': 'winter-park',
  'eldora': 'eldora',
  'steamboat': 'steamboat',
  'aspen-mountain': 'aspen-mountain',
  'aspen-highlands': 'aspen-highlands',
  'snowmass': 'snowmass',
  'telluride': 'telluride',
  'crested-butte': 'crested-butte',
  'monarch-mountain': 'monarch',

  // Utah
  'alta': 'alta',
  'snowbird': 'snowbird',
  'brighton': 'brighton',
  'solitude': 'solitude',
  'park-city': 'parkcity',
  'deer-valley': 'deer-valley',
  'snowbasin': 'snowbasin',
  'brian-head': 'brianhead',

  // New Mexico
  'taos-ski-valley': 'taos',
  'angel-fire': 'angel-fire',

  // Wyoming
  'jackson-hole': 'jackson-hole',
  'grand-targhee': 'grand-targhee',

  // Montana
  'big-sky': 'big-sky',
  'whitefish-mountain': 'whitefish',
  'bridger-bowl': 'bridger-bowl',
  'red-lodge-mountain': 'red-lodge-mountain',

  // California / Tahoe
  'palisades-tahoe': 'palisades',
  'northstar-california': 'northstar',
  'heavenly': 'heavenly',
  'kirkwood': 'kirkwood',
  'sierra-at-tahoe': 'sierra',
  'sugar-bowl': 'sugarbowl',
  'mammoth-mountain': 'mammoth-lakes',
  'boreal-mountain': 'boreal',
  'june-mountain': 'june-mountain',
  'mt-rose-ski-tahoe': 'mtrose',

  // Pacific Northwest
  'mt-bachelor': 'mtbachelor',
  'timberline-lodge': 'timberline-lodge',
  'crystal-mountain': 'crystal-mountain',
  'stevens-pass': 'stevens',
  'hoodoo': 'hoodoo',

  // Idaho
  'sun-valley': 'sunvalley',
  'schweitzer-mountain': 'schweitzer',
  'bogus-basin': 'bogusbasin',

  // Alaska
  'alyeska-resort': 'alyeska',

  // Vermont
  'killington': 'killington',
  'stowe': 'stowe',
  'sugarbush': 'sugarbush',
  'jay-peak': 'jay-peak',
  'mad-river-glen': 'mad-river-glen',
  'okemo': 'okemo',
  'mount-snow': 'mountsnow',
  'stratton': 'stratton',
  'bromley': 'bromley-mountain',
  'bolton-valley': 'bolton-valley',
  'smugglers-notch': 'smuggs',
  'pico-mountain': 'pico',
  'burke-mountain': 'burke-mountain',

  // New Hampshire
  'loon-mountain': 'loon',
  'cannon-mountain': 'cannon',
  'bretton-woods': 'brettonwoods',
  'wildcat-mountain': 'wildcat',
  'attitash': 'attitash',
  'waterville-valley': 'waterville',
  'cranmore-mountain': 'cranmore-mountain',
  'mount-sunapee': 'mount-sunapee',
  'ragged-mountain': 'ragged-mountain',
  'gunstock': 'gunstock',

  // New York
  'whiteface-mountain': 'whiteface',
  'gore-mountain': 'gore-mountain',
  'windham-mountain': 'windham',
  'hunter-mountain': 'hunter',

  // Maine
  'sunday-river': 'sunday-river',
  'sugarloaf': 'sugarloaf',
  'saddleback-mountain': 'saddleback',

  // Massachusetts
  'jiminy-peak': 'jiminypeak',
  'berkshire-east': 'berkshire-east',

  // Pennsylvania
  'camelback-mountain-resort': 'camelback',
  'blue-mountain-resort': 'blue-mountain-pa',
  'shawnee-mountain': 'shawnee-mountain',

  // West Virginia
  'snowshoe-mountain': 'snowshoe',
  'winterplace': 'winterplace',

  // Wisconsin
  'devils-head': 'devils-head',

  // Northwest
  '49-degrees-north': '49-degrees-north',
};
