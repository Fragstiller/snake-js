var SCORE = 0;
var FRAME = 0;

var SETTINGS;
SETTINGS = localStorage.getItem("SAVED_SETTINGS");
if (SETTINGS === null) {
  SETTINGS = {
    grid: true,
    difficulty: 1,
    tracker: false,
    size: 9,
    nextSize: 9,
  };
} else {
  SETTINGS = JSON.parse(SETTINGS);
}

const createGrid = () => {
  let gameDiv = document.getElementById("game");
  gameDiv.style.height = 25 * SETTINGS.size + SETTINGS.size * 2;
  gameDiv.style.width = 25 * (SETTINGS.size + 1) + (SETTINGS.size + 1) * 2;

  let gameHtml = "";

  for (let i = 0; i < SETTINGS.size; i++) {
    gameHtml += "<div class='row'>";
    for (let j = 0; j < SETTINGS.size + 1; j++) {
      gameHtml += `<div class='${
        SETTINGS.grid ? "cell-grid" : "cell-nogrid"
      }' id='${i * (SETTINGS.size + 1) + j}'></div>`;
    }
    gameHtml += "</div>";
  }

  gameDiv.innerHTML = gameHtml;
};

const createNewFruit = () => {
  if (FRAME === 0) {
    document
      .getElementById(
        Math.floor(SETTINGS.size / 2) * (SETTINGS.size + 1) +
          (SETTINGS.size + 1) -
          2
      )
      .classList.add("fruit");
    return;
  }

  let possibleFruitPositions = [];
  for (let i = 0; i < SETTINGS.size * (SETTINGS.size + 1); i++) {
    let cellDiv = document.getElementById(i);
    if (!cellDiv.classList.contains("snake")) possibleFruitPositions.push(i);
  }

  let fruitPos =
    possibleFruitPositions[
      Math.floor(Math.random() * possibleFruitPositions.length)
    ];

  document.getElementById(fruitPos).classList.add("fruit");
};

const createSnake = () => {
  let snakeSegments = [
    { x: 3, y: Math.floor(SETTINGS.size / 2) },
    { x: 2, y: Math.floor(SETTINGS.size / 2) },
    { x: 1, y: Math.floor(SETTINGS.size / 2) },
  ];
  return snakeSegments;
};

const moveSnake = (direction, oldSegments) => {
  let newSegments = JSON.parse(JSON.stringify(oldSegments));
  let head = newSegments[0];

  switch (direction) {
    case "up":
      head.y -= 1;
      break;
    case "down":
      head.y += 1;
      break;
    case "left":
      head.x -= 1;
      break;
    case "right":
      head.x += 1;
  }

  for (let i = 1; i < oldSegments.length; i++) {
    newSegments[i] = oldSegments[i - 1];
  }

  return newSegments;
};

const drawSnake = (newSegments, oldSegments, fullDraw = false) => {
  let newHead = newSegments[0];
  let oldHead = oldSegments[0];

  if (fullDraw) {
    if (SETTINGS.tracker) {
      document
        .getElementById(newHead.y * (SETTINGS.size + 1) + newHead.x)
        .classList.add("snake-head");

      if (oldSegments.length)
        document
          .getElementById(oldHead.y * (SETTINGS.size + 1) + oldHead.x)
          .classList.remove("snake-head");
    }

    oldSegments.forEach((element) => {
      document
        .getElementById(element.y * (SETTINGS.size + 1) + element.x)
        .classList.remove("snake");
    });
    newSegments.forEach((element) => {
      document
        .getElementById(element.y * (SETTINGS.size + 1) + element.x)
        .classList.add("snake");
    });
    return;
  }

  let newTail = newSegments[newSegments.length - 1];
  let oldTail = oldSegments[oldSegments.length - 1];

  document
    .getElementById(newHead.y * (SETTINGS.size + 1) + newHead.x)
    .classList.add("snake");

  if (SETTINGS.tracker) {
    document
      .getElementById(newHead.y * (SETTINGS.size + 1) + newHead.x)
      .classList.add("snake-head");

    document
      .getElementById(oldHead.y * (SETTINGS.size + 1) + oldHead.x)
      .classList.remove("snake-head");
  }

  if (
    (newTail.x !== oldTail.x || newTail.y !== oldTail.y) &&
    !(newHead.x === oldTail.x && newHead.y === oldTail.y)
  ) {
    document
      .getElementById(oldTail.y * (SETTINGS.size + 1) + oldTail.x)
      .classList.remove("snake");
  }
};

const checkFruitCollision = (segments) => {
  let head = segments[0];
  let headClasses = document.getElementById(
    head.y * (SETTINGS.size + 1) + head.x
  ).classList;

  if (headClasses.contains("fruit")) {
    headClasses.remove("fruit");
    segments.push({
      x: segments[segments.length - 1].x,
      y: segments[segments.length - 1].y,
    });
    SCORE++;
    if (SCORE !== SETTINGS.size * (SETTINGS.size + 1) - 2) createNewFruit();
  }
};

const checkSelfCollision = (segments) => {
  let head = segments[0];

  for (let i = 1; i < segments.length; i++) {
    if (segments[i].x === head.x && segments[i].y === head.y) {
      return true;
    }
  }

  return false;
};

const checkWallCollision = (segments) => {
  let head = segments[0];

  if (
    head.x > SETTINGS.size + 1 - 1 ||
    head.y > SETTINGS.size - 1 ||
    head.x < 0 ||
    head.y < 0
  )
    return true;

  return false;
};

