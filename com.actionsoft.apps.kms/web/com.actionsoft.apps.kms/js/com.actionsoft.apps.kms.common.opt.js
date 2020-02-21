/**
 * kms通用操作 查看日志 编辑知识等
 * 
 * 依赖aws.dialog aws.grid
 */
$(function() {
	try{
		//todo临时注释掉ie8的quicktip，有bug32933
		if(!$.support.leadingWhitespace){//判断IE8
			$(document).off('mouseover.over');
		}
	}catch(e){}
	$(document.body).append('<div id="tmpOptDiv"></div>');
	$('#tmpOptDiv').load('../apps/com.actionsoft.apps.kms/js/com.actionsoft.apps.kms.common.opt.htm', {}, function() {
		$('#logDiv').appendTo($(document.body));
		$('#tmpOptDiv').remove();
	});
})
/**
 * 日志
 */
var logGrid = undefined;
function showLog(cardId, cardName) {
	$("#logDiv").dialog({
		title : "访问日志",
		width : 800,
		height : 510,
		model : true,
		buttons : [ {
			text : '关闭',
			cls : "blue",
			handler : function() {
				$("#logDiv").dialog("close");
			}
		} ],
		onClose : function() {
			logGrid.awsGrid("option", "dataModel").data = [];
		}
	});
	var logGridConfig = {
		width : 786,
		height : 420,
		title : '知识名称：' + decodeURIComponent(cardName),
		editable : false,
		columnBorders : false,
		scrollModel : {
			autoFit : true,
			horizontal : true
		},
		colModel : [ {
			title : "访问内容",
			width : 504,
			sortable : true,
			editable : false,
			dataType : "string",
			dataIndx : "logContent",
			resizable : true,
			showText : false
		}, {
			title : "访问人",
			width : 100,
			sortable : true,
			editable : false,
			dataType : "string",
			dataIndx : "accessUsername",
			resizable : true,
			showText : false
		}, {
			title : "访问时间",
			width : 150,
			editable : false,
			sortable : true,
			align : 'center',
			dataIndx : "accessTime"
		} ],
		dataModel : {
			location : "remote",
			sorting : "remote",
			sortIndx : 'accessTime',
			sortDir : 'down',
			paging : "remote",
			method : "POST",
			curPage : 1, // 当前页
			rPP : parent.gridRowPP, // 每页个数
			getUrl : function() {
				return {
					url : "./jd",
					data : {
						sid : sid,
						cmd : "com.actionsoft.apps.kms_knwl_center_log_list",
						curPage : logGrid == undefined ? 1 : (logGrid.awsGrid("option").dataModel.curPage <= 0 ? 1 : logGrid.awsGrid("option").dataModel.curPage),
						rowsPerPage : logGridConfig.dataModel.rPP,
						cardId : cardId,
						sortIndx : this.sortIndx,
						sortDir : this.sortDir
					}
				};
			},
			getData : function(responseObject) {
				return {
					curPage : responseObject.data.curPage,
					totalRecords : responseObject.data.totalRecords,
					data : responseObject.data.data
				};
			}
		}
	};
	logGrid = $("#logGrid").awsGrid(logGridConfig);
	logGrid.find(".pq-pager").awsGridPager("option", $.awsgrid.awsGridPager.regional["zh"]);
}