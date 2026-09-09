(function (root) {
  "use strict";

  // Original offline vector demonstrations. Coordinates use a 160 × 126 stage.
  // Darker limbs are farther from the viewer; arrows indicate the movement.
  const C = {
    body: "#c6f36a",
    far: "#71865b",
    head: "#e4ebdb",
    floor: "#3d4739",
    ink: "#182016",
    muted: "#a2af96",
  };
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const path = (points, color = C.body, width = 6, extra = "") =>
    `<polyline points="${points.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const circle = (x, y, r, color) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="none"/>`;
  const text = (x, y, label, size = 11, color = C.muted, anchor = "middle") =>
    `<text x="${x}" y="${y}" fill="${color}" stroke="none" font-family="Arial,sans-serif" font-size="${size}" font-weight="600" text-anchor="${anchor}">${escape(label)}</text>`;
  const floor = () =>
    path(
      [
        [9, 114],
        [153, 114],
      ],
      C.floor,
      1.5,
    );
  function arrow(x1, y1, x2, y2) {
    const a = Math.atan2(y2 - y1, x2 - x1),
      n = 5;
    return (
      path(
        [
          [x1, y1],
          [x2, y2],
        ],
        C.muted,
        1.8,
      ) +
      path(
        [
          [x2 - n * Math.cos(a - 0.65), y2 - n * Math.sin(a - 0.65)],
          [x2, y2],
          [x2 - n * Math.cos(a + 0.65), y2 - n * Math.sin(a + 0.65)],
        ],
        C.muted,
        1.8,
      )
    );
  }
  function person({ head, body, arm, leg, farArm, farLeg }) {
    return (
      (farLeg ? path(farLeg, C.far, 6) : "") +
      (farArm ? path(farArm, C.far, 6) : "") +
      path([head, body[0]], C.body, 6) +
      path(body, C.body, 9) +
      (leg ? path(leg, C.body, 6.5) : "") +
      (arm ? path(arm, C.body, 6) : "") +
      circle(head[0], head[1], 8, C.head)
    );
  }
  const chair = () =>
    path(
      [
        [95, 111],
        [95, 58],
        [145, 58],
        [145, 22],
      ],
      C.muted,
      4,
    ) +
    path(
      [
        [145, 58],
        [145, 111],
      ],
      C.muted,
      4,
    );
  const wall = (x = 132) =>
    `<rect x="${x}" y="5" width="9" height="109" rx="2" fill="${C.floor}" stroke="none"/>`;
  const bag = (x, y) =>
    `<rect x="${x}" y="${y}" width="24" height="26" rx="5" fill="${C.ink}" stroke="${C.muted}" stroke-width="2.5"/><path d="M${x + 6} ${y} v-4 a6 6 0 0 1 12 0 v4 M${x + 5} ${y + 11} h14 v10 h-14 z" fill="none" stroke="${C.muted}" stroke-width="2" stroke-linejoin="round"/>`;
  function upright(armsUp = false, jump = false) {
    const lift = jump ? 10 : 0,
      sh = 34 - lift,
      hip = 70 - lift;
    return person({
      head: [79, 19 - lift],
      body: [
        [79, sh],
        [80, hip],
      ],
      farArm: armsUp
        ? [
            [79, sh],
            [103, 18],
            [104, 5],
          ]
        : [
            [79, sh],
            [91, 56 - lift],
            [91, 76 - lift],
          ],
      arm: armsUp
        ? [
            [79, sh],
            [58, 18],
            [58, 5],
          ]
        : [
            [79, sh],
            [66, 56 - lift],
            [66, 77 - lift],
          ],
      farLeg: [
        [80, hip],
        [89, 90 - lift],
        [89, 110 - lift],
        [101, 110 - lift],
      ],
      leg: [
        [80, hip],
        [75, 90 - lift],
        [73, 110 - lift],
        [59, 110 - lift],
      ],
    });
  }
  function highPlank() {
    return person({
      head: [28, 43],
      body: [
        [43, 54],
        [95, 83],
      ],
      farArm: [
        [47, 56],
        [50, 81],
        [50, 110],
        [59, 110],
      ],
      arm: [
        [43, 54],
        [40, 81],
        [39, 110],
        [29, 110],
      ],
      farLeg: [
        [95, 83],
        [119, 96],
        [140, 110],
        [148, 110],
      ],
      leg: [
        [95, 83],
        [117, 96],
        [137, 110],
        [146, 110],
      ],
    });
  }
  function lowPushup() {
    return person({
      head: [26, 80],
      body: [
        [41, 87],
        [93, 98],
      ],
      farArm: [
        [46, 88],
        [66, 97],
        [51, 110],
        [59, 110],
      ],
      arm: [
        [41, 87],
        [60, 96],
        [40, 110],
        [30, 110],
      ],
      farLeg: [
        [93, 98],
        [121, 104],
        [145, 110],
        [151, 110],
      ],
      leg: [
        [93, 98],
        [118, 104],
        [139, 110],
        [148, 110],
      ],
    });
  }
  function pike(lower = false) {
    return person({
      head: lower ? [29, 99] : [37, 81],
      body: lower
        ? [
            [44, 89],
            [89, 32],
          ]
        : [
            [49, 72],
            [89, 32],
          ],
      farArm: lower
        ? [
            [48, 87],
            [67, 100],
            [49, 110],
            [58, 110],
          ]
        : [
            [54, 68],
            [54, 91],
            [48, 110],
            [58, 110],
          ],
      arm: lower
        ? [
            [44, 89],
            [59, 99],
            [40, 110],
            [30, 110],
          ]
        : [
            [49, 72],
            [44, 92],
            [40, 110],
            [30, 110],
          ],
      farLeg: [
        [89, 32],
        [119, 71],
        [143, 110],
        [151, 110],
      ],
      leg: [
        [89, 32],
        [113, 72],
        [137, 110],
        [146, 110],
      ],
    });
  }
  function dip(lower = false) {
    const head = lower ? [74, 41] : [76, 22],
      shoulder = lower ? [76, 57] : [78, 38],
      hip = lower ? [64, 87] : [68, 68];
    return (
      chair() +
      person({
        head,
        body: [shoulder, hip],
        farArm: [shoulder, lower ? [101, 78] : [94, 45], [105, 58]],
        arm: [shoulder, lower ? [94, 77] : [87, 47], [96, 58]],
        farLeg: [hip, lower ? [47, 84] : [50, 74], [42, 110], [28, 110]],
        leg: [hip, lower ? [39, 85] : [43, 74], [34, 110], [21, 110]],
      })
    );
  }
  function crunch(lift = false) {
    return person({
      head: lift ? [41, 79] : [29, 100],
      body: lift
        ? [
            [57, 85],
            [72, 103],
            [92, 109],
          ]
        : [
            [46, 105],
            [92, 109],
          ],
      farArm: lift
        ? [
            [57, 85],
            [66, 67],
            [44, 75],
          ]
        : [
            [46, 105],
            [55, 83],
            [30, 93],
          ],
      arm: lift
        ? [
            [57, 85],
            [52, 65],
            [33, 77],
          ]
        : [
            [46, 105],
            [43, 81],
            [21, 95],
          ],
      farLeg: [
        [92, 109],
        [117, 73],
        [141, 110],
        [151, 110],
      ],
      leg: [
        [92, 109],
        [109, 75],
        [132, 110],
        [143, 110],
      ],
    });
  }
  function legRaise(up = false) {
    return person({
      head: [28, 101],
      body: [
        [44, 107],
        [85, 110],
      ],
      farArm: [
        [44, 107],
        [64, 111],
        [81, 111],
      ],
      arm: [
        [44, 107],
        [59, 113],
        [79, 113],
      ],
      farLeg: up
        ? [
            [85, 110],
            [102, 72],
            [108, 32],
            [115, 30],
          ]
        : [
            [85, 110],
            [116, 104],
            [146, 101],
            [151, 98],
          ],
      leg: up
        ? [
            [85, 110],
            [94, 72],
            [100, 31],
            [109, 30],
          ]
        : [
            [85, 110],
            [115, 107],
            [144, 104],
            [152, 101],
          ],
    });
  }
  function forearmPlank() {
    return person({
      head: [32, 58],
      body: [
        [47, 71],
        [97, 91],
      ],
      farArm: [
        [52, 72],
        [55, 110],
        [32, 110],
      ],
      arm: [
        [47, 71],
        [47, 110],
        [22, 110],
      ],
      farLeg: [
        [97, 91],
        [121, 101],
        [146, 111],
        [153, 111],
      ],
      leg: [
        [97, 91],
        [117, 101],
        [139, 111],
        [148, 111],
      ],
    });
  }
  function squat(lower = false) {
    return person({
      head: lower ? [50, 33] : [74, 16],
      body: lower
        ? [
            [62, 47],
            [91, 77],
          ]
        : [
            [78, 31],
            [84, 69],
          ],
      farArm: lower
        ? [
            [66, 48],
            [47, 49],
            [26, 44],
          ]
        : [
            [82, 32],
            [61, 44],
            [38, 44],
          ],
      arm: lower
        ? [
            [62, 47],
            [42, 49],
            [20, 43],
          ]
        : [
            [78, 31],
            [57, 41],
            [34, 41],
          ],
      farLeg: lower
        ? [
            [91, 77],
            [59, 80],
            [68, 111],
            [51, 111],
          ]
        : [
            [84, 69],
            [90, 90],
            [89, 110],
            [73, 110],
          ],
      leg: lower
        ? [
            [91, 77],
            [51, 81],
            [59, 111],
            [41, 111],
          ]
        : [
            [84, 69],
            [81, 91],
            [80, 110],
            [63, 110],
          ],
    });
  }
  function lunge() {
    return person({
      head: [77, 16],
      body: [
        [79, 32],
        [82, 67],
      ],
      farArm: [
        [79, 32],
        [94, 49],
        [88, 63],
      ],
      arm: [
        [79, 32],
        [63, 49],
        [69, 64],
      ],
      farLeg: [
        [82, 67],
        [115, 105],
        [138, 100],
        [145, 110],
      ],
      leg: [
        [82, 67],
        [43, 72],
        [43, 110],
        [25, 110],
      ],
    });
  }
  function bridge(lift = false) {
    return person({
      head: [28, 101],
      body: lift
        ? [
            [44, 107],
            [85, 77],
          ]
        : [
            [44, 107],
            [85, 110],
          ],
      farArm: [
        [44, 107],
        [65, 111],
        [85, 111],
      ],
      arm: [
        [44, 107],
        [61, 113],
        [81, 113],
      ],
      farLeg: [lift ? [85, 77] : [85, 110], [118, 78], [141, 110], [151, 110]],
      leg: [lift ? [85, 77] : [85, 110], [109, 77], [131, 110], [143, 110]],
    });
  }
  function wallSit() {
    return (
      wall(127) +
      person({
        head: [115, 19],
        body: [
          [116, 35],
          [116, 75],
        ],
        farArm: [
          [116, 35],
          [113, 59],
          [91, 74],
        ],
        arm: [
          [116, 35],
          [100, 58],
          [78, 70],
        ],
        farLeg: [
          [116, 75],
          [82, 75],
          [82, 111],
          [63, 111],
        ],
        leg: [
          [116, 75],
          [73, 75],
          [73, 111],
          [53, 111],
        ],
      })
    );
  }
  function climber(drive = false) {
    if (!drive) return highPlank();
    return (
      person({
        head: [28, 43],
        body: [
          [43, 54],
          [98, 80],
        ],
        farArm: [
          [47, 56],
          [50, 81],
          [50, 110],
          [59, 110],
        ],
        arm: [
          [43, 54],
          [40, 81],
          [39, 110],
          [29, 110],
        ],
        farLeg: [
          [98, 80],
          [121, 96],
          [140, 110],
          [149, 110],
        ],
        leg: [
          [98, 80],
          [65, 80],
          [82, 99],
          [91, 102],
        ],
      }) + arrow(82, 69, 60, 67)
    );
  }
  function sidePlank() {
    return person({
      head: [40, 50],
      body: [
        [47, 66],
        [96, 87],
      ],
      farLeg: [
        [96, 87],
        [121, 98],
        [147, 110],
        [154, 110],
      ],
      leg: [
        [96, 87],
        [119, 100],
        [143, 112],
        [152, 112],
      ],
      farArm: [
        [47, 66],
        [74, 57],
        [95, 86],
      ],
      arm: [
        [47, 66],
        [47, 110],
        [22, 110],
      ],
    });
  }
  function row(lift = false) {
    return (
      (lift ? bag(67, 68) : bag(42, 83)) +
      person({
        head: [51, 27],
        body: [
          [64, 41],
          [96, 72],
        ],
        farLeg: [
          [96, 72],
          [115, 89],
          [108, 110],
          [93, 110],
        ],
        leg: [
          [96, 72],
          [104, 89],
          [96, 110],
          [79, 110],
        ],
        farArm: lift
          ? [
              [67, 43],
              [98, 50],
              [81, 66],
            ]
          : [
              [67, 43],
              [64, 65],
              [59, 81],
            ],
        arm: lift
          ? [
              [64, 41],
              [89, 46],
              [78, 64],
            ]
          : [
              [64, 41],
              [56, 61],
              [54, 79],
            ],
      })
    );
  }
  function superman(lift = false) {
    return person({
      head: lift ? [33, 85] : [27, 99],
      body: lift
        ? [
            [49, 94],
            [93, 108],
          ]
        : [
            [44, 105],
            [91, 110],
          ],
      farArm: lift
        ? [
            [49, 94],
            [29, 87],
            [11, 82],
          ]
        : [
            [44, 105],
            [26, 109],
            [9, 109],
          ],
      arm: lift
        ? [
            [49, 94],
            [27, 80],
            [7, 71],
          ]
        : [
            [44, 105],
            [24, 112],
            [7, 112],
          ],
      farLeg: lift
        ? [
            [93, 108],
            [119, 99],
            [145, 92],
            [153, 91],
          ]
        : [
            [91, 110],
            [120, 110],
            [145, 110],
            [153, 110],
          ],
      leg: lift
        ? [
            [93, 108],
            [119, 94],
            [145, 81],
            [153, 80],
          ]
        : [
            [91, 110],
            [120, 112],
            [145, 112],
            [153, 112],
          ],
    });
  }
  function frontPerson({ arms, legs, prone = false }) {
    return (
      (prone
        ? `<ellipse cx="80" cy="72" rx="42" ry="52" fill="#21291e" stroke="none"/>`
        : "") +
      path(legs[0], C.far, 6) +
      path(legs[1], C.body, 6.5) +
      path(arms[0], C.far, 6) +
      path(arms[1], C.body, 6) +
      path(
        [
          [80, 30],
          [80, 44],
        ],
        C.body,
        7,
      ) +
      `<path d="M67 44 Q80 39 93 44 L88 76 Q80 82 72 76 Z" fill="${C.body}" stroke="none"/>` +
      circle(80, 25, 8, C.head)
    );
  }
  function snowAngel(overhead = false) {
    return (
      frontPerson({
        prone: true,
        arms: overhead
          ? [
              [
                [91, 46],
                [111, 28],
                [116, 8],
              ],
              [
                [69, 46],
                [49, 28],
                [44, 8],
              ],
            ]
          : [
              [
                [91, 47],
                [107, 66],
                [103, 87],
              ],
              [
                [69, 47],
                [53, 66],
                [57, 87],
              ],
            ],
        legs: [
          [
            [85, 75],
            [93, 96],
            [98, 115],
            [104, 118],
          ],
          [
            [75, 75],
            [67, 96],
            [62, 115],
            [56, 118],
          ],
        ],
      }) +
      text(13, 18, "TOP", 7, C.muted, "start") +
      text(13, 27, "VIEW", 7, C.muted, "start")
    );
  }
  function bicycle(second = false) {
    const bent = [
        [89, 108],
        [74, 72],
        [105, 82],
        [115, 79],
      ],
      extended = [
        [89, 108],
        [120, 101],
        [145, 102],
        [153, 99],
      ];
    return person({
      head: [31, 78],
      body: [
        [48, 88],
        [68, 103],
        [89, 108],
      ],
      farArm: second
        ? [
            [48, 88],
            [64, 66],
            [35, 73],
          ]
        : [
            [48, 88],
            [40, 62],
            [23, 74],
          ],
      arm: second
        ? [
            [48, 88],
            [40, 62],
            [23, 74],
          ]
        : [
            [48, 88],
            [64, 66],
            [35, 73],
          ],
      farLeg: second ? bent : extended,
      leg: second ? extended : bent,
    });
  }
  function walking(second = false) {
    const ahead = [
        [79, 71],
        [58, 89],
        [43, 109],
        [29, 111],
      ],
      behind = [
        [79, 71],
        [97, 90],
        [115, 109],
        [129, 110],
      ],
      armAhead = [
        [76, 34],
        [59, 52],
        [40, 45],
      ],
      armBehind = [
        [76, 34],
        [95, 51],
        [104, 43],
      ];
    return person({
      head: [75, 18],
      body: [
        [76, 34],
        [79, 71],
      ],
      farArm: second ? armAhead : armBehind,
      arm: second ? armBehind : armAhead,
      farLeg: second ? ahead : behind,
      leg: second ? behind : ahead,
    });
  }
  function calfStretch() {
    return (
      wall(140) +
      person({
        head: [107, 20],
        body: [
          [99, 36],
          [85, 69],
        ],
        farArm: [
          [99, 36],
          [121, 38],
          [138, 39],
        ],
        arm: [
          [99, 36],
          [117, 49],
          [138, 48],
        ],
        farLeg: [
          [85, 69],
          [110, 78],
          [115, 111],
          [131, 111],
        ],
        leg: [
          [85, 69],
          [62, 90],
          [39, 111],
          [57, 111],
        ],
      })
    );
  }
  function jack(open = false) {
    return frontPerson({
      arms: open
        ? [
            [
              [91, 46],
              [111, 25],
              [94, 6],
            ],
            [
              [69, 46],
              [49, 25],
              [66, 6],
            ],
          ]
        : [
            [
              [91, 46],
              [103, 65],
              [99, 84],
            ],
            [
              [69, 46],
              [57, 65],
              [61, 84],
            ],
          ],
      legs: open
        ? [
            [
              [85, 76],
              [103, 95],
              [120, 111],
              [131, 113],
            ],
            [
              [75, 76],
              [57, 95],
              [40, 111],
              [29, 113],
            ],
          ]
        : [
            [
              [85, 76],
              [88, 94],
              [89, 111],
              [100, 113],
            ],
            [
              [75, 76],
              [72, 94],
              [71, 111],
              [60, 113],
            ],
          ],
    });
  }
  function highKnee(second = false) {
    const raised = [
        [79, 69],
        [47, 66],
        [44, 88],
        [29, 88],
      ],
      support = [
        [79, 69],
        [84, 90],
        [78, 111],
        [64, 111],
      ],
      forward = [
        [78, 34],
        [57, 52],
        [40, 35],
      ],
      back = [
        [78, 34],
        [100, 46],
        [93, 26],
      ];
    return person({
      head: [78, 18],
      body: [
        [78, 34],
        [79, 69],
      ],
      farArm: second ? forward : back,
      arm: second ? back : forward,
      farLeg: second ? raised : support,
      leg: second ? support : raised,
    });
  }
  function crouch() {
    return person({
      head: [57, 49],
      body: [
        [69, 63],
        [100, 85],
      ],
      farArm: [
        [73, 65],
        [70, 91],
        [63, 110],
        [70, 110],
      ],
      arm: [
        [69, 63],
        [57, 86],
        [49, 110],
        [39, 110],
      ],
      farLeg: [
        [100, 85],
        [77, 80],
        [91, 110],
        [104, 110],
      ],
      leg: [
        [100, 85],
        [68, 82],
        [80, 110],
        [92, 110],
      ],
    });
  }
  function hollow() {
    return person({
      head: [34, 77],
      body: [
        [48, 91],
        [65, 105],
        [89, 109],
      ],
      farArm: [
        [48, 91],
        [27, 80],
        [9, 70],
      ],
      arm: [
        [48, 91],
        [27, 72],
        [7, 57],
      ],
      farLeg: [
        [89, 109],
        [121, 98],
        [149, 88],
        [156, 84],
      ],
      leg: [
        [89, 109],
        [118, 93],
        [146, 77],
        [153, 74],
      ],
    });
  }

  const pose = (label, draw) => ({ label, draw });
  const catalog = {
    "Push-ups": {
      description:
        "Side view: start in a straight high plank, then bend the elbows to lower the chest.",
      poses: [
        pose("1 · High plank", highPlank),
        pose("2 · Lower chest", lowPushup),
      ],
      thumb: 1,
    },
    "Pike push-ups": {
      description:
        "Side view: hips stay high in an inverted V while the elbows bend and the head lowers between the hands.",
      poses: [
        pose("1 · Hips high", () => pike()),
        pose("2 · Bend elbows", () => pike(true)),
      ],
      thumb: 0,
    },
    "Chair dips": {
      description:
        "Side view: hands support the body on a stable chair behind the hips, knees bent; bend the elbows to lower.",
      poses: [
        pose("1 · Hands on chair", () => dip()),
        pose("2 · Lower hips", () => dip(true)),
      ],
      thumb: 1,
    },
    Crunches: {
      description:
        "Side view: lie with knees bent and feet on the floor; curl the shoulders up while the hips stay down.",
      poses: [
        pose("1 · Shoulders down", () => crunch()),
        pose("2 · Curl shoulders up", () => crunch(true)),
      ],
      thumb: 1,
    },
    "Leg raises": {
      description:
        "Side view: head and torso stay on the floor while both straight legs move from a low hover toward vertical.",
      poses: [
        pose("1 · Legs low", () => legRaise()),
        pose("2 · Raise legs", () => legRaise(true)),
      ],
      thumb: 1,
    },
    Plank: {
      description:
        "Side view: hold a straight body supported by the forearms and toes, with elbows below shoulders.",
      poses: [pose("HOLD · Forearms + toes", forearmPlank)],
      thumb: 0,
    },
    Squats: {
      description:
        "Side view: stand, then bend hips and knees to sit back and down, keeping heels on the floor.",
      poses: [
        pose("1 · Stand tall", () => squat()),
        pose("2 · Sit back + down", () => squat(true)),
      ],
      thumb: 1,
    },
    "Reverse lunges": {
      description:
        "Side view: start standing, step one foot backward, and lower the back knee while the front foot remains flat.",
      poses: [
        pose("1 · Stand tall", () => upright()),
        pose(
          "2 · Step BACK + lower",
          () => lunge() + arrow(111, 119, 145, 119),
        ),
      ],
      thumb: 1,
    },
    "Glute bridges": {
      description:
        "Side view: lie with bent knees and planted feet, then lift the hips while shoulders remain on the floor.",
      poses: [
        pose("1 · Hips down", () => bridge()),
        pose("2 · Lift hips", () => bridge(true)),
      ],
      thumb: 1,
    },
    "Wall sit": {
      description:
        "Side view: hold the back against a wall, knees bent, thighs near horizontal and feet flat below the knees.",
      poses: [pose("HOLD · Back against wall", wallSit)],
      thumb: 0,
    },
    "Mountain climbers": {
      description:
        "Side view: from a high plank, bring one knee toward the chest; then alternate legs.",
      poses: [
        pose("1 · High plank", () => climber()),
        pose("2 · Drive knee · alternate", () => climber(true)),
      ],
      thumb: 1,
    },
    "Side plank": {
      description:
        "Generic side view: hold the body raised on the lower forearm and the sides of stacked feet. Use the named support side.",
      poses: [pose("HOLD · Forearm + stacked feet", sidePlank)],
      thumb: 0,
    },
    "Backpack rows": {
      description:
        "Side view: hinge at the hips with knees slightly bent, let a backpack hang, then pull it toward the waist with elbows moving back.",
      poses: [
        pose("1 · Hinge + arms long", () => row()),
        pose("2 · Pull bag to waist", () => row(true)),
      ],
      thumb: 1,
    },
    Superman: {
      description:
        "Side view: lie face down with arms overhead, then lift the arms, chest and legs a little off the floor.",
      poses: [
        pose("1 · Lie face down", () => superman()),
        pose("2 · Lift arms + legs", () => superman(true)),
      ],
      thumb: 1,
    },
    "Reverse snow angels": {
      description:
        "Top view, lying face down: sweep both arms from beside the hips outward and overhead.",
      poses: [
        pose("1 · Face down · arms at hips", () => snowAngel()),
        pose("2 · Sweep arms overhead", () => snowAngel(true)),
      ],
      thumb: 1,
      noFloor: true,
    },
    "Bicycle crunches": {
      description:
        "Side view: curl the shoulders up and rotate one elbow toward the opposite bent knee as the other leg extends; alternate sides.",
      poses: [
        pose("1 · Opposite elbow + knee", () => bicycle()),
        pose("2 · Alternate sides", () => bicycle(true)),
      ],
      thumb: 0,
    },
    Walking: {
      description:
        "Side view of alternating walking strides, with arms swinging opposite the legs.",
      poses: [
        pose("1 · Step", () => walking()),
        pose("2 · Alternate stride", () => walking(true)),
      ],
      thumb: 0,
    },
    Stretching: {
      description:
        "Example: standing calf stretch. Hands press against a wall, the front knee bends and the rear leg stays straight with the rear heel down.",
      poses: [pose("Example: standing calf stretch", calfStretch)],
      thumb: 0,
    },
    Lunges: {
      description:
        "Side view: start standing, step one foot forward and lower the rear knee; return and alternate legs.",
      poses: [
        pose("1 · Stand tall", () => upright()),
        pose(
          "2 · Step FORWARD + lower",
          () => lunge() + arrow(75, 119, 29, 119),
        ),
      ],
      thumb: 1,
    },
    "Jumping jacks": {
      description:
        "Front view: jump from feet together and arms down to feet apart and arms overhead; return.",
      poses: [
        pose("1 · Feet in · arms down", () => jack()),
        pose("2 · Feet out · arms up", () => jack(true)),
      ],
      thumb: 1,
    },
    "High knees": {
      description:
        "Side view: drive one bent knee up toward hip height while standing on the other foot, then alternate legs.",
      poses: [
        pose("1 · Drive knee up", () => highKnee()),
        pose("2 · Switch legs", () => highKnee(true)),
      ],
      thumb: 0,
    },
    Burpees: {
      description:
        "Four steps: stand, squat and place hands down, step or hop the feet back to a high plank, then bring feet forward and stand or jump. No push-up is shown.",
      poses: [
        pose("1 · Stand", () => upright()),
        pose("2 · Hands down", crouch),
        pose("3 · Feet back", highPlank),
        pose(
          "4 · Feet in + rise",
          () => upright(true, true) + arrow(118, 98, 118, 73),
        ),
      ],
      thumb: 1,
    },
    "Hollow-body hold": {
      description:
        "Side view: hold the shoulders and straight legs lifted, with arms overhead and the lower back against the floor.",
      poses: [pose("HOLD · Back down · limbs lifted", hollow)],
      thumb: 0,
    },
  };

  function render(name, { compact = false, side = null } = {}) {
    const entry = catalog[name];
    if (!entry) return "";
    const activeSide =
      name === "Side plank" && /^(left|right)$/i.test(String(side))
        ? String(side).toLowerCase()
        : null;
    const label =
      name +
      (activeSide ? ` · ${activeSide} forearm down` : "") +
      ". " +
      entry.description;
    const viewBox = compact ? "0 0 160 126" : "0 0 440 196";
    const base = `<svg xmlns="http://www.w3.org/2000/svg" class="exercise-illustration${compact ? " exercise-illustration--compact" : ""}" viewBox="${viewBox}" role="img" aria-label="${escape(label)}" focusable="false"><title>${escape(label)}</title>`;
    if (compact)
      return (
        base +
        (entry.noFloor ? "" : floor()) +
        entry.poses[entry.thumb].draw() +
        "</svg>"
      );
    const count = entry.poses.length;
    let content = "";
    entry.poses.forEach((p, i) => {
      const scale = count === 4 ? 0.6 : count === 1 ? 1.12 : 1.06;
      const stageWidth = 160 * scale;
      const columnWidth = 440 / count;
      const x = i * columnWidth + (columnWidth - stageWidth) / 2;
      const y = count === 4 ? 42 : 21;
      content += `<g transform="translate(${x} ${y}) scale(${scale})">${entry.noFloor ? "" : floor()}${p.draw()}</g>`;
      const caption = activeSide
        ? `HOLD · ${activeSide.toUpperCase()} FOREARM DOWN`
        : p.label;
      content += text(
        (i + 0.5) * columnWidth,
        count === 4 ? 153 : 177,
        caption,
        count === 4 ? 10 : 11,
        C.head,
      );
      if (i < count - 1)
        content += arrow(
          (i + 1) * columnWidth - 8,
          count === 4 ? 89 : 90,
          (i + 1) * columnWidth + 8,
          count === 4 ? 89 : 90,
        );
    });
    if (count === 4)
      content += text(
        220,
        179,
        "Step or hop between positions · stand or jump to finish",
        10,
      );
    return base + content + "</svg>";
  }

  const api = { catalog, render };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ExerciseVisuals = api;
})(typeof window !== "undefined" ? window : globalThis);
