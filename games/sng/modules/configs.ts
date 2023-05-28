// TODO: The sng config will be loaded from database.

const blindStructure = [
  // level 0 ~ 9
  { bigBlind: 0,        ante: 0,   duration: 2 }, // level 0 is dummy
  { bigBlind: 20,       ante: 0,   duration: 2 }, // duration is in minutes
  { bigBlind: 30,       ante: 0,   duration: 2 }, // smallBlind = bigBlind / 2
  { bigBlind: 50,       ante: 0,   duration: 2 }, // bigBlind MUST be divisible by 2
  { bigBlind: 100,      ante: 0,   duration: 2 },
  { bigBlind: 150,      ante: 0,   duration: 2 },
  { bigBlind: 200,      ante: 0,   duration: 2 },
  { bigBlind: 300,      ante: 0,   duration: 2 },
  { bigBlind: 400,      ante: 0,   duration: 2 },
  { bigBlind: 600,      ante: 0,   duration: 2 },

  // level 10 ~ 19
  { bigBlind: 800,      ante: 0,   duration: 2 },
  { bigBlind: 1000,     ante: 0,   duration: 2 },
  { bigBlind: 1200,     ante: 0,   duration: 2 },
  { bigBlind: 1600,     ante: 0,   duration: 2 },
  { bigBlind: 2000,     ante: 0,   duration: 2 },
  { bigBlind: 3000,     ante: 0,   duration: 2 },
  { bigBlind: 4000,     ante: 0,   duration: 2 },
  { bigBlind: 6000,     ante: 0,   duration: 2 },
  { bigBlind: 8000,     ante: 0,   duration: 2 },
  { bigBlind: 10000,    ante: 0,   duration: 2 },

  // level 20 ~ 29
  { bigBlind: 12000,    ante: 0,   duration: 2 },
  { bigBlind: 16000,    ante: 0,   duration: 2 },
  { bigBlind: 20000,    ante: 0,   duration: 2 },
  { bigBlind: 30000,    ante: 0,   duration: 2 },
  { bigBlind: 40000,    ante: 0,   duration: 2 },
  { bigBlind: 60000,    ante: 0,   duration: 2 },
  { bigBlind: 80000,    ante: 0,   duration: 2 },
  { bigBlind: 100000,   ante: 0,   duration: 2 },
  { bigBlind: 120000,   ante: 0,   duration: 2 },
  { bigBlind: 160000,   ante: 0,   duration: 2 },

  // level 30 ~ 39
  { bigBlind: 200000,   ante: 0,   duration: 2 },
  { bigBlind: 300000,   ante: 0,   duration: 2 },
  { bigBlind: 400000,   ante: 0,   duration: 2 },
  { bigBlind: 600000,   ante: 0,   duration: 2 },
  { bigBlind: 800000,   ante: 0,   duration: 2 },
  { bigBlind: 1000000,  ante: 0,   duration: 2 },
  { bigBlind: 1200000,  ante: 0,   duration: 2 },
  { bigBlind: 1600000,  ante: 0,   duration: 2 },
  { bigBlind: 2000000,  ante: 0,   duration: 2 },
  { bigBlind: 3000000,  ante: 0,   duration: 0 }, // duration 0 means no limit
];

export const configs = {
  blindStructure,
  numPlayers: 9,
  playerActionTime: 10000, // 10 seconds
  initChips: 3000,
}