


class Domino {
    constructor(tiling, x, y, dx, dy) {
        this.tiling = tiling;
        // Coordinates of top-left square.
        this.x = x;
        this.y = y;
        // Direction of the arrow, also defines orientation.
        this.dx = dx;
        this.dy = dy;

         if (this.isHorizontal()) {
            this.width = 2;
            this.height = 1;
        } else {
            this.width = 1;
            this.height = 2;
         }

        // Determine color. It doesn't change during the algorithm.
        var parity = (this.x+this.y+this.tiling.order)%2;
        if (this.isHorizontal()) {
            this.color = parity ? 0x759df9 : 0x82ee70;
        } else {
            this.color = parity ? 0xe3c37b : 0xd47766;
        }

        var pointsTo = this.tiling.map[this.x+this.dx][this.y+this.dy];
        this.frozen = false;
        if (pointsTo instanceof Domino) {
            this.frozen = (pointsTo.frozen && pointsTo.color === this.color);
        } else if (pointsTo === -1) {
            this.frozen = true;
        }
    }

    isClashing() {
        var pointsTo = tiling.map[this.x+this.dx][this.y+this.dy];
        if (typeof(pointsTo)=="number") return false;
        var pointsTo2 = tiling.map[pointsTo.x+pointsTo.dx][pointsTo.y+pointsTo.dy];
        return (pointsTo2 == this);
    }

    isHorizontal() {
      return (this.dx==0);
    }

    draw(graphics, alpha, shift) {
        // Rectangle.
        graphics.lineStyle(0.1, 0x000000, alpha);
        graphics.beginFill(this.color, alpha);
        var x = this.x + this.dx * shift;
        var y = this.y + this.dy * shift;
        graphics.drawRect(x, y, this.width, this.height);
        graphics.endFill();

        // The arrow.
        if (this.tiling.drawArrows) {
            var lineColor = this.frozen ? 0x0000ff : 0x000000;
            var x0 = this.isHorizontal() ? x+1 : x+0.5;
            var y0 = this.isHorizontal() ? y+0.5 : y+1;
            graphics.lineStyle(0.02, lineColor, alpha);
            graphics.moveTo(x0-0.25*this.dx, y0-0.25*this.dy);
            graphics.lineTo(x0, y0);
            graphics.lineStyle(0.001, lineColor, alpha);
            graphics.beginFill(lineColor, alpha);
            graphics.moveTo(x0+0.25*this.dx, y0+0.25*this.dy);
            graphics.lineTo(x0-0.1*this.dy-0.05*this.dx, y0-0.1*this.dx-0.05*this.dy);
            graphics.lineTo(x0, y0);
            graphics.lineTo(x0+0.1*this.dy-0.05*this.dx, y0+0.1*this.dx-0.05*this.dy);
            graphics.lineTo(x0+0.25*this.dx, y0+0.25*this.dy);
            graphics.endFill();
        }
    }

    // No arrows, no border, no animation.
    drawQuick(graphics) {
        graphics.beginFill(this.color, 1);
        graphics.drawRect(this.x, this.y, this.width, this.height);
        graphics.endFill();
    }

    toString() {
      return this.x + " " + this.y + " " + this.dx + " " + this.dy;
    }
}

const MAX_ORDER = 2000;
const QUICK_DRAW_START_ORDER = 100; // After this order, do quick drawing.
const ANIMATION_DURATION_SEC = 2.5;
const ANIMATION_FPS = 5;

class Tiling {
    constructor() {
        this.order = 0;

        // 0=empty, -1=not accessible, >=1 - ref to domino.
        this.map = Array(2 * MAX_ORDER);
        for (var i = 0; i< 2 * MAX_ORDER;i++) {
          this.map[i] = Array(2 * MAX_ORDER).fill(-1);
        }

        this.dominos = [];
        this.dominosRemovedOnLastStep = [];
        this.drawArrows = false;

        this.graphics = new PIXI.Graphics();
        pixiApp.stage.removeChildren();
        pixiApp.stage.addChild(this.graphics);

        // Animation.
        this.animationEnabled = false;
        this.animationFrame = 4.0;     // [0.0 - 4.0].
    }

