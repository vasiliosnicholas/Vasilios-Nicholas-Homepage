const backgroundColorOne = "btn-flash-bg";
const flashTime = 2000;
const backgroundTime = 15000;
const animationDuration = backgroundTime / 6;
const changeOnDemandAnimationDuration = 500;
const toggleContentDuration = 250;
const simpleFlashElements = document.querySelectorAll(".flash");
const sequenceFlashElements = document.querySelectorAll(".flash-seq");
const displayButton = document.querySelector("#display-toggle");
const elementsToHide = document.querySelectorAll(".page-section:not(footer)");
const imgDescription = document.querySelector(".img-description");
const backgroundKey = "currentBackgroundIndex";
const nextBackgroundButton = document.getElementById("background-next");
const prevBackgroundButton = document.getElementById("background-previous");
const fadeKeyFrames = (direction) =>
  direction === "reverse"
    ? [{ opacity: 1 }, { opacity: 0 }]
    : [{ opacity: 0 }, { opacity: 1 }];

const translateY = (percentage) => `translateX(${percentage}%)`;
const slideKeyFrames = (direction) =>
  direction === "reverse"
    ? [{ transform: translateY(100) }, { transform: translateY(0) }]
    : [{ transform: translateY(0) }, { transform: translateY(100) }];

async function handleAnimation(
  keyframes,
  element,
  direction,
  duration,
  pseudoElement = undefined
) {
  if (!element) return Promise.resolve();

  const animation = element.animate(keyframes(direction), {
    duration: duration,
    fill: "forwards", // Keeps the final opacity state when done
    easing: "ease-in-out",
    pseudoElement: pseudoElement,
  });

  return animation.finished;
}

async function flashElement(element, color) {
  await handleAnimation(
    fadeKeyFrames,
    element,
    "reverse",
    toggleContentDuration,
    "::before"
  );
  element.classList.toggle(color);
}
//TODO: Change to slideKeyFrames onced fixed
async function handleToggle(element) {
  await handleAnimation(
    fadeKeyFrames,
    element,
    "reverse",
    toggleContentDuration
  );
  element.classList.toggle("d-none");
  void handleAnimation(fadeKeyFrames, element, "normal", toggleContentDuration);
}

let toggleLocked = false; //throttle
async function displayToggle() {
  if (!toggleLocked) {
    toggleLocked = true;
    const hidden = !elementsToHide[0].classList.contains("d-none");
    elementsToHide.forEach((element) => {
      void handleToggle(element);
    });
    await handleAnimation(
      fadeKeyFrames,
      displayButton,
      "reverse",
      toggleContentDuration
    );
    void handleAnimation(
      fadeKeyFrames,
      displayButton,
      "normal",
      toggleContentDuration
    );
    if (hidden) {
      displayButton.innerHTML = "View Page Contents";
    } else {
      displayButton.innerHTML = "Hide Page Contents";
    }
    toggleLocked = false;
  }
}

let index = 0;
let count = 0;

async function flashInterval() {
  await flashElement(sequenceFlashElements[index], backgroundColorOne);
  if (count == 1) {
    index++;
    index = index % sequenceFlashElements.length;
  }
  count++;
  count = count % 2;
}

async function loadBackgrounds() {
  const data = await fetch("./images/backgrounds.json");
  return await data.json();
}

function changeBackground(image) {
  document.body.style.setProperty("--bg-image", `url("${image?.path}")`);
  imgDescription.innerHTML =
    `<strong> Image Description:</strong> ` + image?.description;
}

//simple flash
setInterval(() => {
  for (const element of simpleFlashElements) {
    flashElement(element, backgroundColorOne);
  }
}, flashTime);

//sequential flash
if (sequenceFlashElements.length > 0) {
  setInterval(() => {
    flashInterval();
  }, flashTime);
}
const backgrounds = await loadBackgrounds();
const currentBackgroundIndex = localStorage.getItem(backgroundKey);
let bIndex = Number.parseInt(currentBackgroundIndex ?? 0);

let subsequent = false;
let handler = undefined;
async function backgroundHandler(duration = animationDuration) {
  if (backgrounds != undefined && backgrounds.length > 0) {
    bIndex = Math.abs(bIndex % backgrounds.length); //why JavaScript?
    if (subsequent) {
      await Promise.all([
        void handleAnimation(
          fadeKeyFrames,
          document.body,
          "reverse",
          duration,
          "::before"
        ),
        await handleAnimation(
          fadeKeyFrames,
          imgDescription,
          "reverse",
          duration
        ),
      ]);
    }
    localStorage.setItem(backgroundKey, bIndex);
    void handleAnimation(
      fadeKeyFrames,
      document.body,
      "normal",
      duration,
      "::before"
    );
    void handleAnimation(fadeKeyFrames, imgDescription, "normal", duration);
    changeBackground(backgrounds[bIndex++]);
  }
  subsequent = true;
  handler = setTimeout(backgroundHandler, backgroundTime);
}

displayButton.addEventListener("click", displayToggle);

let backgroundChangeLocked = false; //throttle

backgroundHandler();

nextBackgroundButton.addEventListener("click", async () => {
  if (!backgroundChangeLocked) {
    backgroundChangeLocked = true;
    if (handler) clearTimeout(handler);
    await backgroundHandler(changeOnDemandAnimationDuration);
    backgroundChangeLocked = false;
  }
});

prevBackgroundButton.addEventListener("click", async () => {
  if (!backgroundChangeLocked) {
    backgroundChangeLocked = true;
    if (handler) clearTimeout(handler);
    bIndex -= 2;
    if (bIndex < 0) bIndex = backgrounds.length - 1;
    await backgroundHandler(changeOnDemandAnimationDuration);
    backgroundChangeLocked = false;
  }
});

imgDescription;
