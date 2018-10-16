S.log("INIT SLATE");

/**
 * NOTE: To see log output, start from CLI with;
 * /Applications/Slate.app/Contents/MacOS/Slate
 */

// Configs
S.cfga({
  "defaultToCurrentScreen": true,
  "secondsBetweenRepeat": 0.1,
  "checkDefaultsOnLoad": true,
  "focusCheckWidthMax": 3000,
  "orderScreensLeftToRight": true
});

// Monitors
var WORK_MON_LEFT = "0"; // work #1
var WORK_MON_RIGHT = "1"; // work #2

var WORK_MON_VERT = "1080x1920"; // work #2
var LAPTOP_MON = "1080x1920"; // work #2

//var WORK_MON = "1680x1050"; // home

var THIRD = 1 / 3;
var HALF = 1 / 2;
var MOST = 7.5 / 10;
var FULL = 1;

var LEFT = 0;
var RIGHT = 1;
var CENTER = 2;
var HCENTER = 3;
var TOP = 4;
var BOTTOM = 5;

var developerToolsRegex = /^Developer\sTools\s-\s.+$/

var savedWinObjs = {};

function repos(pos, size, screen) {
  var winWidth = "screenSizeX*" + size;
  var winHeight = "screenSizeY*" + size;

  var resizePosObj = {};

  switch (pos) {
    case LEFT:
      resizePosObj.x = "screenOriginX";
      resizePosObj.y = "screenOriginY";
      resizePosObj.width = winWidth;
      resizePosObj.height = "screenSizeY";
      break;
    case RIGHT:
      resizePosObj.x = "screenOriginX + screenSizeX -" + winWidth;
      resizePosObj.y = "screenOriginY";
      resizePosObj.width = winWidth;
      resizePosObj.height = "screenSizeY";
      break;
    case HCENTER:
      // HORIZONTAL CENTER
      resizePosObj.x = "screenOriginX + (screenSizeX/2) - " + "(" + winWidth + ")/2";
      resizePosObj.y = "screenOriginY";
      resizePosObj.width = winWidth;
      resizePosObj.height = "screenSizeY";
      break;
    case CENTER:
      resizePosObj.x = "screenOriginX";
      resizePosObj.y = "screenOriginY + (screenSizeY/2) - " + "(" + winHeight + ")/2";
      resizePosObj.width = "screenSizeX";
      resizePosObj.height = winHeight;
      break;
    case TOP:
      resizePosObj.x = "screenOriginX";
      resizePosObj.y = "screenOriginY";
      resizePosObj.width = "screenSizeX";
      resizePosObj.height = winHeight;
      break;
    case BOTTOM:
      resizePosObj.x = "screenOriginX";
      resizePosObj.y = "screenOriginY + screenSizeY -" + winHeight;
      resizePosObj.width = "screenSizeX";
      resizePosObj.height = winHeight;
      break;
      defaut:
      resizePosObj.x = pos;
      break;
  }

  if (screen) {
    resizePosObj.screen = screen;
  }

  return S.op("move", resizePosObj);
}

function reposWithUndo(currentWin, pos, size, screen) {

  var currentWinTitle = currentWin.title();

  var mySavedWinObj;
  if (savedWinObjs.hasOwnProperty(currentWinTitle)) {

    mySavedWinObj = savedWinObjs[currentWinTitle];

    S.op("move", mySavedWinObj).run();

    // remove this obj
    delete savedWinObjs[currentWinTitle];

  } else {

    savedWinObjs[currentWinTitle] = currentWin.rect();

    //S.log( JSON.stringify( savedWinObjs ) );

    repos(pos, size, screen).run();
  }
}

/**
* This will basically just flip the anchor point when resizing a window
* that hits the edge of the screen. ex. Window is on far right of screen,
* and we start trying to increase width, we'll resize from the topRight
* instead of topLeft.
*/
function plusMinusWidthAuto(currentWindow, size) {
  var winRect = currentWindow.rect();
  var screenRect = currentWindow.screen().visibleRect();

  var winTopLeftX = winRect.x;
  var winTopRightX = winRect.x + winRect.width;

  var screenTopLeftX = screenRect.x;
  var screenTopRightX = screenRect.x + screenRect.width;

  var doIncrease = size.charAt(0) !== '-';

  // handle veritical montiors as well
  if (screenRect.width > screenRect.height) {
    var anchor = 'top-left';
    if (winTopRightX >= screenTopRightX) {
      anchor = 'top-right';
    }
    S.op("resize", { "width": size, "height": "+0", "anchor": anchor }).run();
  } else {
    var anchor = 'top-left';
    if (doIncrease && winTopRightX >= screenTopRightX) {
      anchor = 'top-right';
    }
    S.op("resize", { "width": "+0", "height": size, "anchor": anchor }).run();

  }
}