const startGame = async () => {
  let direction = "right";
  let directionChanged = false;

  let gameOver = false;

  const inputHandler = (event) => {
    switch (event.key.toLowerCase()) {
      case "w":
      case "arrowup":
        if (direction != "down" && directionChanged === false) {
          direction = "up";
          directionChanged = true;
        }
        break;
      case "s":
      case "arrowdown":
        if (direction != "up" && directionChanged === false) {
          direction = "down";
          directionChanged = true;
        }
        break;
      case "a":
      case "arrowleft":
        if (direction != "right" && directionChanged === false) {
          direction = "left";
          directionChanged = true;
        }
        break;
      case "d":
      case "arrowright":
        if (direction != "left" && directionChanged === false) {
          direction = "right";
          directionChanged = true;
        }
        break;
      case "enter":
        gameOver = true;
        document.removeEventListener("keydown", inputHandler, false);
        destroyGame();
        createGame();
    }
  };

  document.addEventListener("keydown", inputHandler);

  let newSegments = createSnake();
  let oldSegments = [];
  drawSnake(newSegments, [], true);

  while (!gameOver) {
    FRAME++;

    oldSegments = [...newSegments];
    newSegments = moveSnake(direction, oldSegments);

    directionChanged = false;

    if (checkSelfCollision(newSegments) || checkWallCollision(newSegments)) {
      let gameDiv = document.getElementById("game");
      gameDiv.innerHTML += `<div class='game-over'>Game Over!<br>Score: ${SCORE}<br>Frames: ${FRAME}</div>`;
      gameDiv.style.color = "red";
      gameOver = true;
    } else {
      drawSnake(newSegments, oldSegments);
      checkFruitCollision(newSegments);

      if (SCORE === SETTINGS.size * (SETTINGS.size + 1) - 2) {
        let gameDiv = document.getElementById("game");
        gameDiv.innerHTML += `<div class='game-over'>You Win!<br>Score: ${SCORE}<br>Frames: ${FRAME}</div>`;
        gameDiv.style.color = "green";
        gameOver = true;
      }

      await new Promise((r) =>
        setTimeout(
          r,
          Math.floor(
            300 - SCORE * SETTINGS.difficulty * Math.pow(11 / SETTINGS.size, 2)
          )
        )
      );
    }
  }
};

const createGame = () => {
  SETTINGS.size = SETTINGS.nextSize;

  SCORE = 0;
  FRAME = 0;

  createGrid();
  drawSnake(createSnake(), [], true);
  createNewFruit();

  const checkSpacebar = (event) => {
    if (event.key === " ") {
      document.removeEventListener("keydown", checkSpacebar, false);
      startGame();
    }
  };

  document.addEventListener("keydown", checkSpacebar);
};

const destroyGame = () => {
  document.getElementById("game").innerHTML = "";
};

const createSettings = () => {
  let gridSetting = document.getElementById("grid-setting");
  gridSetting.addEventListener("click", (event) => {
    if (SETTINGS.grid === true) {
      SETTINGS.grid = false;
      gridSetting.innerHTML = "off";
    } else {
      SETTINGS.grid = true;
      gridSetting.innerHTML = "on";
    }

    localStorage.setItem("SAVED_SETTINGS", JSON.stringify(SETTINGS));
  });

  let diffSetting = document.getElementById("diff-setting");
  diffSetting.addEventListener("click", (event) => {
    switch (SETTINGS.difficulty) {
      case 0:
        SETTINGS.difficulty = 1;
        diffSetting.innerHTML = "easy";
        break;
      case 1:
        SETTINGS.difficulty = 1.5;
        diffSetting.innerHTML = "medium";
        break;
      case 1.5:
        SETTINGS.difficulty = 2;
        diffSetting.innerHTML = "hard";
        break;
      case 2:
        SETTINGS.difficulty = 0;
        diffSetting.innerHTML = "disable";
    }

    localStorage.setItem("SAVED_SETTINGS", JSON.stringify(SETTINGS));
  });

  let sizeSetting = document.getElementById("size-setting");
  sizeSetting.addEventListener("click", (event) => {
    if (SETTINGS.nextSize < 19) {
      SETTINGS.nextSize += 2;
    } else {
      SETTINGS.nextSize = 5;
    }
    sizeSetting.innerHTML = SETTINGS.nextSize + "x" + (SETTINGS.nextSize + 1);

    localStorage.setItem("SAVED_SETTINGS", JSON.stringify(SETTINGS));
  });

  let trackerSetting = document.getElementById("tracker-setting");
  trackerSetting.addEventListener("click", (event) => {
    if (SETTINGS.tracker) {
      SETTINGS.tracker = false;
      trackerSetting.innerHTML = "off";
    } else {
      SETTINGS.tracker = true;
      trackerSetting.innerHTML = "on";
    }

    localStorage.setItem("SAVED_SETTINGS", JSON.stringify(SETTINGS));
  });

  gridSetting.innerHTML = SETTINGS.grid ? "on" : "off";
  switch (SETTINGS.difficulty) {
    case 0:
      diffSetting.innerHTML = "disable";
      break;
    case 1:
      diffSetting.innerHTML = "easy";
      break;
    case 1.5:
      diffSetting.innerHTML = "medium";
      break;
    case 2:
      diffSetting.innerHTML = "hard";
  }
  sizeSetting.innerHTML = SETTINGS.nextSize + "x" + (SETTINGS.nextSize + 1);
  trackerSetting.innerHTML = SETTINGS.tracker ? "on" : "off";
};

document.addEventListener("DOMContentLoaded", () => {
  createGame();
  createSettings();
});
