const canvas = document.getElementById("canvas");
const preview = document.querySelector(".img");
const loading = document.querySelector(".wait");
const contents = document.querySelector(".contents");
let imgSrc = "";
let answer = [];
let rand  = 0;

//画像選択時の処理
document.getElementById("input").onchange = function(){
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);
    let img = this.files[0];
    let render = new FileReader();
    render.readAsDataURL(img);
    //画像のプレビューを表示、問題用の画像ソース取得
    render.onload = function(){
        preview.src = render.result;
        imgSrc = render.result;
    }
}

//開始ボタン処理
document.getElementById("startBtn").onclick = function(){
    if(imgSrc != ""){
        //待機画面表示
        loading.classList.remove("hidden");
        contents.classList.add("hidden");
        //間違い作成処理呼び出し
        detectObjects(imgSrc);
    }
}

canvas.onclick = function(e){
    const rect = e.target.getBoundingClientRect();
 
    // ブラウザ上での座標を求める
    const   viewX = e.clientX - rect.left,
            viewY = e.clientY - rect.top;

    // 表示サイズとキャンバスの実サイズの比率を求める
    const   scaleWidth =  canvas.clientWidth / canvas.width,
            scaleHeight =  canvas.clientHeight / canvas.height;

    // ブラウザ上でのクリック座標をキャンバス上に変換
    const   canvasX = Math.floor( viewX / scaleWidth ),
            canvasY = Math.floor( viewY / scaleHeight );

    collation(canvasX,canvasY);
    
}

function detectObjects(imageSrc){
    let ctx = canvas.getContext("2d");
    let image = new Image();
    image.src = imageSrc;
    //間違い用画像描画
    image.onload =  () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image,0,0);
        //物体認識処理
        cocoSsd.load().then(model => {
            model.detect(canvas).then(predictions => {
                console.log(predictions)
                for(let i = 0; i < predictions.length; i++){
                    if(i > 3) break;
                    var obj = predictions[i];
					var box = obj.bbox;
					drawRect(box[0], box[1], box[2], box[3]);

                    let ctx = canvas.getContext("2d");
                    let questionImg = new Image(); 

                    if(predictions[i].class == "person"){
                        rand = Math.floor(Math.random() * 2);
                        if(i % 2 == 0){
                            questionImg.src = "./images/dog"+rand+".png";
                            questionImg.onload = () => {
                                ctx.drawImage(questionImg,predictions[i].bbox[0],predictions[i].bbox[1]+predictions[i].bbox[3]-20,predictions[i].bbox[2],predictions[i].bbox[3]/2);
                                answer.push({x:predictions[i].bbox[0],y:predictions[i].bbox[1]+predictions[i].bbox[3]-20,w:predictions[i].bbox[2],h:predictions[i].bbox[3]/2});
                            }
                        }else{
                            questionImg.src = "./images/hat"+rand+".png";
                            questionImg.onload = () => {
                                ctx.drawImage(questionImg,predictions[i].bbox[0]+20,predictions[i].bbox[1]-10,predictions[i].bbox[2]/1.5,predictions[i].bbox[3]/6);
                                answer.push({x:predictions[i].bbox[0],y:predictions[i].bbox[1],w:predictions[i].bbox[2],h:predictions[i].bbox[3]});
                            }
                        }

                    }
                    
                    
                }
                
                loading.classList.add("hidden");
                contents.classList.remove("hidden");
            });
            
        });
    }
    
}

//正誤判定
function collation(x,y){
    answer.forEach((item)=>{
        if(item.x <= x && x <= item.x+item.w && item.y <= y && y <= item.y+item.h){
            alert("正解");
        }
    });
}

function drawRect(x, y, w, h) {
	var ctx = canvas.getContext('2d');
	ctx.beginPath();
	ctx.rect(
		parseInt(x, 10), 
		parseInt(y, 10),
		parseInt(w, 10),
		parseInt(h, 10)
	)
	ctx.strokeStyle = "rgb(50, 240, 60)"
	ctx.lineWidth = 8
	ctx.stroke()
	ctx.closePath()
}