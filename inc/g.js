/*
部署建议：
全局引用zepto.js,g.js,comm.css
各自网站中创建自己的全局JS,和公用css
全局JS中需要申明config对象并申明属性
	root：接口根路径url
	webroot:测试网页接口
	isTest:是否测试（开发为true，上线为false）
	ossroot:oss根路径
如果有多页面共用样式或js请使用独立文件存放，如果各个页面各自独立的js或样式，直接写在页面中
页面事件，
pageload:页面加载时执行
pageresume：页面重新获得焦点时执行
androidback：当面安卓用户点击返回键时执行，如果页面调用：Comm.setAndroidHome（）页面执行询问退出操作
db:上级操作页面返回的数据
特别说明：系统内置变量均为以双下划线 “__”开始，为防止变量污染，请不要在任何时间申明变量时使用双下划线开始，
*/
var config = {
	//root : 'http://192.168.0.187:8080',
	root:'https://sjd.uvmatrix.com/',
	// webroot: "http://wh.feiyingbao.com.cn/", //网址地址
	ossroot:'https://liangzhizheng.oss-cn-hangzhou.aliyuncs.com/'
};
var AJAX=new function(){
	var _xhr,K="_token",abs=null,t=this;	
	function finish(v,cb){
		if(cb==null)return;
		var o;
		if(v&&v.length>1){
			try{
				o=JSON.parse(v);
				if(o.code==110){
					Comm.confirm("登录已过期,请重新登录...",function(d){
						if(d==1) Comm.gotop("login.html")
					});
					return;
				}
			}
			catch(e){
				o=v;
			}
		}
		cb(o);
	}
	function ab(){
		if(abs==null){
			abs=Comm.db(K);
			if(abs==null)
				abs='';
		}
		return abs;
	}
	function repair(api){
		var a=ab();
		if(a)api+=(api.indexOf('?')>0?'&':'?')+K+'='+a+'&timespan='+Math.random();
		return api;		
	}
	function deobj(obj){
		if(obj==null)return '';
		var s=[];
		for (var i in obj){
			if(typeof(obj[i])==typeof('')){
				if(obj[i].indexOf('%')>0)
					obj[i]=obj[i].replace(/%/g, "%25");
				if(obj[i].indexOf('&')>0)
					obj[i]=obj[i].replace(/\&/g, "%26");
				if(obj[i].indexOf('+')>0)
					obj[i]=obj[i].replace(/\+/g, "%2B");
			}
			s.push(i+'='+obj[i])
		}
		return s.join('&');
	}
	function error(code,cb){
		Comm.loading();
		cb&&cb({code:-1,msg:'服务器异常'});
	}
	function init (post, url, data, cb) {
		url=t.Uri()+repair(url);
		var xhr=new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState==4){
				if(this.status == 200){
					finish(this.responseText,cb);
				}
				else{
					error(this.status,cb);
				}
			}
		};
		xhr.open(post?'POST':'GET', url, true);
        if (post){
			data=deobj(data);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		}
        xhr.send(data);
	}
	
	/*----AJAX公用方法-----*/
	
	/*获取服务器接口根路径*/
	t.Uri=function(){
		return (window['config']&&window['config']['root'])?config.root:'';
	}
	
	/*获取服务器调试页面根路径*/
	t.WebRoot=function(){
		return (window['config']&&window['config']['webroot'])?config.webroot:'';
	}
	
	/*调用用户登录token*/
	t.setTag=function(a){
		abs=a;
		Comm.db(K,abs);
	}
	
	/*执行GET方法，一般用于从服务器获取数据，api长度尽量不超过1000字节*/
	t.GET=function(api,cb){
		init(false,api,null,cb);
	}
	/*执行POST方法，一般用于向服务器提交数据，data建议不为空*/
	t.POST=function(api,data,cb){
		init(true,api,data,cb);
	}
	/*根据用户凭证判断用户是否登录*/
	t.isLogin=function(){
		return ab().length>0;
	}
};

