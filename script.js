const tg = window.Telegram.WebApp;
tg.expand();

const BOT_ID = 8250250632;

if (!tg.initDataUnsafe.user) {
    document.body.innerHTML = "Откройте сайт через Telegram бота.";
}

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

let angle = 0;

function drawWheel(){

ctx.clearRect(0,0,320,320);

ctx.beginPath();
ctx.moveTo(160,160);
ctx.arc(160,160,150,0,Math.PI);
ctx.fillStyle="red";
ctx.fill();

ctx.beginPath();
ctx.moveTo(160,160);
ctx.arc(160,160,150,Math.PI,Math.PI*2);
ctx.fillStyle="green";
ctx.fill();

}

drawWheel();

document.getElementById("spin").onclick = spin;

function spin(){

let speed = Math.random()*15 + 25;

const interval = setInterval(()=>{

angle += speed;
speed *= 0.97;

canvas.style.transform = `rotate(${angle}deg)`;

if(speed < 0.3){

clearInterval(interval);

const result = angle % 360 < 180 ? "Выигрыш 🎉" : "Проигрыш 😢";

document.getElementById("result").innerText = result;

}

},30);

}
