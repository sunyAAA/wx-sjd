//box--上传图片容器id
//maxing--允许上传图片的最大数量
//subbutton--提交图片的按钮id
//如果需要单张图片显示，并且无删除，点击重新上传，只需传入box参数为上传的按钮id
function imgUploader(box,maximg,subbutton) {
    //初始化内部变量
    this.imgList=[];
    if(arguments.length===1){
        this.subbutton = box;
        this.maximg = 1;
    } else {
        box = document.getElementById(box);
        this.box = box;
        !maximg&&(maximg=6);
        this.maximg=maximg;
        this.subbutton=subbutton;
    }

    imgUploader[this.subbutton]=this;

    var me = this;
    if (Comm.w9()) {
        document.getElementById(this.subbutton).onclick = function () {
            var obj = {url:config.http+'/api/imgupload/app/getUploadToken?_token='+Comm.db("_token"), remain:me.box?(me.maximg-me.imgList.length):1};
            Comm.upimg(obj, function (a) {
                var as = a.split(",");
                for(var i=0;i<as.length;i++){
                    if(as[i].length>5){
                        me.add(as[i]);
                    }
                }
                me.success&&me.success();
            });
        };
    }
    else {
        this.initLoder(this.subbutton, function (a) {me.add(a);me.success&&me.success();}, {width: 400});
    }
}

imgUploader.prototype.add=function (a) {
    if(a.length<5){
        Comm.message('上传失败');
        return;
    }
    if(!this.box)
        this.imgList = [];
    if(this.box)
        this.addImgItem(a, true);
    else
        this.fillimgs([a],false);
};
imgUploader.prototype.addImgItem = function (src, del) {
    this.imgList.push(src);
    var ibox = document.createElement("DIV");
    if(this.resize) {
        ibox.style.width = this.width + "px";
        ibox.style.height = this.height + "px";
    }
    ibox.className = "box";
    ibox.innerHTML = '<img onerror="this.src=\''+this._errorSrc+'\';this.onerror=null" class="upimg" src="' + Comm.OSS.getImgUrl(src,'s',this._errorSrc) + '">' + (del?'<div class="upimg-del" onclick="imgUploader[\''+this.subbutton+'\'].del('+(this.imgList.length-1)+')"></div>':'');
    this.box.appendChild(ibox);
    
    this.imgList.length >= this.maximg ? $("#"+this.subbutton).parent().css({"opacity":0,"visibility":"hidden"}) : $("#"+this.subbutton).parent().css({"opacity":1,"visibility":"visible"});
};
imgUploader.prototype.del=function (i) {
    var me = this;
    Comm.confirm('您确定要删除该图片？',function(a){
        if(parseInt(a)>0) {
            if(me.imgList.length-1>=i){
                me.imgList.splice(i,1);
                me.delimgs(i,1);
            }
        }
   		me.imgList.length >= me.maximg ? $("#"+me.subbutton).parent().css({"opacity":0,"visibility":"hidden"}) : $("#"+me.subbutton).parent().css({"opacity":1,"visibility":"visible"});       
    });
};
imgUploader.prototype.fill=function (del) {
    var s=[],d=this.imgList;
    if(this.box) {
        del==null&&(del=true);
        for (var i=0;i<d.length;i++)
            this.addImgItem(d[i]);
    } else {
        var cimgUrl = this.imgList.length>0?this.imgList[0]:'img/error.png';
        var cimg = document.querySelector("#"+this.subbutton+">img");
        if(cimg) cimg.src = Comm.OSS.getImgUrl(cimgUrl,'s');
    }
    if(typeof this.fillFinish === "function")
        this.fillFinish();
};
imgUploader.prototype.delimgs = function (index, length) {
    if(this.box) {
        var cs = this.box.childNodes;
        for(var i=index;i<index+length;i++) {
            if(cs.length>i) {
                this.box.removeChild(cs[i]);
            }
        }
    }
};
imgUploader.prototype.fillFinish = function () {};
imgUploader.prototype.setFinish = function (cb) {
    this.fillFinish = cb;
};
imgUploader.prototype.fillimgs=function(imgs, del){
    del==null&&(del=true);
    this.imgList=imgs;
    this.fill(del);
};
imgUploader.prototype.getList=function() {
    Prompt.hide()
    return this.imgList;
};
imgUploader.prototype.setErrorSrc=function (s) {
    this._errorSrc=s;
};
imgUploader.prototype._errorSrc='img/error.png';
imgUploader.prototype.setSize = function (w, h) {
    !w&&(w=70);
    if(arguments.length===1)
        h=w;
    else
        !h&&(h=70);
    $("#"+this.subbutton).parent().width(w);
    this.width = w;
    $("#"+this.subbutton).parent().height(h);
    this.height = h;
    this.resize=true;
};

