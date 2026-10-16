const ITEMS = {
  lantern: "Brass lantern",
  key: "Old silver key",
  moonleaf: "Moonleaf"
};

const scenes = {
  clearing: {
    chapter: "THE FOREST'S EDGE",
    title: "A light in the brambles",
    art: "woods",
    caption: "A clearing, somewhere between here and home",
    text: [
      "You meant to be home before dusk. Then the path folded in on itself, and the trees grew tall enough to swallow the sky.",
      "A tiny light flickers beside a moss-covered stone. Far away, a bell gives one lonely note."
    ],
    choices: [
      { label: "Pick up the brass lantern", detail: "A steady little light can only help.", item: "lantern", next: "path" },
      { label: "Search the mossy stone", detail: "Something silver glints between the roots.", item: "key", next: "path" },
      { label: "Follow the distant bell", detail: "The path is dark, but you know the way.", next: "path" }
    ]
  },
  path: {
    chapter: "THE WHISPERING PATH",
    title: "The woods are listening",
    art: "woods",
    caption: "The path curls beneath a canopy of old leaves",
    text: [
      "The trees lean close as you follow the narrow path. A pair of golden eyes watches from the ferns, then blinks away.",
      "Beside the trail, a patch of pale leaves shimmers as if it remembers the moon."
    ],
    choices: [
      { label: "Gather a moonleaf", detail: "Its cool glow might be useful.", item: "moonleaf", next: "stream" },
      { label: "Leave the leaves for someone else", detail: "Some gifts are best left growing.", next: "stream" },
      { label: "Call softly to the watching eyes", detail: "A small voice answers from the dark.", flag: "befriended_wolf", next: "stream" },
      { label: "Push through the thorny shortcut", detail: "The path is quick, but the brambles bite.", health: -1, next: "stream" }
    ]
  },
  stream: {
    chapter: "THE SINGING STREAM",
    title: "A river with no end",
    art: "stream",
    caption: "Cold water carries a song through the stones",
    text: [
      "A silver stream cuts across the path. On the other side, a crooked tower rises above the treetops.",
      "An old ferry is tied to the bank with a rusted chain. Its lock is small enough for a curious key."
    ],
    choices: [
      { label: "Unlock the little ferry", detail: "Use the old silver key.", requires: "key", next: "tower", flag: "crossed_by_ferry" },
      { label: "Offer a moonleaf to the water", detail: "A light appears beneath the surface.", requires: "moonleaf", consume: "moonleaf", next: "tower", flag: "river_blessing" },
      { label: "Cross on the slippery stones", detail: "Careful now. The current is quick.", next: "tower", health: -1, flag: "crossed_by_stones" }
    ]
  },
  tower: {
    chapter: "THE CROOKED TOWER",
    title: "A door without a handle",
    art: "tower",
    caption: "A tower grown around the roots of an ancient tree",
    text: [
      "The tower door is carved with a sleeping fox. No handle, no hinges—only a keyhole and a narrow window high above.",
      "Something inside chimes when you draw near. The fox's stone eyes look almost alive."
    ],
    choices: [
      { label: "Try the silver key", detail: "The lock gives a sleepy little click.", requires: "key", next: "chamber", flag: "opened_tower" },
      { label: "Show the fox your lantern", detail: "Its stone eyes catch the warm light.", requires: "lantern", next: "chamber", flag: "opened_tower" },
      { label: "Climb the ivy to the window", detail: "The stones are slick and the climb is long.", next: "chamber", health: -1, flag: "opened_tower" }
    ]
  },
  chamber: {
    chapter: "THE QUIET HEART",
    title: "The bell remembers",
    art: "chamber",
    caption: "Dust turns to gold in the tower's silent heart",
    text: [
      "At the top of the tower, a little moon bell hangs beneath a glass roof. It is so quiet you can hear the stars turning.",
      "A small fox curls at its base. It opens one eye, waiting to see what you will do."
    ],
    choices: [
      { label: "Ring the moon bell", detail: "Let its song find its way home.", next: "ending", ending: "bell" },
      { label: "Sit beside the fox awhile", detail: "There is no hurry to leave.", next: "ending", ending: "fox" },
      { label: "Take the bell's silver clapper", detail: "A bright little treasure for the road.", next: "ending", ending: "treasure" }
    ]
  }
};