    draw() {
        this.drawArrows = document.getElementById("arrowsCb").checked;
        this.graphics.clear();

        // Transform to fit into screen.
        var ch = pixiApp.view.height;
        var cw = pixiApp.view.width;
        this.graphics.x=cw/2;
        this.graphics.y=ch/2;
        this.graphics.pivot.x=MAX_ORDER+1;
        this.graphics.pivot.y=MAX_ORDER+1;
        var scale = Math.min(100, Math.min(cw, ch) / (2 * this.order));
        this.graphics.scale.x = scale;
        this.graphics.scale.y = scale;


        if (this.order > QUICK_DRAW_START_ORDER) {
            for (var domino of this.dominos) {
                domino.drawQuick(this.graphics);
            }
            this.fixPixi();
            return;
        }


        // Draw empty cells.
        var gridAlpha = 1.0;
        if (this.animationEnabled && this.animationFrame < 1) gridAlpha = this.animationFrame;
        this.graphics.lineStyle(0.02, 0x000000, gridAlpha);
        for (let x of this.idx) {
          for(let y of this.idx) {
             if(this.map[x][y]==0 || (this.animationEnabled && this.map[x][y]!=-1)) {
                this.graphics.drawRect(x, y, 1, 1);
             }
          }
        }

        // Draw dominos.
        for (var domino of this.dominos) {
            var alpha = 1;
            if (this.animationEnabled && domino.stepAdded == this.order) {
                alpha = (this.animationFrame <= 3) ? 0 : this.animationFrame - 3;
            }
            var shift = 0;
            if (this.animationEnabled && domino.stepAdded < this.order && this.animationFrame <= 3) {
                shift = this.animationFrame <= 2 ? -1 : this.animationFrame - 3;
            }
            domino.draw(this.graphics, alpha, shift);
        }

        // Fade out dominos removed on last step.
        if (this.animationEnabled && this.animationFrame <= 2.0) {
            var alpha = 1;
            if (this.animationFrame >= 1) alpha = 2 - this.animationFrame;
            for (var domino of this.dominosRemovedOnLastStep) {
              domino.draw(this.graphics, alpha, 0.0);
            }
        }

        this.fixPixi();
    }

    // See https://github.com/pixijs/pixi.js/wiki/v5-Hacks#removing-65k-vertices-limitation
    // This is needed to make PIXI handle large number of shapes.
    // To be safe, let's do it always.
    fixPixi() {
        this.graphics.finishPoly(); // in case you didnt use closed paths
        this.graphics.geometry.updateBatches();
        // try commenting that to see Uint16 overflow
        this.graphics.geometry._indexBuffer.update(new Uint32Array(this.graphics.geometry.indices));
    }

     drawAnimate() {
        if (this.order > QUICK_DRAW_START_ORDER) {
            this.draw();
            return;
        }

        this.locked = true;
        this.animationEnabled = true;
        var interval = 1000 / ANIMATION_FPS;
        var stepIncrement = 4.0 / (ANIMATION_DURATION_SEC * ANIMATION_FPS);
        this.animationFrame = 0.0;
        var drawTimer = setInterval(() => {
            this.animationFrame += stepIncrement;
            if (this.animationFrame >= 4) this.animationFrame = 4;
            this.draw();
            if (this.animationFrame >= 4.0) {
                clearInterval(drawTimer);
                this.locked = false;
                this.animationEnabled = false;
            }

        }, interval);
     }


    iteration() {
        if(this.order == MAX_ORDER) return;
        if(this.locked) return;

        // Step 1. Extend grid.
        this.order += 1;
        this.idx=[];
        for (var i=MAX_ORDER-this.order+1; i <= MAX_ORDER+this.order;i++)this.idx.push(i);
        this.updateMap_();

        // Step 2. Remove clashing dominos.
        var newDominos = [];
        this.dominosRemovedOnLastStep = []
        for(let domino of this.dominos) {
          if (domino.isClashing()) {
            this.dominosRemovedOnLastStep.push(domino);
          } else {
            newDominos.push(domino);
          }
        }
        this.dominos = newDominos;
        this.updateMap_();

        // Step 3. Move dominos according to their direction.
        for (let domino of this.dominos) {
            domino.x += domino.dx;
            domino.y += domino.dy;
        }
        this.updateMap_();

        // Step 4. Add dominos for empty squares.
        for (let x of this.idx) {
          for(let y of this.idx) {
            if(this.map[x][y] == 0) {
              this.randomFill_(x, y);
            }
          }
        }
        this.updateMap_();

        assert(this.dominos.length == this.order * (this.order + 1));
    }

