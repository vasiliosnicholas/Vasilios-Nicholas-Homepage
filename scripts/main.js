const backgroundColorOne = "bg-white";
const flashTime = 2000;
const simpleFlashElements = document.querySelectorAll(".flash");
const sequenceFlashElements = document.querySelectorAll(".flash-seq");
const displayButton = document.querySelector("#display-toggle");

async function flashElement(element, color) {
  element.classList.toggle(color);
}

function displayToggle() {
  let hidden = false;
  document
    .querySelectorAll("body>div>header, body>div>main") //Just wanted to practice using child combinators but using a class selector is probably better here
    .forEach((element) => {
      hidden = element.classList.toggle("d-none");
    });
  if (hidden) {
    displayButton.innerHTML = "View Page Contents";
  } else {
    displayButton.innerHTML = "View Photo";
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

setInterval(async () => {
  for (const element of simpleFlashElements) {
    await flashElement(element, backgroundColorOne);
  }
}, flashTime);

if (sequenceFlashElements.length > 0) {
  setInterval(async () => {
    await flashInterval();
  }, flashTime);
}
//document.body.style.backgroundImage = "url('./images/profile_photo.png')";

displayButton.addEventListener("click", displayToggle);
