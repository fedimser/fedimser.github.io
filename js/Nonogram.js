// Nonogram solver by fedimser
// Date: 29.05.2017

function zero1D(size) {
	var arr = [];
	while (size--) arr.push(0); 
	return arr;
}

function zero2D(rows, cols) {
	var array = [], row = [];
	while (cols--) row.push(0);
	while (rows--) array.push(row.slice());
	return array;
}

class Line {
	constructor(groups) {
    this.groups = groups;
		this.gn = groups.length;
		
    if(this.gn>0) {
        this.restLength = zero1D(this.gn);
        this.restLength[this.gn-1] = groups[this.gn-1];
        for(var i=this.gn-2;i>=0;i--) {
            this.restLength[i] = groups[i]+1+this.restLength[i+1];
        }
    }
	}
	
	setCells(cells) {
    this.length = cells.length;
    this.cells = cells;

    this.sure = zero1D(this.length);
    for (var i=0; i<this.length;i++) {
      if (this.cells[i] != 0) this.sure[i] = 1;
    }

    this.cur = zero1D(this.length);
    this.ansLine = zero1D(this.length);
  }

	checkFinal(pos) {		
        for(var i=pos; i<this.length;i++) if(this.cells[i]==1) return;
        for(var i=0;i<this.length;i++)
        {
            if (this.ansLine[i]==0) this.ansLine[i]=this.cur[i];
            else if (this.ansLine[i]!=this.cur[i]) {
                this.ansLine[i]=2;
                this.cells[i]=0; this.sure[i]=1;
            }
        }
        this.realFound++;
    }
	
	rec(g, pos) {
        if (this.realFound>0) return;
        if (pos + this.restLength[g]>this.length) return;

        var ok = true;
        for (var i = pos; i<pos+this.groups[g];i++) {
            if(this.cells[i] == -1) {
                ok = false;
                break;
            }
            this.cur[i] = 1;
        }

        if (pos+this.groups[g]<this.length && this.cells[pos+this.groups[g]]==1) {
            ok = false;
        }

        if (ok) {
            if(g==this.gn-1) this.checkFinal(pos+this.groups[g]);
            else {
                for (var i = pos+this.groups[g]+1; i<this.length; ++i) {
                    this.rec(g+1, i);
                    if(this.cells[i]==1) break;
                }
            }
        }

        for (var i = pos; i<pos+this.groups[g];i++) {
            this.cur[i] = 0;
        }
    }

    isFeasible() {
        if (this.gn == 0) {
            for(var i=0;i<this.length;++i) if(this.cells[i]==1) return false;
            return true;
        }

        this.realFound=0;
        for (var i=0;i<this.length;++i){
            //console.log("TRYING FROM " + i + "...");
			this.rec(0, i);
            if (this.cells[i]==1) break;
        }
        return (this.realFound!=0);
    }

    isModificationFeasible(pos, val) {
        if (this.ansLine[pos]==2 || this.ansLine[pos]==val) return true;
        var tmp = this.cells[pos];
        this.cells[pos] = val;
        var ans = this.isFeasible();
        this.cells[pos] = tmp;
        return ans;
    }

    solve() {
        if (!this.isFeasible()) return false;
        for (var i=0; i<this.length;++i) {
			console.log("Checking "+i+" ...");
            if (this.sure[i]==1) continue;
            if (!this.isModificationFeasible(i, 1)) this.cells[i]=-1;
            else if (!this.isModificationFeasible(i, -1)) this.cells[i]=1;
            else this.cells[i]=0;
            this.sure[i]=1;
        }

        return true;
    }
	

}

class Nonogram {
	constructor(groupsHor, groupsVert) {
		this.width = groupsVert.length;
		this.height = groupsHor.length;
		this.matrix = zero2D(this.height, this.width);
		this.rows = [];
		this.columns = [];
		
		for(var i=0; i < this.height; i++) this.rows.push(new Line(groupsHor[i])); 
		for(var i=0; i < this.width; i++) this.columns.push(new Line(groupsVert[i]));
	} 
	
