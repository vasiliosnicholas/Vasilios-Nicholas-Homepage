const backgroundColorOne = "bg-white";
const flashTime = 2000;
const backgroundTime = 15000;
const animationDuration = backgroundTime / 6;
const changeOnDemandAnimationDuration = 500;
const simpleFlashElements = document.querySelectorAll(".flash");
const sequenceFlashElements = document.querySelectorAll(".flash-seq");
const displayButton = document.querySelector("#display-toggle");
const imgDescription = document.querySelector(".img-description");
const backgroundKey = "currentBackgroundIndex";
const nextBackgroundButton = document.getElementById("background-next");
const prevBackgroundButton = document.getElementById("background-previous");

async function flashElement(element, color) {
  // await handleFadeAnimation(
  //   element,
  //   element.classList.contains(color) ? "reverse" : "normal",
  //   changeOnDemandAnimationDuration
  // );
  element.classList.toggle(color);
}

function displayToggle() {
  let hidden = false;
  document.querySelectorAll(".page-section:not(footer)").forEach((element) => {
    hidden = element.classList.toggle("d-none");
  });
  if (hidden) {
    displayButton.innerHTML = "View Page Contents";
  } else {
    displayButton.innerHTML = "Hide Page Contents";
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

function handleFadeAnimation(
  element,
  direction,
  duration,
  pseudoElement = undefined
) {
  if (!element) return Promise.resolve();

  const keyframes =
    direction === "reverse"
      ? [{ opacity: 1 }, { opacity: 0 }]
      : [{ opacity: 0 }, { opacity: 1 }];

  const animation = element.animate(keyframes, {
    duration: duration,
    fill: "forwards", // Keeps the final opacity state when done
    easing: "ease-in-out",
    pseudoElement: pseudoElement,
  });

  return animation.finished;
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
console.log(backgrounds);
let bIndex = Number.parseInt(currentBackgroundIndex ?? 0);

let subsequent = false;
let handler = undefined;
async function backgroundHandler(duration = animationDuration) {
  if (backgrounds != undefined && backgrounds.length > 0) {
    bIndex = Math.abs(bIndex % backgrounds.length); //why JavaScript?
    if (subsequent)
      await handleFadeAnimation(document.body, "reverse", duration, "::before");
    localStorage.setItem(backgroundKey, bIndex);
    handleFadeAnimation(document.body, "normal", duration, "::before");
    changeBackground(backgrounds[bIndex++]);
  }
  subsequent = true;
  handler = setTimeout(backgroundHandler, backgroundTime);
}

displayButton.addEventListener("click", displayToggle);

let locked = false;

backgroundHandler();

nextBackgroundButton.addEventListener("click", async () => {
  if (!locked) {
    locked = true;
    if (handler) clearTimeout(handler);
    await backgroundHandler(changeOnDemandAnimationDuration);
    locked = false;
  }
});

prevBackgroundButton.addEventListener("click", async () => {
  if (!locked) {
    locked = true;
    if (handler) clearTimeout(handler);
    bIndex -= 2;
    if (bIndex < 0) bIndex = backgrounds.length - 1;
    await backgroundHandler(changeOnDemandAnimationDuration);
    locked = false;
  }
});

imgDescription;
