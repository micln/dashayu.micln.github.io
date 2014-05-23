/*  
	Class {游戏操作区 && 运行控制器}

	attribute {
		obj			交互层的div元素

		x,y,r,c		相对画布的坐标，尺寸

		tasks[][]	已上膛的指令块
		ifs[][]		已上膛的if指令块

		stack[]		递归运行中的堆栈
	}

	method {
		settool(e,v)	为第v块选择指令（选择面板放在e位置，下同）
		settoolifs(e,v)	选择if指令块

		draw()		绘制操作区背景
		hide()		隐藏交互层div

		run(v,i)	机器运行引擎（去执行第(v,i)个指令块）

		start()		启动机器
		finish()	机器正常结束
		stop()		强行终止机器
	}
*/
function RUNS(){
	that = this;
	this.obj = eid("runs");
	this.x = state.x + conf.cell.x*8;
	this.y = state.y - conf.cell.y + cope.height * 0.7;
	this.r = cope.width * 9;
	this.c = cope.height * 6.8;
	this.clear = function(){
		this.tasks=[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];
		this.ifs=[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];
		this.stack = [];
	}
	this.clear();
	this.init = function(xxx){
		this.stop();
		if (xxx == 1 ){
			for ( i=0; i<4; i++){
				for ( j=1; j<9; j++){
					// toolifs + tool
					var newson = document.createElement('div');
					newson.className = "toola";
					// toolifs
					var newson2 = document.createElement('div');
					newson2.className = "toolifs";
					newson2.setAttribute("copeid",i*8+j);
					newson2.onclick = function(e){
						runs.settoolifs(e,this.getAttribute("copeid"));
					}
					newson.appendChild(newson2);
					// tool
					newson2 = document.createElement('div');
					newson2.className = 'tool';
					newson2.setAttribute("copeid",i*8+j);
					newson2.setAttribute('id', 'cope'+(i*8+j));
					newson2.onclick = function(e){
						runs.settool(e,this.getAttribute('copeid'));
					}
					newson.appendChild(newson2);
					this.obj.appendChild(newson);
					if ( i==3 && j==5 ) break;
				}
			}
			this.obj.style.left = this.x+cope.width + c.offsetLeft + 1;
			this.obj.style.top = this.y + c.offsetTop - cope.height * 0.7;
			this.obj.style.width = cope.width * 8;
			this.obj.style.display = 'none';
		}
	}
	this.settool = function(e,v){
		toolbar.show(e.clientX,e.clientY+10);
		toolbar.settool(v);
	}
	this.settoolifs = function(e,v){
		toolbar.show2(e.clientX,e.clientY+10);
		toolbar.settool2(v);
	}
	this.draw = function(){
		for ( i=0; i<4; i++){
			for ( j=1; j<9; j++){
				cope.draw(this.x+cope.width*j,this.y+cope.height*i*1.7,this.tasks[i][j-1],cope.width,cope.height);
				if (this.ifs[i][j-1] != 0){
					cope.drawifs(this.x+cope.width*j,this.y+cope.height*i*1.7,this.ifs[i][j-1]);
				}else {
					cope.drawifs(this.x+cope.width*j,this.y+cope.height*i*1.7,0);
				}
				if ( i==3 && j==5 ) break;
			}
			cope.draw(this.x,this.y+cope.height*i*1.7,i+4,cope.width,cope.height);
		}
		this.obj.style.display = 'block';
	}
	this.hide = function(){
		this.obj.style.display = 'none';
	}
	this.run = function(v,i){			//	运行(v,i)
		log("[Try ] " + v + "," + i);
		if ( !arm.running ) return;			
		if (this.tasks[v][i] == 0 ){		// 没有要执行的指令
			return;
		}
		if ( this.ifs[v][i] != 0 && this.ifs[v][i]!=arm.hand ){	//	条件不满足时跳过这块
			arm.done(v,i);
			return;
		}
		coststep ++;
		switch( this.tasks[v][i] ){
			case 1 :
				arm.right(v,i);
				break;
			case 2 :
				arm.up(v,i);
				break;
			case 3 :
				arm.down(v,i);
				break;
			case 4 :
				this.stack.push([v,i]);
				this.run(0,0);
				break;
			case 5 :
				this.stack.push([v,i]);
				this.run(1,0);
				break;
			case 6 :
				this.stack.push([v,i]);
				this.run(2,0);
				break;
			case 7 :
				this.stack.push([v,i]);
				this.run(3,0);
				break;
		}
	}
	this.start = function(){
		this.store.save();
		initLevel(Mission);
		this.store.load();
		arm.running = true;
		costime = 0;
		coststep = 0;
		this.run(0,0);
	}
	this.finish = function(){
		clearFlash();
		arm.halt();
	}
	this.stop = function(){
		this.finish();
	}
	this.store={
		save:function(){
			localStorage.setItem("armgo_runs_"+Mission,JSON.stringify(that.tasks));
			localStorage.setItem("armgo_runs_ifs_"+Mission,JSON.stringify(that.ifs));
			console.log(localStorage);
		},
		load:function(){
			t = "armgo_runs_"+Mission;
			res = eval( "(" + localStorage.getItem(t) + ")" );
			if ( res != null){
				that.tasks = res;
				t = "armgo_runs_ifs_"+Mission;
				res = eval( "(" + localStorage.getItem(t) + ")" );
				if ( res != null ){
					that.ifs = res;
				}
			}
			runs.draw();
		}
	}

	this.init(1);
}