	getColumn(j) {
        var ans = [];
        for (var i=0;i<this.height;i++) ans.push(this.matrix[i][j]);
        return ans;
    }

    updateMatrix(x, y, value) {
        if (this.matrix[x][y] == 0 && value != 0) {
            this.matrix[x][y] = value;
            this.changed = true;
        }
    }

	isComplete() {
		for (var i=0; i<this.height; i++)
			for (var j=0; j<this.width;j++)
				if(this.matrix[i][j]==0) return false;
		return true;
	}
	
    solve() {
        do {
            this.changed = false;
            for(var i=0;i<this.height;i++){
                this.rows[i].setCells(this.matrix[i]);
                if (!this.rows[i].solve()) return false;
                for(var j=0;j<this.width;j++) this.updateMatrix(i,j, this.rows[i].cells[j]);
            }

            for(var i=0;i<this.width;i++){
                this.columns[i].setCells(this.getColumn(i)); 
                if (!this.columns[i].solve()) return false; 
                for(var j=0;j<this.height;j++) this.updateMatrix(j,i, this.columns[i].cells[j]);
            }
        } while (this.changed);
		return true;
    }
	
	solveAndCheck() {
		if (!this.solve()) return "Impossible.";
		
		console.log(JSON.stringify(this.matrix));
		if (!this.isComplete()) return "Multiple solutions.";
		else return "Solved";
	}

}

class NonogramGUI {
	debug(groups, cells) {
		var line = new Line(groups);
		line.setCells(cells);
		console.log(line.solve());
		console.log(line.cells);
	}

	constructor(bindDiv) {
		
	
		this.containerDiv = bindDiv;
		this.settingsDiv = document.createElement("div");
		this.tableDiv = document.createElement("div");
		this.containerDiv.appendChild(this.settingsDiv);
		this.containerDiv.appendChild(this.tableDiv);
		
		this.maxGroup = 3;
		this.width = 5;
		this.height = 5;
		this.cellSize = "20px";

		this.settingsDiv.appendChild(this.createInputElement("Width", "width", this.width )); 
		this.settingsDiv.appendChild(this.createInputElement("Height", "height", this.height));
		this.settingsDiv.appendChild(this.createInputElement("Group size", "maxGroup", this.maxGroup));
		
		var butt = document.createElement("button");
		butt.style.width = "100px";
		butt.style.height = "20px";
		butt.innerHTML = "Solve!";
		butt.caller = this;
		butt.onclick = function() {
			this.caller.solve();
		}
		this.settingsDiv.appendChild(butt);
		 
		this.ansText = document.createElement("p"); 
		this.settingsDiv.appendChild(this.ansText);
		
		this.cells = zero2D(this.height, this.width);
		this.groupsHor = zero2D(this.height, this.maxGroup);
		this.groupsVert = zero2D(this.width, this.maxGroup);
		
		this.displayTable();
	}
	 
	
	
	
	createInputElement(printName, paramName, defaultValue) {
		var div = document.createElement("div");
		div.appendChild(document.createTextNode(printName + ":   "));
		
		var inp = document.createElement("input");
		inp.type = "number";
		inp.minimum = 0;
		inp.maximum = 100;
		inp.value = defaultValue;
		inp.style.width="50px";
		inp.caller = this;
		inp.onchange = function() {
			this.caller[paramName] = parseInt(this.value); 
			this.caller.updateTableSize();
		}
		div.appendChild(inp);
		return div;
	}
	
