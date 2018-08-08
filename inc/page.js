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
	http:'http://sjd.itan8.net/',
	// webroot: "http://wh.feiyingbao.com.cn/", //网址地址
	ossroot:'https://liangzhizheng.oss-cn-hangzhou.aliyuncs.com/'
};

// var config = {
//     http: 'https://yuronfu.com/finance/',
//     // http:'http://192.168.2.125:8080/',
//     ossroot: 'https://yuronfu.com/finance/', //oss根路径
// };
if (top.location.href.indexOf("www.") > -1)
    top.location.href = top.location.href.replace("www.", "");
document.write('<script src="inc/layer_mobile/layer.js"></script>');
// window.onload = function() {
//     var d = null;
//     if (Nav.h.length > 0) {
//         var o = Nav.h[Nav.h.length - 1];
//         if (o)
//             d = o.d;
//     }
//     window.didLoad && didLoad(d);

//     +

//     function() {
//         //普通网页不进行微信授权
//         if (navigator.userAgent.toLocaleLowerCase().indexOf('micromessenger') < 0)
//             return;
//         window.showDict = { 'casedetail': 1, 'guide': 1, 'index': 1, 'my': 1, 'personal': 1, 'charge': 1, 'neworg': 1 };
//         var url = location.href.split("#")[0];
//         if (url) {
//             var urls = url.split("/");
//             url = urls[urls.length - 1];
//             if (url) {
//                 url = url.split(".")[0];
//                 if (!showDict[url]) {
//                     loadJS("https://res.wx.qq.com/open/js/jweixin-1.2.0.js", function() {
//                         loadJS("inc/wx.js", function() {
//                             Prompt.loading();
//                             WXMethod.config(['hideMenuItems'], function() {
//                                 wx.hideMenuItems({
//                                     menuList: ['menuItem:share:appMessage', 'menuItem:share:timeline', 'menuItem:share:qq', 'menuItem:share:weiboApp', 'menuItem:favorite', 'menuItem:share:facebook', 'menuItem:share:QZone']
//                                 });
//                                 Prompt.hide();
//                             });
//                         })
//                     })
//                 }
//             }
//         }
//     }();
// };

// function loadJS(src, callback) {
//     var script = document.createElement('script');
//     var head = document.getElementsByTagName('head')[0];
//     script.src = src;
//     head.appendChild(script);
//     if (typeof callback === 'function') {
//         script.onload = script.onreadystatechange = function() {
//             if (!script.readyState || /loaded|complete/.test(script.readyState)) {
//                 callback();
//             }
//         }
//     }
// }
var Local = new function() {
    this.get = function(k) {
        var s = localStorage.getItem(k);
        try {
            s = JSON.parse(s);
        } catch (e) {}
        return s;
    };
    this.sget = function(k) {
        var s = sessionStorage.getItem(k);
        try {
            s = JSON.parse(s);
        } catch (e) {}
        return s;
    };
    this.save = function(k, v) {
        if (v || v === 0) {
            if (typeof v !== "string")
                v = JSON.stringify(v);
            localStorage.setItem(k, v);
        } else
            console.log('数据储存错误！！！');
    };
    this.ssave = function(k, v) {
        if (v || v === 0) {
            if (typeof v !== "string")
                v = JSON.stringify(v);
            sessionStorage.setItem(k, v);
        } else
            console.log('数据储存错误！！！');
    };
    this.del = function(k) {
        localStorage.removeItem(k);
    };
    this.sdel = function(k) {
        sessionStorage.removeItem(k);
    };
    this.user = function(u) {
        return Local.get('u')
    };
    this.deluser = function() {
        localStorage.removeItem("mjruser");
    };
};
var Nav = new function() {
    var t = this;
    t.go = function(u, d) {
        t.h.push({ u: u, d: d });
        top.location.href = u;
    };
    t.addhis = function(u) {
        t.h.push({ u: u });
    };
    t.back = function(times) {
        !times && (times = 1);
        for (var i = 0; i < times; i++)
            t.h.pop();
        if (t.h.length > 0) {
            var o = t.h[t.h.length - 1];
            if (o) {
                top.location.href = o.u;
                return;
            }
        }
    };
    t.remove = function(s, l) {
        var his = Local.sget('his');
        !his && (his = []);
        var tl = his.length;
        var nhis = [];
        for (var i = 0; i < tl; i++) {
            if (his.length > 0) {
                var h = his.pop();
                if (i < s || i >= s + l) nhis.push(h);
            }
        }
        nhis.reverse();
        t.h = nhis;
    };
    t.gotop = function() {
        Local.sdel("his");
        top.location.href = 'index.html'
    };
    t.query = function(n, u) {
        if (n == null) {
             return null;
           n = self.location.search;
            if (n && n !== "") try { return decodeURIComponent(n.replace("?", "")) } catch (err) {}
        }
        var s = u;
        if (s == null) s = self.location.href;
        if (n) {
            var g = new RegExp("(\\?|&)" + n + "=([^&|#]*)");
            var r = s.match(g);
            if (r) { try { return decodeURIComponent(r[2]); } catch (err) { return unescape(r[2]); } } else return null;
        } else {
            var i = s.indexOf("?");
            if (i === -1) return null;
            return decodeURIComponent(s.substr(i + 1));
        }
    };

    t.h = Local.sget("his");
    !t.h && (t.h = []);
};

