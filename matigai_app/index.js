const canvas = document.getElementById("canvas");
const preview = document.querySelector(".img");
const loading = document.querySelector(".wait");
const contents = document.querySelector(".contents");
let imgSrc = "";

document.getElementById("input").onchange = function(){
    let img = this.files[0];
    let render = new FileReader();
    render.readAsDataURL(img);
    render.onload = function(){
        preview.src = render.result;
        imgSrc = render.result;
    }
}

document.getElementById("startBtn").onclick = function(){
    loading.classList.remove("hidden");
    contents.classList.add("hidden");
    detectObjects(imgSrc);
}

function detectObjects(imageSrc){
    let ctx = canvas.getContext("2d");
    let image = new Image();
    image.src = imageSrc;
    image.onload =  () => {
        canvas.width = image.width;
        canvas.height = image.height;

        ctx.drawImage(image,0,0);
        cocoSsd.load().then(model => {
            model.detect(canvas).then(predictions => {
                console.log(predictions);
                loading.classList.add("hidden");
                contents.classList.remove("hidden");
            });
        });
    }
    
}