	updateTableSize() { 
		this.cells = zero2D(this.height, this.width);
		this.groupsHor = zero2D(this.height, this.maxGroup);
		this.groupsVert = zero2D(this.width, this.maxGroup);
	
		this.displayTable();
	}
	
	
	displayTable() {
		while (this.tableDiv.firstChild) {
			this.tableDiv.removeChild(this.tableDiv.firstChild);
		}
		
		//alert(this.width);
		var tbl = document.createElement("table");
		var tblBody = document.createElement("tbody");
		
		tbl.style["border-collapse"] = "collapse"; 
		tbl.style.border = "4px solid black";
		//tbl.style["cellpadding"] = "0px"; 
				
		
		
        for (var i = 0; i < this.height + this.maxGroup; i++) {
            var row = document.createElement("tr");
            for (var j = 0; j < this.width + this.maxGroup; j++) {
				var type, x, y;
				if (i < this.maxGroup && j < this.maxGroup) type = "invisible";
				else if (i < this.maxGroup && j >= this.maxGroup) {type="groupVert"; x=i; y=j-this.maxGroup; }
				else if (i >= this.maxGroup && j < this.maxGroup) {type="groupHor"; x=i-this.maxGroup; y=j; }
				else {type="cell"; x=i-this.maxGroup; y=j-this.maxGroup;}
				
				
				var cell = document.createElement("td");
				cell.style.width="20px";
				cell.style.height="20px";
				cell.style.padding="0px";
				
				if (type=="invisible"){
					cell.style.border="0px solid black";
				} else if (type=="cell"){
					//cell.style.border="1px solid black";
					if(x%5==0) cell.style["border-top"]="2px solid black";
					if(y%5==0) cell.style["border-left"]="2px solid black";
					if(x==0) cell.style["border-top"]="4px solid black";
					if(y==0) cell.style["border-left"]="4px solid black";
					if(this.cells[x][y]==1) cell.style.backgroundColor="black";
				} else if (type=="groupVert"){
					//cell.style.border="1px solid black";
					if(y%5==0) cell.style["border-left"]="2px solid black";
					if(y==0) cell.style["border-left"]="4px solid black";
				} else if (type=="groupHor") {
					if(x%5==0) cell.style["border-top"]="2px solid black";
					if(x==0) cell.style["border-top"]="4px solid black";
				}
				
				if (type[0]=="g") {
					var inp = document.createElement("input");
					//inp.type = "number";
					//inp.minimum = 0;
					//inp.maximum = Math.max(this.width, this.height);
					
					inp.style.width = this.cellSize;
					inp.x = x;
					inp.y = y;
					inp.caller = this;
					inp.onclick= function(){this.select();}
					
					if (type=="groupHor"){
						inp.value = this.groupsHor[x][y];
						inp.onchange = function() {
							this.caller.groupsHor[this.x][this.y] = parseInt(this.value); 
						}
					} else {
						inp.value = this.groupsVert[y][x];
						inp.onchange = function() {
							this.caller.groupsVert[this.y][this.x] = parseInt(this.value);  
						}
					}
					cell.appendChild(inp); 
				}
				
				//cell.style.margin="0.1px";
				 //var cellText = document.createTextNode("cell is row "+j+", column "+i); 
				 //cell.appendChild(cellText);
				row.appendChild(cell);
            }
            tblBody.appendChild(row);
			console.log(i, this.height);
		}

        tbl.appendChild(tblBody);
        this.tableDiv.appendChild(tbl);
        tbl.setAttribute("border", "2");
	}
	
	prepareGroups(groups) {
		var ret = [];
		for (var x=0;x<groups.length;x++) {
			var row = [];
			for(var y=0;y<groups[x].length;y++) 
				if (groups[x][y]>0) 
					row.push(groups[x][y]);
			ret.push(row);
		}
		return ret;
	}
	
	solve() { 
		var nonogram = new Nonogram(this.prepareGroups(this.groupsHor), this.prepareGroups(this.groupsVert));
		this.ansText.innerHTML = nonogram.solveAndCheck();
		this.cells = nonogram.matrix;
		this.displayTable();
	}
	
	
}
 