const tg = window.Telegram.WebApp;
tg.expand();

if (!tg.initDataUnsafe.user) {
    document.body.innerHTML = "Откройте приложение через Telegram бота";
}

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const segments = 20;   // количество точек
let angle = 0;
let speed = 0;
let spinning = false;

function drawWheel(){

ctx.clearRect(0,0,320,320);

const cx = 160;
const cy = 160;
const r = 140;

for(let i=0;i<segments;i++){

let start = (i/segments)*Math.PI*2;
let end = ((i+1)/segments)*Math.PI*2;

ctx.beginPath();
ctx.moveTo(cx,cy);
ctx.arc(cx,cy,r,start,end);

ctx.fillStyle = i%2==0 ? "#e53935" : "#43a047";
ctx.fill();

}

drawPins();
drawArrow();

}

function drawPins(){

const cx = 160;
const cy = 160;
const r = 150;

for(let i=0;i<segments;i++){

let a = (i/segments)*Math.PI*2;

let x = cx + Math.cos(a)*r;
let y = cy + Math.sin(a)*r;

ctx.beginPath();
ctx.arc(x,y,4,0,Math.PI*2);
ctx.fillStyle="white";
ctx.fill();

}

}

function drawArrow(){

ctx.beginPath();

ctx.moveTo(160,10);
ctx.lineTo(150,40);
ctx.lineTo(170,40);

ctx.fillStyle="yellow";
ctx.fill();

}

drawWheel();

document.getElementById("spin").onclick = ()=>{

if(spinning) return;

speed = Math.random()*0.4 + 0.45;
spinning = true;

requestAnimationFrame(update);

};

let lastPin = 0;

function update(){

if(!spinning) return;

angle += speed;

speed *= 0.992;

let pinIndex = Math.floor((angle%(Math.PI*2))/(Math.PI*2/segments));

if(pinIndex !== lastPin){

speed *= 0.9;

lastPin = pinIndex;

}

canvas.style.transform = `rotate(${angle}rad)`;

if(speed < 0.002){

spinning = false;

let sector = Math.floor((angle%(Math.PI*2))/(Math.PI*2/2));

let result = sector === 0 ? "Выигрыш 🎉" : "Проигрыш 😢";

document.getElementById("result").innerText = result;

return;

}

requestAnimationFrame(update);

}