var AJAX = new function() {
    var _xhr, t = this,
        autherr = false;

    function finish(v, cb, ex) {
        if (cb == null) return;
        var o;
        if (v && v.length > 1) {
            try { o = JSON.parse(v); } catch (e) { o = v; }
        }
         if (o) {
            if (ex.o) cb(o);
            else {
                if (o.code === 1)
                    cb(o.data);
                else {
                    if (!ex.n) Prompt.msg(o && o.msg ? o.msg : '网络异常，请稍后再试');
                    Prompt.hide();
                }
            }
        }
    }

    function init(post, url, data, cb, ex) {
        !ex && (ex = {});
        !data && (data = {});
        var u = Local.user();
        if (url.indexOf("http") !== 0)
            url = t.Uri() + url;
        if (!post) {
            if (url.indexOf("_token") < 0)
                url += (url.indexOf("?") <= -1 ? "?" : "&") + "_token=" + (u ? u.token : "918aca55dc8d0586a1e4e7918340c5") + "&_device=" + Device.type + "&_t=" + Math.random();
        } else {
            if (!data._token) {
                data._device = Device.type;
                data._token = u ? u.token : "918aca55dc8d0586a1e4e7918340c5";
                data._t = Math.random();
            }
        }
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (parseInt(this.readyState) === 4) {
                if (parseInt(this.status) === 200) {
                    finish(this.responseText, cb, ex);
                } else {
                    if (!ex.n) Prompt.msg('服务器异常，请稍后再试');
                    Prompt.hide();
                }
            }
        };
        xhr.open(post ? 'POST' : 'GET', url, true);
        if (post) {
            data = deobj(data);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhr.send(data);
    }

    function deobj(obj) {
        if (obj == null) return '';
        var s = [];
        for (var i in obj) {
            if (typeof(obj[i]) == typeof('')) {
                if (obj[i].indexOf('%') > 0)
                    obj[i] = obj[i].replace(/%/g, "%25");
                if (obj[i].indexOf('&') > 0)
                    obj[i] = obj[i].replace(/\&/g, "%26");
                if (obj[i].indexOf('+') > 0)
                    obj[i] = obj[i].replace(/\+/g, "%2B");
            }
            s.push(i + '=' + obj[i])
        }
        return s.join('&');
    }
    /*----AJAX公用方法-----*/

    /*获取服务器接口根路径*/
    t.Uri = function() {
        return window.config && config.http ? config.http : "";
    };
    /*执行GET方法，一般用于从服务器获取数据，api长度尽量不超过1000字节*/
    t.GET = function(api, cb, ex) {
        init(false, api, null, cb, ex);
    };
    /*执行POST方法，一般用于向服务器提交数据，data建议不为空*/
    t.POST = function(api, data, cb, ex) {
        init(true, api, data, cb, ex);
    };
    t.OSS = { /*阿里云oss工具*/
        host: function() { return window.config && config.ossroot ? config.ossroot : ''; },
        /*oss访问地址*/
        /*
        获取图片访问地址
        uri:数据库中保存的文件地址
        type:显示类型 	取值:s|m|l
         */
        getImgUrl: function(uri, type) {
            if (!uri || uri == 'null')
                return "img/error.png";
            if (uri.length >= 4 && uri.indexOf("http") > -1)
                return uri;
            if (uri.indexOf("storage/") < 0)
                uri = "storage/" + uri;
            var url = AJAX.OSS.host() + uri;
            if (type) {
                switch (type) {
                    // case 'f':url+='/800';break;
                    // case 'm':url+='/250';break;
                    // case 's':url+='/120';break;
                }
                // url +=webpSupport?"_webp":"";
            }
            return url;
        }
    }
};
if (self === top) {
    window.Prompt = new function() {
        var t = this;
        t.tag = 0, t.cover = 0, t.cbs = [];
        this.loading = function(msg) {
            if (t.cover <= 0) {
                t.cover = 0;
                t.tag = layer.open({ type: 2, shadeClose: false, content: msg });
                t.cover++;
            }
        };
        this.hide = function() {
            t.cover--;
            if (t.cover <= 0) {
                layer.close(t.tag);
                t.cover = 0;
            }
        };
        this.msg = function(msg) {
            layer.open({ content: msg, shadeClose: false, skin: 'msg', time: 3 });
        };
        this.alert = function(msg, cb) {
            t.cbs.push(cb);
            layer.open({
                content: msg,
                shadeClose: false,
                btn: '确认',
                yes: function(index) {
                    layer.close(index);
                    t.end(1);
                }
            });
        };
        this.confirm = function(msg, cb) {
            t.cbs.push(cb);
            layer.open({
                content: msg,
                shadeClose: false,
                btn: ['确认', '取消'],
                yes: function(index) {
                    layer.close(index);
                    t.end(1);
                },
                no: function() {
                    t.end(0);
                }
            });
        };
        this.show = function(ct, cb) {
            t.cbs.push(cb);
            var tag = layer.open({ type: 1, content: ct, anim: 'up', style: 'width:80%;height:auto;border:none;border-radius:8px;overflow:hidden' });
            t.shows.push(tag);
        };
        this.shows = [];
        this.closeShow = function() {
            if (t.shows.length > 0) {
                var tag = t.shows.pop();
                layer.close(tag);
            }
        };
        this.action = function(tt, bs, cb) {
            t.cbs.push(cb);
            var btns = [];
            for (var i = 0; i < bs.length; i++) {
                btns.push('<div onclick="Prompt.closePop(this);Prompt.end(' + i + ');" class="btn' + (i !== 0 ? ' nt' : '') + (i !== bs.length - 1 ? ' nb line' : '') + ' line">' + bs[i] + '</div>')
            }
            var p = document.querySelector(".popbox");
            if (!p) {
                p = document.createElement("DIV");
                p.className = "popbox";
                document.body.appendChild(p);
            }
            p.innerHTML = '<div class="btmbox">' + btns.join("") + '<div onclick="Prompt.closePop(this);" class="btn" style="margin-top: 10px; color: #737373">取消</div></div>';
            p.style.display = "block";
        };
        this.closePop = function(e) {
            if (e) {
                var p = e.position;
                e.style.position = 'relative';
                var cv = document.createElement("DIV");
                cv.className = '_btnCover';
                e.appendChild(cv);
                setTimeout(function() {
                    end(e, cv);
                    var p = document.querySelector(".popbox");
                    if (p) p.parentNode.removeChild(p);
                }, 150);
            }

            function end(e, cv) {
                e.removeChild(cv);
                e.style.position = p;
                cv = null;
            }
        };
        this.tempf = null;
        this.end = function(d) {
            if (t.cbs.length > 0) {
                var f = t.cbs.pop();
                t.tempf = f;
                if (typeof f === "function") f(d);
            }
        };
        this.remainEvent = function() {
            if (t.tempf)
                t.cbs.push(t.tempf);
        }
    };
} else
    window.Prompt = top.Prompt;