/*响应android返回键,程序可重写此事件，不可重写，则执行默认事件：关闭*/
function androidback() {
   if(parseInt(Comm._pageinfo.android_home)===0){
	   Comm.close();
   }
	else{
		if(parseInt(Comm._pageinfo.android_home)===1){
			Comm._pageinfo.android_home=2;
			Comm.confirm('您确定要退出应用？',function(a){
				if(a==1)
					Comm.close();
				else
					Comm._pageinfo.android_home=1;
			});
		}
	}	
}
/*原生统一回调，系统内置函数*/
function _w9_wcallback(data,code) {
	if(code==null||code==="null")return;
	code=parseInt(code);
	//系统事件
	if (code===0){
		//android返回键
		if(data==='back')
			Comm.exec('androidback');
		//页面重新获得焦点
		else if(data==='resume'){
            resumeAndroidKeyboard();
			Comm.exec('pageresume');
			//事件级回调
			if(Comm._pageinfo.resume){
				Comm._pageinfo.resume(bd);
				Comm._pageinfo.resume=null;
			}
		}
	}
	//原生事件
	else if(code>0){
		var temp=Comm._pageinfo.e[code];
		if(temp){
			delete Comm._pageinfo.e[code];
			temp.cb(temp.db?Comm._deData(data):Comm.parse(data));
			temp=null;
		}
	}   
}
var Comm=new function(){
	//网页历史记录
	var URLIST='__UrlList',z=this;
	//处理原生回调路由	
	function callNative(m,d){
		if(z.ios()){
			var data={method:m+(d===null?'':':')};
			if(d)data['data']=toStr(d);
			window.webkit.messageHandlers.WeiLai.postMessage(data);
		}
		else{
			if(window.WeiLai && (typeof window.WeiLai[m] === typeof function(){})){
				if(d===null)
					window.WeiLai[m]();
				else
					window.WeiLai[m](toStr(d));
			}
		}
	}
	//对象转str
	function toStr(o){
		if(typeof(o)==typeof({}))
			return JSON.stringify(o);
		return o;
	}
	//设置保留回调方法并返回句柄
	function setcb(cb,db){
		var code=(++z._pageinfo.code);
		z._pageinfo.e[code]={cb:cb,db:db};
		return code;
	}
	//存储对象或内容时编码
	function enData(o){
		return encodeURIComponent(JSON.stringify(o)).replace(/\%/g,"/");
	}
	//取出对象或内容时解码，系统内置函数
	z._deData=function(s){
		if(s&&s.indexOf('/')>-1){
			s=decodeURIComponent(s.replace(/\//g,"%"));			
		}
		return z.parse(s);
	}
	z._pageinfo={android_home:0,wback:null,code:1,e:{},test:false};
	//封面背景
	var MainBg={
		box:null,
		s:false,
		d:0,
		init:function(){
			if(MainBg.box===null){
				MainBg.box=document.createElement('DIV');
				MainBg.box.id='MainBg';
				$(document.body).prepend(MainBg.box);
				MainBg.box.addEventListener('touchstart',MainBg.noact, false);
				MainBg.box.addEventListener('touchmove',MainBg.noact, false);
			}
		},
		noact:function(e){
			e.preventDefault();
			return false;
		},
		show:function(s){
			if(s){
				MainBg.d++;
				if(!MainBg.s){
					MainBg.init();
					MainBg.s=true;
					$(MainBg.box).show();
				}
			}
			else{
				MainBg.d--;
				if(MainBg.d<=0&&MainBg.s){
					MainBg.d=0;
					MainBg.s=false;
					$(MainBg.box).hide();
				}
			}
		},
		close:function(){
			MainBg.d=1;
			MainBg.s=true;
			MainBg.show(false);
		}
			
	};
	//mess
	var Mess={
		box:null,show:false,
		init:function(){
			if(Mess.box===null){
				Mess.box=document.createElement('DIV');
				Mess.box.id='MessgeBox';
				Mess.box.innerHTML='<div id="MessgeBoxContent"></div><div id="MessgeBoxButton" class="nowrap"></div>';
				document.body.appendChild(Mess.box);
			}	
		},
		alert:function(mess,code){
			Mess.init();
			$('#MessgeBoxContent').attr('class','center').html(mess);
			$('#MessgeBoxButton').html('<span class="mbuttonfull" '+callbackstr(1,code)+'>确定</span>');
			MainBg.show(true);
			Mess.show=true;
			$(Mess.box).show();
		},
		confirm:function(mess,code){
			Mess.init();
			$('#MessgeBoxContent').attr('class','tleft').html(mess);
			$('#MessgeBoxButton').html('<span class="mbuttonl fs30"'+callbackstr(0,code)
				+'>取消</span><span class="mbuttonr fs30"'+callbackstr(1,code)+'>确定</span>');
			MainBg.show(true);
			Mess.show=true;
			$(Mess.box).show();
		},
		close:function(){			
			if(Mess.show){
				Mess.show=false;
				$(Mess.box).hide();
				MainBg.show(false);
			}
		}
	};
	//message
	var Message={
		box:null,
		h:0,
		init:function(){
			if(Message.box===null){
				Message.box=document.createElement('DIV');
				Message.box.id='MessgeBoxT';
				document.body.appendChild(Message.box);
			}	
		},
		show:function(mess){
			clearTimeout(Message.h);
			Message.init();
			Message.box.innerHTML='<span class="fs30" style="height:1rem;">'+mess+'</span>';
			$(Message.box).show();
			Message.h=setTimeout(function(){
				$(Message.box).hide();
				_w9_wcallback(1);
			},1500);
		}
	}	
	//统一回调字符串
	function callbackstr(d,code){
		return ' onclick="Comm.callback('+d+','+code+')"';
	}
	//嵌入弹窗
	var WTD=new function(){
		var t='wtd',tl=null,box,cancel=false,bid='WTDBOX',cid='WTDBOXTD',wid='_WTDBOX';
		function init(){
			if(tl===null){
				box=document.createElement('div');
				box.id=bid;
				box.innerHTML='<div id="'+wid+'"><div id="'+cid+'"></div></div>';
				document.body.appendChild(box);
				tl={};
				$('*['+t+']').each(function(i,e) {
					tl[$(e).attr(t)]=$(e).removeAttr(t).prop("outerHTML");
					$(e).remove();
				});
			}
		}
		function show(wtdid,can){
			init();
			cancel=!!can;
			if(tl[wtdid]){
				Comm.bg(true);
				$('#'+bid).click(function(e){
					if(e.target.id===wid&&cancel)hide();
				});
				$('#'+cid).html(tl[wtdid]);
				$(box).css('display','table');
			}				
		}
		function hide(){
			if(box){
				$('#'+cid).html('');
				$(box).css('display','none');
				Comm.bg(false);
			}
		}
		return {
			show:show,
			hide:hide
		};
	};
	//加载层
	var Loading={
		box:null,
		init:function(){
			if(Loading.box===null){
				Loading.box=document.createElement('div');
				Loading.box.id='loadingbox';
				document.body.appendChild(Loading.box);	
			}	
		},
		show:function(arg){
			Loading.init();
			if(arg==null||!arg){
				$(Loading.box).hide();
				Comm.bg();
			}
			else{
				Comm.bg(true);
				if(arg==true||arg=='')arg='加载中，请稍候...';
				$(Loading.box).html('<span class="fs30">'+arg+'</span>');
				$(Loading.box).show();
			}
		}	
	};
	//地图支持
	var Map = {
        show: function (a,cb) {
            //$('html, body').animate({ scrollTop: 0 });
            //禁止滚动条(默认是没有附加这个样式类的）
            var map = Comm.getmap.map;
            if (Comm.getmap.map === null) {
                $("body").append('<div class="allmap">\
								   <header>\
										<div class="Nav borderBottom NavBar">\
											<div class="barItem_Lf" onclick="Comm.getmap.mapConfirm(false)">\
												<span class="barItem_Custom barItem_backImgBtn"></span>\
											</div>\
											<div class="barItem_Rf">\
												<span class="barItem_Custom" onclick="Comm.getmap.mapConfirm(true,\'' + a + '\')">确认</span>\
											</div>\
											<div class="barItem_title">选择地点</div>\
										</div>\
									</header>\
								   <div class="mapddss"><div id="allmap" style="height:'+ (Comm.h - 45) + 'px;"></div></div></div>');
                $(".allmap").show();
                // 百度地图API功能
                Comm.getmap.map = new BMap.Map("allmap");
                map = Comm.getmap.map;
            }
            $(".allmap").show();
            $(window).scrollTop(0);
            $(document.body).toggleClass("html-body-overflow");
            $(window).scrollTop(0);
            if (Comm.getmap.maplng > 0 && Comm.getmap.maplat > 0) {
                var point = new BMap.Point(Comm.getmap.maplng, Comm.getmap.maplat);
                map.centerAndZoom(point, 12);
            } else {
                //30.632825  104.044259  成都
                var point = new BMap.Point(104.044259, 30.632825);
                map.centerAndZoom(point, 12);
            }

            // 添加定位控件
            var geolocationControl = new BMap.GeolocationControl();
            geolocationControl.addEventListener("locationSuccess", function (e) {

            });
            map.addControl(geolocationControl);
            // 添加带有定位的导航控件
            var navigationControl = new BMap.NavigationControl({
                // 靠左上角位置
                anchor: BMAP_ANCHOR_TOP_LEFT,
                // LARGE类型
                type: BMAP_NAVIGATION_CONTROL_LARGE,
                // 启用显示定位
                enableGeolocation: true
            });
            map.addControl(navigationControl);
            var opts = {
                width: 240,     // 信息窗口宽度
                height: 60,     // 信息窗口高度
                title: "请确认地址？", // 信息窗口标题
                enableMessage: true//设置允许信息窗发送短息
            };
            var html = "<div class='address' style='margin-top:10px'></div>";/*"<div class='address' style='margin-top:10px'></div><div class='mapconfirm'><span onclick='Comm.mapConfirm(false)'>取消</span><span class='newBtnYes' onclick='Comm.mapConfirm(true,\"" + a + "\")'>确认</span></div>";*/

            //单击获取点击的经纬度
            map.addEventListener("click", function (e) {
                map.clearOverlays();
                var point = new BMap.Point(e.point.lng, e.point.lat);
                var marker = new BMap.Marker(point);// 创建标注
                map.addOverlay(marker);
                Comm.getmap.maplng = e.point.lng;
                Comm.getmap.maplat = e.point.lat;
                var infoWindow = new BMap.InfoWindow(html, opts);  // 创建信息窗口对象 
                map.openInfoWindow(infoWindow, point); //开启信息窗口

                var url = 'http://api.map.baidu.com/geocoder/v2/?callback=renderReverse&location=' + Comm.getmap.maplat + ',' + Comm.getmap.maplng + '&output=json&pois=1&ak=LsAGblWKqeWtwRWgmm0AWAm7QAOLW96Y';
                $.ajax({
                    url: url, type: 'post', cache: false,
                    success: function (a) {
								var data={};
								data.lng=e.point.lng;
								data.lat=e.point.lat;
								data.radius=-1;
								data.province=a.result.addressComponent.province;
								data.city=a.result.addressComponent.city;
								data.county=a.result.addressComponent.district;
								data.addr=a.result.formatted_address;//+ a.result.sematic_description;						
                       cb&&cb(data);
                    }, error: function (e) {
                        //Comm.message(e);
                    }, dataType: 'jsonp'
                });
            });
        }
    };		
	/*--------------------公共函数-----------------------*/
	/*处理示申明对象undefined*/
	z.un=function(){return 'undefined'};
	//尝试转化str to json
	z.parse=function(s){
		var o;
		try{
			o=JSON.parse(s);
		}
		catch(e){
			o=s;
		}
		return o;
	}
	//尝试执行根方法
	z.exec=function(m){
		if(window[m]){
			var a=[];
			for (var i=1;i<arguments.length;i++)
				a[i-1]=arguments[i];
			window[m].apply(null,a);
		}
	}
	//处理统一回调事件
	z.callback=function(d,code){
		if(Mess.show)
			Mess.close();
		_w9_wcallback(d,code);
	}
	//是否处理微信中
	z.wx=function(){return navigator.userAgent.toLocaleLowerCase().indexOf('micromessenger')>-1}
	//是否是ios
	z.ios=function(){return window.webkit!=null&&window.webkit.messageHandlers!=null&&!z.wx();}
	//是否为原生
	z.w9=function() {return (window['WeiLai']||z.ios());}
	//重写getElementById
	z.g=function(id){return document.getElementById(id);}
	//代替JQ
	z.$1=function(s){return document.querySelector(s);}
	z.$=function(s){return document.querySelectorAll(s);}
	//获取URL查询参数,
	//如果未传入参数n，则返回所有查询内容
	//如果u,未指定，则取本页地址
	z.query=function (n, u) {
		var s = u; if (s == null) s = self.location.href;
		if (n) {
			var g = new RegExp("(\\?|&)" + n + "=([^&|#]*)");var r = s.match(g);
			if (r) {try { return decodeURIComponent(r[2]); } catch (err) { return unescape(r[2]); } } else return null;
		} else {
			var i = s.indexOf("?"); if (i === -1) return null; return s.substr(i + 1);
		}		
	}
	//执行标准动画
	z.run=function(e){
		if(window.requestAnimationFrame)
			return requestAnimationFrame(e);
		else
			return setTimeout(e,1000/60);
	}
	//根据句柄停止动画
	z.stop=function(h){
		(window.cancelRequestAnimationFrame||clearTimeout)(h);
	}
	/*---------------------原生支持-------------------------*/
	/*
		跳转新页面
		url：【必】需要跳转的地址，
		cb：【非】【仅原生支持】当页面重新返回后需要执行的方法，执行顺序在resume之后	
	*/
	z.go=function(url,cb){
		if(z._pageinfo.test)
			url=AJAX.WebRoot()+url;
		if(z.w9()){
			z._pageinfo.resume=cb;
			callNative('go',url);
		}
		else{
			var list=Comm.sdb(URLIST);
			if(list==null)list=[];
			list.push(self.location.href);
			z.sdb(URLIST,list);		
			self.location.href=url;
		}	
	}
	//直接跳转，不弹出新页面
	z.goself=function(url){
		if(z._pageinfo.test)
			url=AJAX.WebRoot()+url;
		self.location.href=url;
	}
	/*
		返回栈顶
		url:【必】	如果url==‘’直接返回栈顶,如果url！=‘’关闭栈上所以层，本页跳转为新页面
	*/
	z.gotop=function(url){
		if(url==null)url='';
		if(z._pageinfo.test)
			url=AJAX.WebRoot()+url;
		if(z.w9()){
			callNative('gotop',url);
		}
		else{
			if (url===''){
				var list=z.sdb(URLIST);
				if(list==null||list.length==0)
					return;
				url=list[0];
			}
			z.sdb(URLIST,[]);
			self.location.href=url;
		}
	}
	//关闭页面c需要返回的层数，默认为1
	z.close=function(c){
		if(c==null||c<1)c=1;
		if(z.w9()) callNative('close',c)
		else{
			var list=z.sdb(URLIST);
			var a;
			if(!(list==null||list.length===0)){
				for(var i=0;i<c;i++)
					a=list.pop();
				z.sdb(URLIST,list);
			}
			self.location.href=a?a:'index.html';
		}
	}
	//判断当前网络是否为wifi环境
	z.isWiFi=function(cb){
		if(z.w9())callNative('isWiFi',setcb(cb));
	}
	//清理缓存
	z.clearCache=function(cb){
		if(z.w9())callNative('clearCache',setcb(cb));
	}
	//注册推送--state:1注册0注销
	z.registerPush=function(state, cb){
		if(z.w9())
			callNative('registerPush',{state:state, code:setcb(cb)});
		else
			cb&&cb(1);
	}
	//设置推送
	z.setPush=function(jsonObj,cb){
		jsonObj['code']=setcb(cb);
		if(z.w9())callNative('setPush',jsonObj);
	}
	//上传图片
	z.upimg=function(jsonObj,cb){
		jsonObj['code']=setcb(cb);
		if(z.w9())callNative('upimg',jsonObj);
			//上传图片
	}
	//扫描二一维码
	z.scanf=function(cb){
		if(z.w9())callNative('scanf',setcb(cb));
	}
	//定位
	z.position=function(cb){
		if(z.w9())callNative('position',setcb(cb));
	},
	//从地图上选择点,如果是微信则需要地图容器box
	z.selectPosition=function(cb,box){
		if(z.w9())callNative('selectPosition',setcb(cb));
		else Map.show(box,cb);
	}
	//分享
	z.shareUrl=function(jsonObj,cb){
		jsonObj['code']=setcb(cb);
		if(z.w9())callNative('shareUrl',jsonObj);
	},
	//七鱼客服
	z.qiyu=function(jsonObj){
		if(z.w9())callNative('qiyu',jsonObj);
	}
	//网络请求get
	z.get=function(jsonObj,cb){
		jsonObj['code']=setcb(cb);
		if(z.w9())callNative('get',jsonObj);
	}
	//网络请求post
	z.postData=function(jsonObj,cb){
		jsonObj['code']=setcb(cb);
		if(z.w9())callNative('postData',jsonObj);
	}
	//数据获取
	z.storage=function(key,cb){
		if(z.w9())
			callNative('storage',{key:key, code:setcb(cb,true)});
		else if(cb){			
			cb(z.db(key));
		}
	}
	//设置缓存数据,如果value=null，则删除对象
	z.storageValue=function(key, value, cb){
		if(z.w9()){
			if(value!=null)value=enData(value);
			callNative('storageValue',{key:key, value:value, code:setcb(cb)});
		}
		else {
			z.db(key, value);
			cb&&cb();
		}
	}
	//设置手机转向
	z.rotate=function(value){
		//1值竖向展示【默认】,	2横向展示
		if(z.w9())callNative('rotate',value===1?1:2);
	}
	//提示框
	z.alert=function(mess,cb){
		if(mess==null||mess==="")return;
		var a={code:setcb(cb),mess:mess};			
		if(z.w9())callNative('alert',a);
		else Mess.alert(mess,a.code);
	}
	//确认框
	z.confirm=function(mess,cb){
		if(mess==null||mess==="")return;
		var a={code:setcb(cb),mess:mess};			
		if(z.w9())callNative('confirm',a);
		else Mess.confirm(mess,a.code);
	}
	//提示消息
	z.message=function(mess){			
		if(z.w9())callNative('message',mess);
		else Message.show(mess);
	}
	//第三方登录 type:凭证类别 1微信，2QQ
	z.extLogin=function(jsonObj,cb){
		if(z.w9()){
			jsonObj['code']=setcb(cb);
			callNative('extLogin',jsonObj);
		}
	}
	/*跳转第三方地图导航*/
	z.navigation = function(obj){
		if(z.w9())
			callNative("navigation",obj);
	}
	//支付
	z.pay=function(jsonObj,cb){
		jsonObj['code']=setcb(cb);
		if(z.w9())callNative('pay',jsonObj);			
	}
	//设备信息
	z.deviceInfo=function(cb){
		if(z.w9())callNative('deviceInfo',setcb(cb));		
	}
	//获取用户通讯录
	z.getAddressBook=function(cb){
		if(z.w9())callNative('getAddressBook',setcb(cb));	
	}
	//文本复制
	z.copyText=function(str){
		if(z.w9())callNative('copyText',str);
	}
	//获取软件版本号
	z.getVersion=function(cb){
		if(z.w9())callNative('getVersion',setcb(cb));	
	}
	//获取token
	z.getPushToken=function (cb) {
		if(z.w9())callNative('getPushToken',setcb(cb));
	}
	//打开外部浏览器
	z.openUrlStr=function (url) {
		if(z.w9())callNative('openUrlStr',url);
    }
	/*设置android可首页事件*/
	z.setAndroidHome=function(){
		z._pageinfo.android_home=1;
	}
	z.OSS={/*阿里云oss工具*/		
		host:function(){return window['config']&&window.config['ossroot']?config.ossroot:'';},/*oss访问地址*/
		/*
		获取图片访问地址
		uri:数据库中保存的文件地址
		type:显示类型 	取值:s|m|l
		 */
		getImgUrl:function(uri,type){
			if(uri==null)
				return "-----------error";
			if(uri.length>=4 && uri.indexOf("http")>-1)
				return uri;
			var url=z.OSS.host()+uri;
			if(type){
				url +="/";
				switch(type){
					case 'l':url+='800';break;
					case 'f':url+='480';break;
					case 'm':url+='250';break;
					case 's':url+='120';break;
				}
			}
			return url;
		}
	};	
	/*------------UI公共函数------------------------*/
	//显示门蒙层 Z-index，请查看CSS=999，由计数器控制关闭，cls是否强制关闭，
	//如果要显示在上层，请将 z-index调到更高
	z.bg=function(show,cls){
		if(cls)
			MainBg.close();
		else
			MainBg.show(show);
	}
	/*wtdid:模板id ,<div id="sinbox" wtd="模板ID"></div>
	cancel：点击背景是否可以取消*/
	z.showWindow=function(wtdid,cancel){
		if(wtdid)WTD.show(wtdid,cancel);else WTD.hide();
	}
	/*s相当于localStorage,如果用于原生page之间共享数据，请storate*/
	z.db=function(t,v){
		if(v==null){
			if(arguments.length===1) {
				return z._deData(localStorage[t]);
			} else {
				localStorage.removeItem(t);
			}
		} else {
			localStorage[t]=enData(v);
		}
	}
	/*相当于sessionStorage,用于会话存储，不可作为持久存储*/
	z.sdb=function(t,v){
		if(v==null){
			return z._deData(sessionStorage[t]);
		}
		sessionStorage[t]=enData(v);
	}
	/*主动弹出加载效果
	arg,显示文字，如果不传入则表示关闭 */
	z.loading=function(arg){
			Loading.show(arg);
	}
	//统一管理调试输出，发布时，一键屏蔽
	z.log=function(v){
		console.log(v);	
	}
	/*用于加载刷新按钮*/
	z.showreload=function(){
		var b=document.createElement('button');
		b.setAttribute("style","z-index:999999;position:fixed;top:55px;right:5px;");
		b.onclick=function(){document.location.reload()};
		b.value="刷新";
		document.body.appendChild(b);
	}
	//计算框架高度
	z.resizeSection=function(){
		//判断安卓还是ios
		if (Comm.ios()){//如果是ios 头部padding
			//Comm.message("是ios")
			$("header").css("padding-top","20px")
		}
		var h = Comm.$1('body >header'),
			f = Comm.$1('body >footer'),
			s = Comm.$1('body >section');
		if (s) {
			s.style.height = (window.innerHeight - (h ? h.offsetHeight : 0) - (f ? f.offsetHeight : 0)) + 'px';
		}
	}	
};
/*设置android输入框事件，在需要处理的输入框完成后调用即可*/
function setAndroidKeyboard(ele,sheight) {
    (sheight==null)&&(sheight=0);
    if(Comm.weiLai() && !Comm.iOS() && !window.androidKb) {
        window.androidKb={section:null,input:null,f:function (f) {
            window.androidKb.input = f.target;
        },b:function (b) {
            setTimeout(function () {window.androidKb.input=null;},300)
        }};
        window.keyBoardEvent=function(show, ratio) {
            if(window.androidKb.input && window.androidKb.section) {
                if(show) {
                    var keyboardHeihgt = window.innerHeight*ratio+sheight;
                    var inputBottom = window.innerHeight - window.androidKb.input.getBoundingClientRect().bottom;
                    if(inputBottom<keyboardHeihgt){
                        window.androidKb.section.style.transform="translate(0px,-"+(keyboardHeihgt-inputBottom)+"px)";
                    }
                } else {
                    $("input,textarea").blur();
                    window.androidKb.section.style.transform="translate(0px,0px)";
                }
            }
        };
    }
    if(window.androidKb) {
        window.androidKb.section = ele?ele:document.getElementsByTagName("section")[0];
        $("input,textarea").unbind(window.androidKb.f).focus(window.androidKb.f);
        $("input,textarea").unbind(window.androidKb.b).blur(window.androidKb.b);
    }
}
function resumeAndroidKeyboard() {
    if(window.androidKb&&window.androidKb.section)
        window.androidKb.section.style.transform="translate(0px,0px)";
}
//加载成功，刷新高度
if(document.addEventListener){document.addEventListener("DOMContentLoaded", Comm.resizeSection, false);}
//初始化页面
window.onload=function(){
	if(window['config']&&config['isTest']!=null)Comm._pageinfo.test=config['isTest'];
	Comm.resizeSection();
	if(Comm._pageinfo.test){Comm.showreload();window.onerror=function(e){Comm.alert('脚本错误:'+e);}}
	Comm.exec("pageload");
};

//解决弹出键盘遮挡输入框
window.addEventListener("resize", function () {
	if (document.activeElement.tagName == "INPUT" || document.activeElement.tagName == "TEXTAREA") {
		window.setTimeout(function () {
			document.activeElement.scrollIntoView(true);
			document.activeElement.scrollIntoViewIfNeeded(true);
		}, 100);
	}
	Comm.resizeSection();
})

//解决返回按钮--针对微信
//window.onpageshow = function (e) {if (e.persisted)window.location.reload(true)}