const endings = {
  bell: {
    chapter: "A WAY BACK HOME",
    title: "The valley wakes",
    art: "ending",
    caption: "A thousand windows glow beyond the trees",
    text: (state) => {
      const extra = state.inventory.includes("lantern")
        ? " Your lantern answers, warm and gold, and every little light in the forest wakes with it."
        : state.flags.includes("river_blessing")
          ? " The stream answers from far below, carrying the song into every root and hollow."
          : " From every hillside, a hundred tiny lights answer the call.";
      return [
        "You ring the moon bell. Its note is soft as a lullaby, but it travels farther than the eye can see.",
        `The trees bow aside, and the old road home appears beneath your feet.${extra}`,
        "By morning, the whole valley remembers its way."
      ];
    }
  },
  fox: {
    chapter: "A QUIETER KIND OF MAGIC",
    title: "A friend in the woods",
    art: "ending",
    caption: "A small fox leads the way through the fernlight",
    text: (state) => [
      state.flags.includes("befriended_wolf")
        ? "The fox curls beside you, and from the forest edge your old friend pads in to join you."
        : "The fox curls beside you. After a while, it rises, stretches, and looks toward a hidden path.",
      "Together, you wander beneath the trees until the first birdsong finds you. The bell can wait for another night."
    ]
  },
  treasure: {
    chapter: "A SHINY DETOUR",
    title: "A pocketful of starlight",
    art: "ending",
    caption: "The forest keeps a little sparkle for itself",
    text: [
      "The silver clapper is cool in your hand, bright as a fallen star. The bell gives a tiny, surprised hum.",
      "You find your way home by moonlight, with a curious treasure in your pocket and a story no one quite believes."
    ]
  },
  lost: {
    chapter: "A SOFTER ENDING",
    title: "Rest beneath the leaves",
    art: "woods",
    caption: "The forest tucks you in until morning",
    text: [
      "Your legs are tired, and the woods grow quiet around you. You find a patch of soft moss and let your eyes close.",
      "At dawn, birdsong leads you gently back to the path. The moon bell will be there when you are ready to try again."
    ]
  }
};

const initialState = () => ({
  scene: "clearing",
  health: 3,
  maxHealth: 3,
  inventory: [],
  flags: [],
  steps: 0,
  ending: null
});

let state = initialState();
const storyElement = document.querySelector("#story-text");
const choicesElement = document.querySelector("#choices");

function addUnique(list, value) {
  return list.includes(value) ? list : [...list, value];
}

function currentScene() {
  return state.ending ? endings[state.ending] : scenes[state.scene];
}

function render() {
  const scene = currentScene();
  const art = document.querySelector("#scene-art");
  const isEnding = Boolean(state.ending);
  const sceneOrder = ["clearing", "path", "stream", "tower", "chamber"];
  const sceneIndex = isEnding ? sceneOrder.length : sceneOrder.indexOf(state.scene);

  document.querySelector("#chapter-name").textContent = scene.chapter;
  document.querySelector("#chapter-number").innerHTML = isEnding
    ? "✦ <span>THE END</span>"
    : `${String(sceneIndex + 1).padStart(2, "0")} <span>/ 05</span>`;
  document.querySelector("#scene-title").textContent = scene.title;
  document.querySelector("#art-caption").textContent = scene.caption;
  art.dataset.scene = scene.art;
  art.setAttribute("aria-label", scene.caption);
  document.querySelector("#step-count").textContent = `DAY ${String(Math.max(1, state.steps + 1)).padStart(2, "0")}`;
  const hearts = "♥ ".repeat(state.health).trim() || "—";
  const healthDisplay = document.querySelector("#health-display");
  healthDisplay.textContent = hearts;
  healthDisplay.setAttribute("aria-label", `${state.health} warmth point${state.health === 1 ? "" : "s"}`);
  document.querySelector("#choice-prompt").textContent = isEnding ? "What next?" : "What do you do?";

  const paragraphs = typeof scene.text === "function" ? scene.text(state) : scene.text;
  storyElement.replaceChildren(...paragraphs.map((paragraph) => {
    const element = document.createElement("p");
    element.textContent = paragraph;
    return element;
  }));

  const inventory = document.querySelector("#inventory-list");
  inventory.replaceChildren();
  if (!state.inventory.length) {
    const empty = document.createElement("li");
    empty.className = "empty-inventory";
    empty.textContent = "Just the usual things.";
    inventory.append(empty);
  } else {
    state.inventory.forEach((item) => {
      const entry = document.createElement("li");
      entry.textContent = ITEMS[item];
      inventory.append(entry);
    });
  }

  const available = isEnding
    ? [{ label: "Begin a new adventure", detail: "The woods will be here.", restart: true }]
    : scene.choices.filter((choice) => !choice.requires || state.inventory.includes(choice.requires));
  choicesElement.replaceChildren(...available.map((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.append(document.createTextNode(choice.label));
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = choice.restart ? "↻" : "→";
    button.append(arrow);
    button.addEventListener("click", () => choice.restart ? startOver() : choose(choice));
    return button;
  }));
}

function choose(choice) {
  if (choice.item) state.inventory = addUnique(state.inventory, choice.item);
  if (choice.consume) state.inventory = state.inventory.filter((item) => item !== choice.consume);
  if (choice.flag) state.flags = addUnique(state.flags, choice.flag);
  if (choice.health) state.health = Math.max(0, Math.min(state.maxHealth, state.health + choice.health));
  state.steps += 1;

  if (state.health === 0) {
    state.ending = "lost";
  } else if (choice.ending) {
    state.ending = choice.ending;
  } else {
    state.scene = choice.next;
  }
  render();
  document.querySelector("#scene-title").focus();
}

function startOver() {
  state = initialState();
  render();
  const dialog = document.querySelector("#restart-dialog");
  if (dialog.open) dialog.close();
}

document.querySelector("#restart-top").addEventListener("click", () => {
  document.querySelector("#restart-dialog").showModal();
});
document.querySelector("#confirm-restart").addEventListener("click", (event) => {
  event.preventDefault();
  startOver();
});
document.querySelector("#restart-dialog").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});

render();