var Comm = new function() {
    this.active = function(e) {
        if (e) {
            var p = e.position;
            e.style.position = 'relative';
            var cv = document.createElement("DIV");
            cv.className = '_btnCover';
            e.appendChild(cv);
            setTimeout(function() {
                end(e, cv);
            }, 150);
        }

        function end(e, cv) {
            if (cv.parentNode)
                cv.parentNode.removeChild(cv);
            e.style.position = p;
            cv = null;
        }
    };
    this.time = function(timespan, format) {
        timespan = parseInt(timespan);
        !format && (format = "yyyy-MM-dd HH:mm");
        var t = new Date(timespan);
        var date = {
            "M+": t.getMonth() + 1,
            "d+": t.getDate(),
            "H+": t.getHours(),
            "m+": t.getMinutes(),
            "s+": t.getSeconds(),
            "q+": Math.floor((t.getMonth() + 3) / 3),
            "S+": t.getMilliseconds()
        };
        if (/(y+)/i.test(format)) {
            format = format.replace(RegExp.$1, (t.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (var k in date) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
                    date[k] : ("00" + date[k]).substr(("" + date[k]).length));
            }
        }
        return format;
    };
    this.go = Nav.go;
    this.close = Nav.back;
    this.remove = Nav.remove;
    this.query = Nav.query, this.OSS = AJAX.OSS;
    this.gotop = Nav.gotop;
    this.radioNumber = function(a) {
        !a&&(a=0);
        return parseInt(parseFloat(a) * 10000)/100 + "%";
    };

    +

    function() {
        var ides = document.querySelectorAll("[id]");
        for (var i = 0; i < ides.length; i++) {
            var idn = ides[i].getAttribute("id");
            window['id_' + idn] = ides[i];
        }
    }();
};

