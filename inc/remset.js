+function () {
    if(window.screen) {
        var fs = window.screen.availWidth/750*40;
        if(fs>28) fs = 28;
        document.documentElement.style.fontSize=fs+'px';
        document.documentElement.style.lineHeight=(fs+2)+'px';
    }
}();