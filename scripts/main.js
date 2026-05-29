const backgroundColorOne = "bg-white";
const flashTime = 2000;
const backgroundTime = 15000;
const simpleFlashElements = document.querySelectorAll(".flash");
const sequenceFlashElements = document.querySelectorAll(".flash-seq");
const displayButton = document.querySelector("#display-toggle");
const imgDescription = document.querySelector(".img-description");

function flashElement(element, color) {
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

function flashInterval() {
  flashElement(sequenceFlashElements[index], backgroundColorOne);
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
  imgDescription.innerHTML =
    `<strong> Image Description:</strong> ` + image.description;
  document.body.style.setProperty("--bg-image", `url("${image.path}")`);
}

changeBackground((await loadBackgrounds())[0]);

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
const asyncBackgrounds = await loadBackgrounds();
let bIndex = 0;
setInterval(async () => {
  const backgrounds = await asyncBackgrounds; //using top-level await
  if (backgrounds != undefined && backgrounds.length > 0) {
    await changeBackground(backgrounds[bIndex++]);
    bIndex = bIndex % backgrounds.length;
  }
}, backgroundTime);
displayButton.addEventListener("click", displayToggle);

imgDescription;
