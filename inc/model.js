var taskType =Local.get('taskType') ||  [];
(function(){
    if(taskType.length){return}
    AJAX.GET('/api/dict/list?dictType=task_type',function(res){
        taskType = res.data ? res.data : res
        Local.save('tsakType',res.data ? res.data : res)
    })
})();

function setNewTaskList(arr){
    for(var i = 0 ; i<arr.length ;i++){
        if(arr[i].userStatus <=3 || !arr[i].userStatus || arr[i].userStatus == 8 ){
            return forMart([arr[i]])[0]
        }
    }
}

function forMart(arr){
    if(!arr.length){return[]};
    for(var i  =0 ;i <arr.length;i++){
        try{
            arr[i].flag = getTaskType(arr[i].type); 
        }catch(e){}
        arr[i].begin = timestampToDate(arr[i].beginTime);
        arr[i].end = timestampToDate(arr[i].endTime);
        !arr[i].shopName ?arr[i].shopName='平台发布':'';
        arr[i].goType = 1;
    }
    return arr;
}
function diffTime(diff) {

    //计算出相差天数  
    var days = Math.floor(diff / (24 * 3600 * 1000));

    //计算出小时数  
    var leave1 = diff % (24 * 3600 * 1000);    //计算天数后剩余的毫:数  
    var hours = Math.floor(leave1 / (3600 * 1000));
    //计算相差分钟数  
    var leave2 = leave1 % (3600 * 1000);        //计算小时数后剩余的毫:数  
    var minutes = Math.floor(leave2 / (60 * 1000));

    //计算相差:数  
    var leave3 = leave2 % (60 * 1000);      //计算分钟数后剩余的毫:数  
    var seconds = Math.round(leave3 / 1000);

    var returnStr = seconds < 10 ? '0' + seconds : seconds;
    if (minutes > 0) {
        returnStr = (minutes < 10 ? '0' + minutes + ":" : minutes + ':') + returnStr;
    } else if (minutes <= 0) {
        returnStr = '00:' + returnStr
    }
    if (hours > 0) {
        returnStr = (hours < 10 ? '0' + hours + ":" : hours + ':') + returnStr;
    }
    if (days > 0) {
        returnStr = (days < 10 ? '0' + days + ":" : days + ':') + returnStr;
    }
    return returnStr;
}
function forMartProgressTask(arr){
    let result = [];
    if(arr.length){
        for(var i = 0 ;i<arr.length;i++){
            var obj = arr[i];
            obj.flag = getTaskType(arr[i].task.type);
            obj.begin = timestampToDate(arr[i].task.beginTime);
            obj.end = timestampToDate(arr[i].task.endTime);
            obj.singleAmount = arr[i].task.singleAmount;
            !arr[i].task.shopName ?obj.shopName='平台发布':''
            result.push(obj)
        }
    }
    return result
}

function getTaskType(type) {
    for (var i = 0 ; i <taskType.length;i++) {
        var item = taskType[i];
        if (type == item.dictId) {
            return item.dictName;
        }
    }
    return null;
}

function timestampToDate(timestamp, formats) {
	// formats格式包括
	// 1. Y-m-d
	// 2. Y-m-d H:i:s
	// 3. Y年m月d日
	// 4. Y年m月d日 H时i分
	formats = formats || 'Y-m-d';
	if (!timestamp) {
		return null
	}
	var zero = function (value) {
		if (value < 10) {
			return '0' + value;
		}
		return value;
	};

	var myDate = timestamp ? new Date(timestamp) : new Date();

	var year = myDate.getFullYear();
	var month = zero(myDate.getMonth() + 1);
	var day = zero(myDate.getDate());

	var hour = zero(myDate.getHours());
	var minite = zero(myDate.getMinutes());
	var second = zero(myDate.getSeconds());

	return formats.replace(/Y|m|d|H|i|s/ig, function (matches) {
		return ({
			Y: year,
			m: month,
			d: day,
			H: hour,
			i: minite,
			s: second
		})[matches];
	});
}

function back(text){
    text?Prompt.msg(text):"";
    setTimeout(() => {
        Comm.close()
    }, 800);
}