    updateMap_() {
        // Clear all cells.
        for (var i=0;i<this.order;i++) {
          const halfRowLength = this.order-i;
          const y1 = MAX_ORDER - i;
          const y2 = MAX_ORDER + 1 + i;
          const x1 = MAX_ORDER - halfRowLength+1;
          const x2 = MAX_ORDER + halfRowLength;
          for(var x=x1;x<=x2;x++) {
              this.map[x][y1]=0;
              this.map[x][y2]=0;
          }
        }

        // Set references to dominos.
        for (let domino of this.dominos) {
            assert(this.map[domino.x][domino.y] == 0);
            this.map[domino.x][domino.y] = domino;
            if (domino.isHorizontal()) {
                assert(this.map[domino.x+1][domino.y] == 0);
                this.map[domino.x+1][domino.y] = domino;
            } else {
                assert(this.map[domino.x][domino.y+1] == 0);
                this.map[domino.x][domino.y+1] = domino;
            }
        }
    }

    // Randomly fills empty 2x2 rectangles with hor/vert pairs of dominos.
    randomFill_(x, y) {
        assert(this.map[x][y]==0);
        assert(this.map[x][y+1]==0);
        assert(this.map[x+1][y]==0);
        assert(this.map[x+1][y+1]==0);

        if (Math.random() <=0.5) {
            this.addHorDomino_(x, y, -1);
            this.addHorDomino_(x, y+1, 1);
        } else {
            this.addVertDomino_(x, y, -1);
            this.addVertDomino_(x+1, y, 1);
        }
    }

    addHorDomino_(x, y, arrow) {
        var domino = new Domino(this, x, y, 0, arrow);
        domino.stepAdded = this.order;
        this.dominos.push(domino);
        assert(this.map[x][y]==0, "Cell occupied: " + this.map[x][y]);
        this.map[x][y]=domino;
        assert(this.map[x+1][y]==0, "Cell occupied: " + this.map[x+1][y]);
        this.map[x+1][y]=domino;
    }

    addVertDomino_(x, y, arrow) {
        var domino = new Domino(this, x, y, arrow, 0);
        domino.stepAdded = this.order;
        this.dominos.push(domino);
        assert(this.map[x][y]==0, "Cell occupied: " + this.map[x][y]);
        this.map[x][y]=domino;
        assert(this.map[x][y+1]==0, "Cell occupied: " + this.map[x][y+1]);
        this.map[x][y+1]=domino;
    }

    updateInfo() {
        var tilesCnt = this.dominos.length;
        var infoText = "Iteration: " + this.order + ". Tiles count: " + tilesCnt + ".";
        document.getElementById("info").innerHTML = infoText;

        var frozenCnt = 0;
        for (let domino of this.dominos) {
            if (!domino.frozen) continue;
            frozenCnt++;
        }
        var piEstimate = 4 * (1 - (frozenCnt / tilesCnt));

        var text = "Frozen tiles: " + frozenCnt;
        text += '<br>';
        text += 'Pi approximation: ' + piEstimate;
        console.log(text);
        document.getElementById("pi-estimate").innerHTML = text;
    }
}


var pixiApp;
var tiling;
var autoTimer = null;

function init() {
    var mainCanvas = document.getElementById("mainCanvas");
    mainCanvas.width = window.innerWidth - 300;
    mainCanvas.height = window.innerHeight - 25;

    pixiApp = new PIXI.Application({
      antialias: true,
      backgroundColor: 0xffffff, // White.
      view: mainCanvas,
      width: window.innerWidth - 300,
      height: window.innerHeight - 25,
    });

    reset();
}

function reset() {
    tiling = new Tiling();
    tiling.iteration();
    tiling.draw();
    tiling.updateInfo();
}

function iteration(count) {
    if (tiling.locked) return;
    for(var i=0;i<count;i++) {
        tiling.iteration();
    }

    var animate = document.getElementById("animationCb").checked;
    if (animate && count == 1) {
        tiling.drawAnimate();
    } else {
        tiling.draw();
    }
    tiling.updateInfo();
}

function startStop() {
  var button = document.getElementById("startStop");
  if (autoTimer) {
    button.value = "Auto";
    clearInterval(autoTimer);
    autoTimer = null;
  } else {
    button.value = "Stop";
    autoTimer = setInterval(function() { iteration(1); }, 500);
  }
}

function updateArrows() {
    tiling.draw();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