var genBrowserHash = function (regex, monitor) {
  return {
    "operations": [function (windowObject) {
      var title = windowObject.title();
      if (title !== undefined && title.match(regex)) {
        windowObject.doOperation(repos(CENTER, THIRD, monitor));
      } else {
        windowObject.doOperation(repos(RIGHT, MOST, monitor));
      }
    }],
    "ignore-fail": true,
    "repeat": true
  };
}


var windowOperation = function (windowConfigs) {
  return {
    "operations": [function (windowObject) {
      S.log('test', windowObject.title());
      for (var i = 0; i < windowConfigs.length; i++) {
        if (windowConfigs[i].regex.test(windowObject.title())) {
          windowObject.doOperation(windowConfigs[i].fnc);
          break;
        }
      }

    }
    ],
    "ignore-fail": true,
    "repeat": true
  };
}


var threeMonitorLayout = S.lay("threeMonitor", {
  "IntelliJ IDEA": {
    "operations": [repos(TOP, FULL, WORK_MON_LEFT)],
    "ignore-fail": true,
    "repeat": true
  },
  "Code": {
    "operations": [repos(TOP, FULL, WORK_MON_LEFT)],
    "ignore-fail": true,
    "repeat": true
  },
  "Mail": {
    "operations": [repos(LEFT, FULL, LAPTOP_MON)],
    "ignore-fail": true,
    "repeat": true
  },
  "Microsoft Outlook": windowOperation([
    { regex: /^Calendar$/, fnc: repos(LEFT, FULL, LAPTOP_MON) },
    { regex: /.*/, fnc: repos(LEFT, FULL, LAPTOP_MON) }
  ]),
  "Spotify": {
    "operations": [repos(RIGHT, MOST, WORK_MON_RIGHT)],
    "ignore-fail": true,
    "repeat": true
  },
  "Google Chrome": {
    "operations": [repos(RIGHT, MOST, WORK_MON_LEFT)],
    "ignore-fail": true,
    "repeat": true
  },
  "Sublime Text": {
    "operations": [repos(LEFT, HALF, LAPTOP_MON)],
    "ignore-fail": true,
    "repeat": true
  },
  "HipChat": {
    "operations": [repos(RIGHT, HALF, LAPTOP_MON)],
    "ignore-fail": true,
    "repeat": true
  },
  "Slack": {
    "operations": [repos(RIGHT, HALF, LAPTOP_MON)],
    "ignore-fail": true,
    "repeat": true
  },
  "Charles": {
    "operations": [repos(RIGHT, THIRD, LAPTOP_MON)],
    "ignore-fail": true,
    "repeat": true
  },
  "iTerm2": {
    "operations": [repos(LEFT, HALF, LAPTOP_MON)],
    "ignore-fail": true,
    "repeat": true
  },
  "Sourcetree": {
    "operations": [repos(LEFT, HALF, WORK_MON_RIGHT)],
    "ignore-fail": true,
    "repeat": true
  },
  "Calendar": {
    "operations": [repos(CENTER, HALF, WORK_MON_LEFT)],
    "ignore-fail": true,
    "repeat": true
  }
});


