$(function() {
	// 合并all对象和me对象
	allDG.isDimensionKnwlPage = true;
	$.extend(all, allDG);
	$.extend(me, meDG);
	$.extend(publish, publishDG);
	// 加载公共html到本页面
	awsui.ajax.request({
		url : "./jd",
		method : "POST",
		async : false,
		data : {
			sid : sid,
			cmd : "com.actionsoft.apps.kms_dimension_grid_html"
		},
		ok : function(responseObject) {
			$(document.body).append('<div id="dimensionGridLoadDiv" style="display: none;"></div>');
			$('#dimensionGridLoadDiv').append(responseObject.data.html);
			// 将各个模块儿定位到各自的位置
			$('#all-left,#all-separater').prependTo(document.body);
			$('#filterAllBtn,#filterAllInput').appendTo($('#dimensionCardToolbar'));
			$('#dimension-card-grid,#hotspotDiv').appendTo($('#all-right'));
			$('#knwlDocDialog').appendTo(document.body);
			$('#publishCardDialog').appendTo(document.body);
			$('#borrowProcessForm,#borrowProcessDialog').appendTo(document.body);
			$('#fullscreenWrap').appendTo(document.body);
			
			//渲染check
			$("input[type=radio]").check()

			$('#dimensionGridLoadDiv').remove();
		},
		err : function() {
			$.simpleAlert("页面加载错误", "error");
		}
	});

	try {
		// todo临时注释掉ie8的quicktip，有bug32933
		if (!$.support.leadingWhitespace) {// 判断IE8
			$(document).off('mouseover.over');
		}
	} catch (e) {
	}

	$("#validDate").datepicker({
		minDate : today
	});
	$('#filterAllBtn').off('click').on('click', function() {
		all.dimensionCardGrid.awsGrid("refreshDataAndView");
	});
	$('#filterAllInput').off('keypress').on('keypress', function(e) {
		if (e.which == 13) {
			$('#filterAllBtn').click();
		}
	});
	all.dragSeparator();
	all.initTree();
	
	$(window).resize(function(event) {
		all.resizeDimensionCardGrid();
	})
});
var all = {};
var me = {};
var publish = {};