//plupload相关操作
imgUploader.prototype.initLoder = function(button, cb, resize) {
    //初始化变量
    this._uploder=this._callback=this._resize=null;
    if (resize == null)
        resize = {width: 800, crop: false};
    this._resize = resize;
    this._callback = cb;

    var me = this;
    this._uploder = new plupload.Uploader({
        runtimes: 'html5',
        browse_button: button,
        multi_selection: false,
        container: document.getElementById(button).parentpNode,
        url: 'http://oss.aliyuncs.com',
        filters: {
            /*mime_types: [
                {title: "图片文件", extensions: "jpg,png"}
            ],*/
            max_file_size: '10mb',
            prevent_duplicates: true
        },
        resize: me._resize,
        init: {
            PostInit: function (up) {},
            FilesAdded: function (up, files) {
                addFile(files);
                Prompt.loading()
                // $('#UpImageBox .back')[0].onclick=function () {
                //     closeSelf(up)
                // };

               +function () {
                    if (up_isup)return;
                    up_isup = true;
                    !me.box &&(me.imgList=[]);
                    initParam(up, files[0].name, false);
                    return false;
                }();
            },
            BeforeUpload: function (up, file) {},
            UploadProgress: function (up, file) {
            },
            FileUploaded: function (up, file, info) {
                up_isup = false;
                if (info.status == 200) {
                    me._callback && me._callback(up_g_filename);
                    closeSelf(up);
                }
                else
                    UploderError(info.response);
            },
            Error: function (up, err) {
                UploderError(err.response ? err.response : err.message);
            }
        }
    });
    this._uploder.init();
};



//上传通用操作
var up_token = null, up_expire = 0, up_isup = false, up_g_filename = '';

document.write('<script src="inc/upimg/plupload.full.min.js" type="text/javascript"></sc' + 'ript>');
if(!document.getElementById("UpImageBox")) {
    var up_box = document.createElement('DIV');
    up_box.id = 'UpImageBox';
    up_box.innerHTML = '<div class="nav"><span class="back"></span><span class="select">使用</span></div>'
        + '<div class="content"><div class="mask"></div></div><div class="upmess"></div>';
    document.body.appendChild(up_box);
}

function get_signature() {
    if (up_expire < Date.parse(new Date()) / 1000 + 3) {
        var xmlhttp = new XMLHttpRequest();
        serverUrl = config.http + "/api/imgupload/getImgPolicy?_token="+Comm.db("_token");
        xmlhttp.open("GET", serverUrl, false);
        xmlhttp.send(null);
        up_token = JSON.parse(xmlhttp.responseText);
        if(up_token.Expiration)
            up_expire = parseInt(up_token.Expiration);
    }
}

function calcName(filename) {
    var pos = filename.lastIndexOf('.'), tag = '';
    if (pos > -1)
        tag = filename.substring(pos);
    return up_g_filename = up_token.dir + '/' + up_token.filename + tag;
}

function initParam(up, filename, ret) {
    if (!ret)
        get_signature();
    doupload(up, filename);
}

function doupload(up, filename) {
    var mps = {
        'key': calcName(filename),
        'policy': up_token.policy,
        'OSSAccessKeyId': up_token.accessid,
        'success_action_status': '200',
        'callback': up_token.callbackbody,
        'signature': up_token.signature,
    };

    up.setOption({
        'url': config.ossroot,
        'multipart_params': mps
    });
    up.start();
}

function addFile(files) {
    if (files.length > 1) {
        files.splice(0, files.length - 1);
    }
    var file = files[0];
    var preloader = new mOxie.Image();
    preloader.onload = function () {
        preloader.downsize(300, 300, 90);
        var imgsrc = preloader.getAsDataURL();
        preloader.destroy();
        preloader = null;
    };
    preloader.load(file.getSource());
}

function closeSelf(up) {
    if(up){
        up.splice(0, up.files.length);
        if (up_isup) {
            up.stop();
            up_isup = false;
        }
    }
}

function UploderError(msg) {
    Comm.message(msg);
    closeSelf();
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