var twoMonitorLayout = S.lay("twoMonitor", {
  "IntelliJ IDEA": {
    "operations": [repos(LEFT, MOST, WORK_MON_RIGHT)],
    "ignore-fail": true,
    "repeat": true
  },
  "Code": {
    "operations": [repos(LEFT, MOST, WORK_MON_RIGHT)],
    "ignore-fail": true,
    "repeat": true
  },
  "Mail": {
    "operations": [repos(LEFT, FULL, WORK_MON_RIGHT)],
    "ignore-fail": true,
    "repeat": true
  },
  "Microsoft Outlook": windowOperation([
    { regex: /^Calendar$/, fnc: repos(RIGHT, HALF, WORK_MON_LEFT) },
    { regex: /.*/, fnc: repos(LEFT, FULL, WORK_MON_RIGHT) }
  ]),
  "Spotify": {
    "operations": [repos(LEFT, HALF, WORK_MON_LEFT)],
    "ignore-fail": true,
    "repeat": true
  },
  "Calendar": {
    "operations": [repos(RIGHT, HALF, WORK_MON_LEFT)],
    "ignore-fail": true,
    "repeat": true
  },
  "Google Chrome": genBrowserHash(developerToolsRegex, WORK_MON_LEFT),
  "Sublime Text": {
    "operations": [repos(LEFT, HALF, WORK_MON_RIGHT)],
    "ignore-fail": true,
    "repeat": true
  },
  "HipChat": {
    "operations": [repos(RIGHT, HALF, WORK_MON_RIGHT)],
    "ignore-fail": true,
    "repeat": true
  },
  "Slack": {
    "operations": [repos(RIGHT, HALF, WORK_MON_RIGHT)],
    "ignore-fail": true,
    "repeat": true
  },
  "Charles": {
    "operations": [repos(RIGHT, THIRD, WORK_MON_LEFT)],
    "ignore-fail": true,
    "repeat": true
  },
  "iTerm2": {
    "operations": [repos(LEFT, HALF, WORK_MON_RIGHT)],
    "ignore-fail": true,
    "repeat": true
  },
  "Sourcetree": {
    "operations": [repos(LEFT, HALF, WORK_MON_LEFT)],
    "ignore-fail": true,
    "repeat": true
  },
  "Notes": {
    "operations": [repos(LEFT, HALF, WORK_MON_RIGHT)],
    "ignore-fail": true,
    "repeat": true
  },
});


var oneMonitorLayout = S.lay("oneMonitor", {
  "IntelliJ IDEA": {
    "operations": [repos(LEFT, MOST, LAPTOP_MON)],
    "ignore-fail": true,
    "repeat": true
  },
  "Mail": {
    "operations": [repos(LEFT, FULL, LAPTOP_MON)],
    "ignore-fail": true,
    "repeat": true
  },
  "Spotify": {
    "operations": [repos(LEFT, HALF, LAPTOP_MON)],
    "ignore-fail": true,
    "repeat": true
  },
  "Calendar": {
    "operations": [repos(RIGHT, HALF, LAPTOP_MON)],
    "ignore-fail": true,
    "repeat": true
  },
  "Google Chrome": genBrowserHash(developerToolsRegex, LAPTOP_MON),
  // "Google Chrome" : {
  //   "operations" : [repos(RIGHT, MOST, LAPTOP_MON)],
  //   "ignore-fail" : true,
  //   "repeat" : true
  // },
  "Sublime Text": {
    "operations": [repos(LEFT, HALF, LAPTOP_MON)],
    "ignore-fail": true,
    "repeat": true
  },
  "HipChat": {
    "operations": [repos(RIGHT, HALF, LAPTOP_MON)],
    "ignore-fail": true,
    "repeat": true
  },
  "Charles": {
    "operations": [repos(RIGHT, THIRD, LAPTOP_MON)],
    "ignore-fail": true,
    "repeat": true
  },
  "iTerm2": {
    "operations": [repos(LEFT, HALF, LAPTOP_MON)],
    "ignore-fail": true,
    "repeat": true
  },
  "Sourcetree": {
    "operations": [repos(LEFT, HALF, LAPTOP_MON)],
    "ignore-fail": true,
    "repeat": true
  },
});

// Defaults
S.default(3, threeMonitorLayout);
S.default(2, twoMonitorLayout);
S.default(1, oneMonitorLayout);

// ------ EVENTS -----
S.on("windowOpened", function (event, win) {

  var title = win.title();

  // charles "map to" windows are too small, make them bigger when opened
  if (win.app().name() === "Charles" && title.indexOf("Map") > -1) {
    win.doOperation(repos(RIGHT, MOST));
  }

  // developer tools
  else if (title.match(developerToolsRegex)) {
    win.doOperation(repos(RIGHT, HALF));
  }

});


