function assert(x) {
  if (!x) console.log('fuck!');
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

class RvcaMatrix {
  constructor(width, height, cellSize=5) {
    this.w = Math.floor(width/cellSize);
    this.h = Math.floor(height/cellSize);
    this.cs = cellSize;
    this.arr = [];
    for (var i = 0; i < this.h; i++) {
        this.arr.push([])
        for (var j = 0; j < this.w; j++) {
            this.arr[i][j] = Math.random();
        }
    }
    
    this.colors = [];
    for (var i=0;i<256;i++) {
      this.colors.push(rgbToHex(i, i, i));
    }    
  }
  
  get(y, x) {
    if(x<0 || x>=this.w || y<0 || y>=this.h) return 0;
    return this.arr[y][x];
  }
  
  applyRule(val, sum) {
    
    // Conway.
    if (val >=0.5) {
      if (sum>=2.0 && sum<=3.0) return 1.0;
      if (sum>=1.0 && sum <=2.0) return sum - 1;
      if (sum>=3.0 && sum <=4.0) return 4 - sum;
      return 0;
    } else {
      if (sum>=2.0 && sum<=3.0) return -2 + sum;
      if (sum>=3.0 && sum<=4.0) return 4 - sum;      
      return 0;
    }
  }
  
  getSum(y, x) {
    var line1 = this.get(y-1, x-1) + this.get(y-1, x) + this.get(y-1, x+1);
    var line2 = this.get(y, x-1) + this.get(y, x+1);
    var line3 = this.get(y+1, x-1) + this.get(y+1, x) + this.get(y+1, x+1);
    return line1 + line2 + line3;
  }
  
  step() {
    var sums = [];
    for (var y = 0; y < this.h; y++) {
        sums.push([])
        for (var x = 0; x < this.w; x++) {
            sums[y][x] = this.getSum(y, x);
        }
    }
    
    for (var y = 0; y < this.h; y++) {
        for (var x = 0; x < this.w; x++) {
            this.arr[y][x] = this.applyRule(this.arr[y][x], sums[y][x]);
            assert(this.arr[y][x]>=0 && this.arr[y][x]<=1);
        }
    }
  }
  
  draw(ctx) {
    for (var i = 0; i < this.h; i++) {
      for (var j = 0; j < this.w; j++) {
        ctx.fillStyle = this.colors[Math.floor(255*(1-this.arr[i][j]))];
        ctx.fillRect(this.cs*j, this.cs*i, this.cs, this.cs);
      }
    }
  }
  
  applyDelta(x, delta) {
    x = x + delta;
    if (x<0)x=0;
    if(x>1)x=1;
    return x;
  }
  
  applyMouse(mouseX, mouseY) {
    var x = Math.round(mouseX / this.cs);
    var y = Math.round(mouseY / this.cs); 
    if(x<=6 || x>=this.w-6 || y<6 ||y >=this.h-6) return; 
    
    for (var dy=-5;dy<=5;dy++) {
      for(var dx=-5;dx<=5;dx++) {
        this.arr[y+dy][x+dx]=this.applyDelta(this.arr[y+dy][x+dx], -1);
      }
    }
  }
}
 
function initRvca() {
    var container = document.getElementById("rvca-container");
    var canvas = document.getElementById("rvca-canvas"); 
    
    
    var width = canvas.width;
    var height = canvas.height;
     
    
    var mouseX = 0;
    var mouseY = 0;
    
    container.addEventListener('mouseover', start);
    container.addEventListener('mouseout', stop);
    container.addEventListener('mousemove', updateMousePos);
    container.addEventListener('mouseup', doMouse);
    
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    
    var matrix = new RvcaMatrix(width, height, cellSize=5);
    
    var FPS = 30;
    var timer;
    
    function start() {
      timer = setInterval(renderFrame, 1000/FPS);
    }
    
    function stop() {
      clearInterval(timer);
    }
    
    function renderFrame() { 
        //matrix.applyMouse(mouseX, mouseY);
        matrix.step();
    
        ctx.clearRect(0, 0, width, height);
        matrix.draw(ctx);
    }
    
    function updateMousePos(evt) {
      var rect = canvas.getBoundingClientRect();
      mouseX = evt.clientX - rect.left;
      mouseY = evt.clientY - rect.top;
    }
    
    function doMouse(evt) {
      matrix.applyMouse(mouseX, mouseY);
    }
}

initRvca();
