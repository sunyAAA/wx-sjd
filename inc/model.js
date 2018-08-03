var taskType = [];
(function(){
    AJAX.GET('/api/dict/list?dictType=task_type',function(res){
        taskType = res;
    })
})();

function setNewTaskList(arr){
    for(var i = 0 ; i<arr.length ;i++){
        if(arr[i].userStatus <=3 || !arr[i].userStatus){
            return forMart([arr[i]])[0]
        }
    }
}

function forMart(arr){
    if(!arr){return[]};
    for(var i  =0 ;i <arr.length;i++){
        arr[i].flag = getTaskType(arr[i].type); 
        arr[i].begin = timestampToDate(arr[i].beginTime);
        arr[i].end = timestampToDate(arr[i].endTime);
        !arr[i].shopName ?arr[i].shopName='平台发布':'';
        arr[i].goType = 1;
    }
    return arr;
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