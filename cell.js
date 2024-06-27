// Daniel Shiffman
// The Coding Train
// Minesweeper
// https://thecodingtrain.com/challenges/71-minesweeper
// Video: https://youtu.be/LFU5ZlrR21E

//Extended by Cooknas: http://www.cooknas.com/codingtrain/minesweeper/index.html

function Cell(i, j, w) {
    this.i = i;
    this.j = j;
    this.x = i * w;
    this.y = j * w;
    this.w = w;
    this.neighborCount = 0;
  
    this.bomb = false;
    this.revealed = false;
    this.flag = false;
}
  
Cell.prototype.show = function() {
    stroke(0);
    noFill();
    rect(this.x, this.y, this.w, this.w);
    if (this.revealed) {
        if (this.bomb) {
            fill(255,30,30);
            fillGradient('radial', {
                from : [this.x , this.y , 0 ], // x, y, radius
                to : [this.x +this.w , this.y +this.w , this.w/2], // x, y, radius
                steps : [
                    [color(255,255,255),0],
                    [color(255, 96, 0),0.75],
                    [color(155,0,0),1]
                ]
            }, canvas);
            ellipse(this.x + this.w * 0.5, this.y + this.w * 0.5, this.w * 0.5);
            fill(20);
            rect(this.x + this.w * 0.5-this.w*0.1, this.y + this.w * 0.5-this.w*0.3,this.w*0.2,this.w*0.05);
            line(this.x + this.w * 0.5, this.y + this.w * 0.5-this.w*0.3, this.x + this.w * 0.5, this.y + this.w*0.1)
        } else {
            fill(200);
            rect(this.x, this.y, this.w, this.w);
            if (this.neighborCount > 0) {
                textAlign(CENTER);
                fill(0);
                text(this.neighborCount, this.x + this.w * 0.5, this.y + this.w * 0.7 );
            }
        }
    }else if(this.flag){
        stroke(0);
        let x1 = this.x + this.w * 0.3;
        let y1 = this.y + this.w-4;
        let x2 = this.x + this.w * 0.3;
        let y2 = this.y + 4;
        let x3 = this.x + this.w * 0.7;
        let y3 = this.y + 4 + this.w * 0.2;
        let x4 = this.x + this.w * 0.3;
        let y4 = this.y + this.w*0.6;
        line(x1, y1, x2, y3);
        line(x2, y2, x3, y3);
        line(x3, y3, x4, y4);
        fill(255,0,0);
        triangle(x2, y2, x3, y3, x4, y4);
    }
}
  
Cell.prototype.countBombs = function() {
    if (this.bomb) {
        this.neighborCount = -1;
        return;
    }
    var total = 0;
    for (var xoff = -1; xoff <= 1; xoff++) {
        var i = this.i + xoff;
        if (i < 0 || i >= cols) continue;
    
        for (var yoff = -1; yoff <= 1; yoff++) {
            var j = this.j + yoff;
            if (j < 0 || j >= rows) continue;
    
            var neighbor = grid[i][j];
            if (neighbor.bomb) {
                total++;
            }
        }
    }
    this.neighborCount = total;
}
  
Cell.prototype.contains = function(x, y) {
    return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w);
}
  
Cell.prototype.reveal = function() {
    this.revealed = true;
    this.flag = false;
    if (this.neighborCount == 0) {
        // flood fill time
        this.floodFill();
    }
}
  
Cell.prototype.floodFill = function() {
    for (var xoff = -1; xoff <= 1; xoff++) {
        var i = this.i + xoff;
        if (i < 0 || i >= cols) continue;
    
        for (var yoff = -1; yoff <= 1; yoff++) {
            var j = this.j + yoff;
            if (j < 0 || j >= rows) continue;
    
            var neighbor = grid[i][j];
            // Note the neighbor.bomb check was not required.
            // See issue #184
            if (!neighbor.revealed) {
                neighbor.reveal();
            }
        }
    }
}