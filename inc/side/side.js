//初始化
/*
<div id="box" class="side_box">
	<ul>
		<li><img (event)></li>
		<li><img (event)></li>
		<li><img (event)></li>
	</ul>
</div>
box:容器ID【必填】
num:是否为数字指示，否则为点指示【默认：false】
autorun:是否自动滚动【默认：true】
loop:是否允许循环滚动【默认：true】
如果需要重新填充内容,请调用实例reload（html）方法，html为新的内容
*/
function Side(boxid,num,autorun,loop){
	var t=this;
	var currentPosition = 0,cp = -1,pageNow = 1,points = null,handle=0,ul,maxPage=0,pageWidth,pageSn,ar,box,isnum,isloop;
	function createObj(tag,html){var d=document.createElement(tag);d.innerHTML=html;return d;}
	function run(){
		if(ar){
			stop();
			handle=setInterval(function(){
				goPage(pageNow+1,true);
				if(pageNow>=maxPage-1){
					setTimeout(function(){
						chBorder();
					},400);
				}
			},3000);
		}
	}
	function stop(){
		if(handle>0){
			clearInterval(handle);
			handle=0;
		}
	}
	function addLise(isloop,box,lis){
		ul.style.width=box.offsetWidth*(lis.length+(isloop?2:0))+'px';
		if(isloop){
			ul.insertBefore(createObj('LI',lis[lis.length-1].innerHTML),lis[0]);
            ul.appendChild(createObj('LI',lis[0].innerHTML));
        }
		transform(isloop?-box.offsetWidth:0);
	}
	function setAni(ani){
		ul.style.webkitTransition =ani?"0.3s ease -webkit-transform":'';
	}
	function transform (translate){
		ul.style.webkitTransform = "translate3d(" + translate + "px,0,0)";
		currentPosition = translate;
	}
	function iniNumber(box){
		if(!isloop) return;
        var n=document.querySelector('.side_pbox');
        if(n==null){
            n=createObj('DIV');
            n.className='side_pbox';
            box.appendChild(n);
        }
        n.innerHTML=(new Array(maxPage-1)).join('<div></div>');
        points=n.querySelectorAll('div');
	}
	function initSN(box){
        if(!isloop) return;
        if(pageSn==null){
            pageSn=createObj('DIV');
            pageSn.className='side_nbox';
            box.appendChild(pageSn);
        }
        else
            pageSn=pageSn.parentNode;
        pageSn.innerHTML='<b>1</b><span>/'+(maxPage-2)+'</span>';
        pageSn=pageSn.querySelector('b');
	}
	function setPageNow (p){
        if(!isloop) return;
        if (cp != -1) {
            points[cp]&&(points[cp].className = '');
        }
        if(p==0)
            p=maxPage-2;
        else if(p==maxPage-1)
            p=1;
        if(pageSn){
            pageSn.innerHTML=p;
        }
        else{
            cp = p - 1;
            points[cp]&&(points[cp].className = 'now');
        }
	}
	function calcPage(direction){
		var p=(direction=='left'?1:-1)+pageNow;
		p=p<1?0:p;
		p=p>maxPage?maxPage:p;
		return p;
	}
	function goPage(i,ani){
		setAni(ani);
		pageNow=i;
		transform(-pageNow*pageWidth);
		setPageNow(pageNow);
	}
	
	function chBorder(){
		if(pageNow<=0||pageNow>=maxPage-1){
			setAni(false);
			if(isloop) {
                if(pageNow==0)
                    pageNow=maxPage-2;
                else
                    pageNow=1;
			}
			transform(-pageNow*pageWidth);
			return true;
		}
		return false;
	}
	
	function regTouch(box) {
		pageWidth = box.offsetWidth;
		var maxWidth = - pageWidth * (maxPage-1);
		var startX,startY;
		var initialPos = 0;
		var moveLength = 0;
		var direction = "left"; 
		var isMove = false;
		var startT = 0; 

		box.addEventListener("touchstart", function (e) {
			if(e.touches.length>1||maxPage==1)return;
			stop();
			if(!chBorder())
				setAni(false);
			var touch = e.touches[0];
			startX = touch.pageX;
			startY = touch.pageY;
			initialPos = currentPosition; 		
			startT = new Date().getTime();
			isMove = false; 
		}, false);

		box.addEventListener("touchmove", function (e) {
			if(maxPage==1)return;
			var touch = e.touches[0];
			var deltaX = touch.pageX - startX,deltaY = touch.pageY - startY;
			if (Math.abs(deltaX) > Math.abs(deltaY)) {
				e.preventDefault();
				isMove = true;
				moveLength = deltaX;
				transform(initialPos + deltaX);
				direction = deltaX > 0 ? "right" : "left"; 
			}
		}, false);

		box.addEventListener("touchend", function (e) {
			if(e.touches.length>0||maxPage==1)return;
			var deltaT = new Date().getTime() - startT;
			if (isMove) { 
				if (deltaT < 300||Math.abs(moveLength) / pageWidth >= 0.5){
					pageNow=calcPage(direction);
				}
				if(!isloop && pageNow>lis.length-1)
                    pageNow = lis.length-1;
				goPage(pageNow,true);
				setTimeout(function(){
					chBorder();
					run();
				},400);
			}
		}, false);
	}
	Side.prototype.reload=function(html){
        ul=this.box.querySelector('ul');
		if(ul&&html){
			stop();
			setAni(false);
			ul.innerHTML=html;
			transform(0);
			cp = -1;
			pageNow = isloop?1:0;
			this.init();
		}
	};
	Side.prototype.init=function(){
        lis=this.box.querySelectorAll('li');
		if(lis.length>1){
			addLise(this.isloop,box,lis);
			maxPage=lis.length+2;
			(isnum?initSN:iniNumber)(box);
			if(!isloop)
                pageNow=0;
			setPageNow(pageNow);
			run();
		}
		else if(lis.length==1){
			maxPage=1;
            addLise(this.isloop,box,lis);
		}
	};	
	(function(a,b,c,d){
		if(c==null)ar=true;else{ar=!!c;}
		t.box = document.getElementById(a);
		box=t.box;
		if(box){
			ul=box.querySelector('ul');
			isnum=!!b;
			if(d!==false)
                isloop=true;
            t.isloop = isloop;
			regTouch(box);
			t.init();
			box.style.visibility='visible';
		}
	})(boxid,num,autorun,loop);
}