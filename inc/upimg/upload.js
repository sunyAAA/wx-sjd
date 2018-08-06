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
            var obj = {url:config.root+'api/imgupload/app/getUploadToken?_token='+Comm.db("_token"), remain:me.box?(me.maximg-me.imgList.length):1};
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
        container: document.getElementById(button).parentNode,
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

                $('#UpImageBox .back')[0].onclick=function () {
                    closeSelf(up)
                };

                $('#UpImageBox .select')[0].onclick=function () {
                    if (up_isup)return;
                    up_isup = true;
                    !me.box &&(me.imgList=[]);
                    setMess(true);
                    setMark(100);
                    initParam(up, files[0].name, false);
                    return false;
                };
            },
            BeforeUpload: function (up, file) {},
            UploadProgress: function (up, file) {
                setMark(100 - file.percent);
            },
            FileUploaded: function (up, file, info) {
                up_isup = false;
                setMess(false);
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
        serverUrl = config.root + "api/imgupload/getImgPolicy?_token="+Comm.db("_token");
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
    setMark(0);
    setMess(false);
    if (files.length > 1) {
        files.splice(0, files.length - 1);
    }
    var file = files[0];
    var preloader = new mOxie.Image();
    preloader.onload = function () {
        preloader.downsize(300, 300, 90);
        var imgsrc = preloader.getAsDataURL();
        $('#UpImageBox .content').css('backgroundImage', 'url(' + imgsrc + ')');
        preloader.destroy();
        preloader = null;
    };
    preloader.load(file.getSource());
    Comm.bg(true);
    $('#UpImageBox').show();
}

function closeSelf(up) {
    if(up){
        up.splice(0, up.files.length);
        if (up_isup) {
            up.stop();
            up_isup = false;
        }
    }
    $('#UpImageBox').hide();
    $('#UpImageBox .content').css("backgroundImage", "none");
    Comm.bg(false);
}

function UploderError(msg) {
    Comm.message(msg);
    closeSelf();
}

function setMess(l) {
    $('#UpImageBox .upmess').html(l ? '正在努力上传，请稍候...' : '');
}

function setMark(w) {
    $('#UpImageBox .mask').css("width", w === 0 ? '0px' : w + '%');
}