Comm.toMoney = function(number, places, symbol, thousand, decimal) {
    places = !isNaN(places = Math.abs(places)) ? places : 2;
    symbol = symbol !== undefined ? symbol : "";
    thousand = thousand || ",";
    decimal = decimal || ".";
    negative = number < 0 ? "-" : "",
        i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
};
Comm.fix2Number = function(a) {
    !a && (a = 0);
    return parseInt(parseFloat(a) * 10000) / 100 + "%";
};
Comm.projState = function(s) {
    return projstages[s] ? projstages[s].t : '';
};
Comm.projType = function(s) {
    return projtypes[s] ? projtypes[s].t : '';
};
Comm.getImgUrl = function(url) {
    if (!url) return 'img/error.png';
    if (url.indexOf('http') === 0)
        return url;
    else {
        if (url.indexOf("storage/") < 0)
            url = "storage/" + url;
        return config.http + url;
    }
};







function Coder(e, inp, o) {
    var t = this;
    t.url = o.url;
    t.data = o.data;
    e.onclick = function() {
        if (!/^1[34578]\d{9}$/.test(inp.value.toString())) {
            Prompt.msg("请输入正确手机号码");
            return 0;
        }
        if (t.timer) {
            Prompt.msg("验证码已发送，请注意查收");
            return 0;
        }
        Prompt.loading();
        t.data[o._phone] = inp.value;
        AJAX.POST(t.url, t.data, function() {
            Prompt.hide();
            Prompt.msg("验证码发送成功");
            e.innerHTML = t.sec + "s";
            t.timer = setInterval(function() {
                t.sec--;
                if (t.sec <= 0) {
                    clearInterval(t.timer);
                    t.timer = null;
                    e.innerHTML = "获取验证码";
                    t.sec = 60;
                } else
                    e.innerHTML = t.sec + "s";
            }, 1000);
        })
    };
    t.timer = null;
    t.sec = 60;
}









var regBox = {
    phone: /^1[34578]\d{9}$/,
    password: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,18}$/,
};



window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function() {
    if (window.orientation === 180 || window.orientation === 0) {
        top.window.location.reload(true);
    }
    if (window.orientation === 90 || window.orientation === -90) {
        document.body.style.opacity = 0;
        if(window['pageData']&&window['TimeSpanMonth'])return;
        alert('当前禁止横屏操作，请旋转至竖屏状态！');
    }
}, false);