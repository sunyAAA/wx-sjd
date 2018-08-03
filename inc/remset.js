+function () {
    //初始化页面rem
    if(window.screen && window.screen.availWidth) {
        var baseW = 375;
        if(window.screen.availWidth > window.screen.availHeight)
            baseW = window.screen.availHeight;
        var fs = parseInt(baseW / 18.75);
        if(fs>25)
            fs = 25;
        document.documentElement.style.fontSize=fs+'px';
        window.rootPX = fs;
    }
    //设备信息
    window.Device = {
        type:0, wk:0,
        init:function () {
            if(wx())
                Device.type = 1;
            else if (iOS())
                Device.type = 2;
            else if (android())
                Device.type = 3;
            if(wk())
                Device.wk = 1;
            function wx() {return navigator.userAgent.toLocaleLowerCase().indexOf('micromessenger')>-1;}
            function iOS() {return wk()&&window.webkit.messageHandlers&&!wx();}
            function android() {return window.WeiLai;}
            function wk() {return window.webkit;}

            window.TH = 64;
            if(Device.type===1 || Device.type===0) {
                TH = 44;
                document.documentElement.className = "wx" + (window.webkit?" wk":"");
            } else if(Device.type===2) {
                document.documentElement.className = "ios" + (window.webkit?" wk":"");
            } else if (Device.type===3)
                document.documentElement.className = "android";
        }
    };
    Device.init();
}();