// ----- BINDING -----
S.bnda({

  // Window Hints
  "pad*:alt;cmd": S.op("hint"),

  "right:ctrl;alt;cmd": S.op("throw", { "screen": "right" }),
  "left:ctrl;alt;cmd": S.op("throw", { "screen": "left" }),

  // Grid
  "esc:ctrl": S.op("grid", {
    "grids": {
      "1920x1080": { "width": 6, "height": 2 },
      "1080x1920": { "width": 2, "height": 2 },
      "1440x900": { "width": 6, "height": 2 },
      "1680x1050": { "width": 6, "height": 2 }
    },
    "padding": 5
  }),

  "tab:cmd;ctrl": S.op("switch")

});

// this has to be separate bind call or it caches the operation
slate.bind("pad0:alt;cmd", function (windowObject) {
  reposWithUndo(windowObject, LEFT, FULL);
});

slate.bind("pad+:alt;cmd", function (windowObject) {
  plusMinusWidthAuto(windowObject, "+10%");
});
slate.bind("pad-:alt;cmd", function (windowObject) {
  plusMinusWidthAuto(windowObject, "-10%");
});


slate.bind("pad1:alt;cmd", function (windowObject) {
  var s = windowObject.screen().rect();
  if (s.width > s.height) {
    repos(LEFT, THIRD).run();
  } else {
    repos(BOTTOM, THIRD).run();
  }
});

slate.bind("pad2:alt;cmd", function (windowObject) {
  var s = windowObject.screen().rect();
  if (s.width > s.height) {
    repos(HCENTER, THIRD).run();
  } else {
    repos(BOTTOM, HALF).run();
  }
});

slate.bind("pad3:alt;cmd", function (windowObject) {
  var s = windowObject.screen().rect();
  if (s.width > s.height) {
    repos(RIGHT, THIRD).run();
  } else {
    repos(BOTTOM, MOST).run();
  }
});

slate.bind("pad4:alt;cmd", function (windowObject) {
  var s = windowObject.screen().rect();
  if (s.width > s.height) {
    repos(LEFT, HALF).run();
  } else {
    repos(CENTER, THIRD).run();
  }
});

slate.bind("pad5:alt;cmd", function (windowObject) {
  var s = windowObject.screen().rect();
  if (s.width > s.height) {
    repos(HCENTER, HALF).run();
  } else {
    repos(CENTER, HALF).run();
  }
});

slate.bind("pad6:alt;cmd", function (windowObject) {
  var s = windowObject.screen().rect();
  if (s.width > s.height) {
    repos(RIGHT, HALF).run();
  } else {
    repos(CENTER, MOST).run();
  }
});

slate.bind("pad7:alt;cmd", function (windowObject) {
  var s = windowObject.screen().rect();
  if (s.width > s.height) {
    repos(LEFT, MOST).run();
  } else {
    repos(TOP, THIRD).run();
  }
});

slate.bind("pad8:alt;cmd", function (windowObject) {
  var s = windowObject.screen().rect();
  if (s.width > s.height) {
    repos(HCENTER, MOST).run();
  } else {
    repos(TOP, HALF).run();
  }
});

slate.bind("pad9:alt;cmd", function (windowObject) {
  var s = windowObject.screen().rect();
  if (s.width > s.height) {
    repos(RIGHT, MOST).run();
  } else {
    repos(TOP, MOST).run();
  }
});

/*
slate.bind("pad1:alt;cmd", function(windowObject) {
  reposWithUndo( windowObject, LEFT, MOST );
});

slate.bind("pad2:alt;cmd", function(windowObject) {
  reposWithUndo( windowObject, CENTER, MOST );
});

slate.bind("pad3:alt;cmd", function(windowObject) {
  reposWithUndo( windowObject, RIGHT, MOST );
});
*/


var focusRight = slate.operation("focus", { "direction": "right" });
var pushRight = slate.operation("push", { "direction": "right" });
var pushLeft = slate.operation("push", { "direction": "left" });
var sequence = slate.operation("sequence", {
  "operations": [
    [function (windowObject) { windowObject.doOperation(focusRight); }, pushLeft],
    [pushRight]
  ]
});
slate.bind("pad*:alt;cmd", sequence);


// Log that we're done configuring
S.log("[SLATE] -------------- Finished Loading Config --------------");
