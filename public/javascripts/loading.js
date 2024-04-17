let slideBox = document.querySelector(".slide-box");
let solid = document.querySelector(".solid");

let width = 100;

let slide = setInterval(() => {
  solid.style.width = `${width}%`;
  width -= 1;
}, 20);

setTimeout(() => {
  clearInterval(slide);
  solid.style.width = `100%`;
}, 2050);

setInterval(() => {
  width = 100;
  let slide = setInterval(() => {
    solid.style.width = `${width}%`;
    width -= 1;
  }, 20);

  setTimeout(() => {
    clearInterval(slide);
  }, 2050);
}, 2050);
