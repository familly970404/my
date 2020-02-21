var isParamInited = false; // 系统维护-参数 是否已经初始化过
//var isImgInited = false; // 系统维护-图片 是否已经初始化过
var isStatInited = false; // 系统维护-统计 是否已经初始化过
var tabs;
var versionGrid;
var hotspotDefGrid;
$(function() {
	try{
		//todo临时注释掉ie8的quicktip，有bug32933
		if(!$.support.leadingWhitespace){//判断IE8
			$(document).off('mouseover.over');
		}
	}catch(e){}
	// 初始化tab
	tabs = awsui.tabs.init($("#tabs"), {
		contentPanel : $("#tabs-content"),
		height : 50,
		focusShowAfter : function(tab) {
			if (tab.beforeTabIndex !== tab.index) {
				// 更改样式
				if(tab.index === 'nav-tab-param'){
					$('#tabs div[index=nav-tab-stat]').addClass('nav-tab-left-border');
					$('#tabs div[index=nav-tab-param]').removeClass('nav-tab-right-border');
				}else if(tab.index === 'nav-tab-stat'){
					$('#tabs div[index=nav-tab-param]').addClass('nav-tab-right-border');
					$('#tabs div[index=nav-tab-stat]').removeClass('nav-tab-left-border');
				}
				// 记录cookie-最后打开的tab
				if (getCookie('kms.systemmgr.opendtab') !== tab.index) {
					setCookie('kms.systemmgr.opendtab', tab.index);
				}
				if (tab.beforeTabIndex === undefined) { // 页面初始化
					if (tab.index === 'nav-tab-param') {
						isParamInited = true;
						initParam();
					}
//					else if (tab.index === 'nav-tab-img') {
//						isImgInited = true;
//					}
					else if (tab.index === 'nav-tab-stat') {
						isStatInited = true;
						stat.initStat();
					}
				} else {
					 if (tab.index === 'nav-tab-param') {
						 if (!isParamInited) {
							 initParam();
						 }
					 }
//					 else if (tab.index === 'nav-tab-img') {
					// if (!isImgInited) {}
					// }
					 if (tab.index === 'nav-tab-stat') {
						if (!isStatInited) {
							stat.initStat();
						}
					}
				}
				return true;
			}
		}
	});
	tabs.addTab({
		item : {
			title : "<span class='tab-icon tab-icon-param'></span><span style='font-size: 13px;float:left;'>&nbsp;参数</span>",
			index : "nav-tab-param"
		},
		close : false
	});
	tabs.addTab({
		item : {
			title : "<span class='tab-icon tab-icon-stat'></span><span style='font-size: 13px;float:left;'>&nbsp;统计</span>",
			index : "nav-tab-stat"
		},
		close : false
	});
// tabs.addTab({
// item : {
// title : "图片配置",
// index : "nav-tab-img"
// },
// close : false
// });
	tabs.focusTab('0000-0000-0000'); // 制造一个undefined的tab的beforeTabIndex,打开页面的时候使用
	var opendtab = getCookie('kms.systemmgr.opendtab');
	if (opendtab) { // 取上次打开的tab
		tabs.focusTab(opendtab);
	} else { // 第一次打开all
		tabs.focusTab('nav-tab-param');
	}
	$('#tabs .awsui-tabs-container').width(200);
	$(window).resize(function() {
		if ($('#tab-param').is(':visible')) {
			resizeVersionGrid();
			resizeHotspotDefGrid();
		} else if ($('#tab-stat').is(':visible')) {
//			stat.statChart.resize();
		}
	});
});
function initParam(){
	initVersionGrid();
	initHotspotDefGrid();
	// 获取知识参数并且初始化
	awsui.ajax.request({
		url : "./jd",
		method : "POST",
		loading : true,
		data : {
			sid : sid,
			cmd : "com.actionsoft.apps.kms_system_mgr_get_param_json"
		},
		success : function(responseObject) {
			$('#maxFileSize').numberbox({
				uplength : 5,
				max : 500
			});
			$('#maxFileSize').val(responseObject.data.systemParam.maxFileSize);
			
			$('#gridRowPP').numberbox({
				uplength : 1,
				max : 100
			});
			$('#gridRowPP').val(responseObject.data.systemParam.gridRowPP);
			var availableTags = [];
			$("#blackFileList").userinputkms({
				superbox : $("#usersuper"),
				target : $("#usersuper"),
				seperator : '@`@',
				initData : responseObject.data.systemParam.blackFileList.split('@`@'),
				listHeight : 120,
				multiple : true, // 多选
				source : availableTags,
				add : function(e, d) {
				},
				del : function(e, d) {
				}
			});
			$("#browserPreview").userinputkms({
				superbox : $("#browserPreviewWrap"),
				target : $("#browserPreviewWrap"),
				seperator : ',',
				initData : responseObject.data.systemParam.browserPreview.split(','),
				listHeight : 120,
				multiple : true, // 多选
				source : availableTags,
				add : function(e, d) {
				},
				del : function(e, d) {
				}
			});
		}
	});
	
	// 上传知识地图
	var hotspotResultFlag = undefined;
	$("#hotspotName").upfile({
		sid : sid,
		appId : "com.actionsoft.apps.kms",
		groupValue : "grouphotspot",
		fileValue : "filehotspot",
		numLimit : 1,
		filesToFilter : [ [ "Pos (*.pos)", "*.pos" ] ],
		repositoryName : "hotspot",
		done : function(e, data) {
			// 增加一行
			if (data['result']['data']['result'] == 'ok') {
				var hotspotResult = data['result']['data']['data']['attrs']['hotspotResult'];
				if(hotspotResult){
					hotspotResultFlag = hotspotResult;
				}else{
					var fileName = decodeURIComponent(data['files'][0]['name']);
					$("#hotspotName").val(fileName);
					$('#hotspotMetaId').val(data['result']['data']['data']['attrs']['hotspotMetaId']);
				}
			}else{
				hotspotResultFlag = data['result']['data']['msg'];
			}
		},
		complete : function(e, data) {
			if(hotspotResultFlag){
				$.simpleAlert(hotspotResultFlag, 'error');
				hotspotResultFlag = undefined;
				return false;
			}
		},
		error : function(e, data){
			
		}
	});
}
function saveSystemParam() {
	// 取值
	var maxFileSize = $('#maxFileSize').val();
	if (!/^(\d)+$/.test(maxFileSize)) {
		$.simpleAlert('单文件上传最大值格式错误，请输入正整数', 'info');
		return false;
	}
	var gridRowPP = $('#gridRowPP').val();
	if (!/^(\d)+$/.test(gridRowPP)) {
		$.simpleAlert('分页列表每页的行数格式错误，请输入正整数', 'info');
		return false;
	}
	
	var blackFileList = $('#usersuper span[class=awsui-supertext-item]').map(function() {
		return $(this).text();
	}).toArray().join('@`@');
	var browserPreview = $('#browserPreviewWrap span[class=awsui-supertext-item]').map(function() {
		return $(this).text();
	}).toArray().join(',');
	awsui.ajax.request({
		url : "./jd",
		method : "POST",
		loading : true,
		data : {
			sid : sid,
			cmd : "com.actionsoft.apps.kms_system_mgr_save_param",
			maxFileSize : maxFileSize,
			gridRowPP : gridRowPP,
			blackFileList : encodeURIComponent(blackFileList),
			browserPreview : encodeURIComponent(browserPreview)
		},
		success : function(responseObject) {
		}
	});
}

function initVersionGrid() {
	if (!versionGrid) {
		// 初始化版本号列表(grid)
		var versionGridConfig = {
			width : $('#tab-param').width() -502,
			height : $('#tab-param').height() / 2 -40 - 3,
			flexWidth : false,
			flexHeight : false,
			wrap : false,
			nowrapTitle : false,
			topVisible : false,
			bottomVisible : false,
			columnBorders : false,
			editModel : {
				clicksToEdit : 0
			},
			scrollModel: {
				autoFit: false,
				horizontal: true,
				vertical :true
			},
			colModel : [ {
				title : "",
				checkbox : true,
				resizable : false,
				align : "center",
				width : 30
			}, {
				title : "版本号",
				width : 200,
				sortable : false,
				dataType : "string",
				dataIndx : "versionNo",
				resizable : true,
				showText : false
			}, {
				title : "创建人",
				width : 100,
				sortable : false,
				dataType : "string",
				dataIndx : "createUsername",
				resizable : true,
				showText : false
			}, {
				title : "创建时间",
				sortable : false,
				showText : false,
				width : 130,
				align : 'center',
				dataIndx : "createTime"
			}, {
				title : "描述",
				sortable : false,
				showText : false,
				align : 'left',
				dataIndx : "memo",
				width : $('#tab-param').width() -502 - 30 - 200 - 130 -120 -50
			} ],
			dataModel : {
				location : "remote",
				sorting : "remote",
				method : "POST",
				getUrl : function() {
					return {
						url : "./jd",
						data : {
							sid : sid,
							cmd : "com.actionsoft.apps.kms_version_list_json"
						}
					};
				},
				getData : function(responseObject) {
					return {
						data : responseObject.data
					};
				}
			}
		};
		versionGrid = $("#version-grid").awsGrid(versionGridConfig);
		versionGrid.on("awsgridrowselect", function(evt, ui) {
			$("#deleteVersionBtn").show();
		});
		versionGrid.on("awsgridrowunselect", function(evt, ui) {
			var length = versionGrid.awsGrid("getSelectedRow").length;
			if (length > 1) {
				$("#deleteVersionBtn").show();
			} else {
				$("#deleteVersionBtn").hide();
			}

		});
	} else {
		resizeVersionGrid();
	}
}

function resizeVersionGrid() {
	versionGrid.width($('#tab-param').width() -502);
	versionGrid.height($('#tab-param').height() / 2 -40 - 3);
	versionGrid.awsGrid("refresh");
}

function initHotspotDefGrid() {
	if (!hotspotDefGrid) {
		// 初始化知识地图定义列表(grid)
		var hotspotDefGridConfig = {
			width : $('#tab-param').width() -502,
			height : $('#tab-param').height() / 2 -40 - 3,
			flexWidth : false,
			flexHeight : false,
			wrap : false,
			nowrapTitle : false,
			topVisible : false,
			columnBorders : false,
			bottomVisible : false,
			editModel : {
				clicksToEdit : 0
			},
			scrollModel: {
				autoFit: false,
				horizontal: true,
				vertical :true
			},
			colModel : [ {
				title : "",
				checkbox : true,
				resizable : false,
				align : "center",
				width : 30
			}, {
				title : "知识地图名称",
				width : 200,
				sortable : true,
				dataType : "string",
				dataIndx : "hotspotName",
				resizable : true,
				showText : false
			}, {
				title : "创建人",
				width : 100,
				sortable : true,
				dataType : "string",
				dataIndx : "createUsername",
				resizable : true,
				showText : false
			}, {
				title : "创建时间",
				sortable : true,
				showText : false,
				width : 130,
				align : 'center',
				dataIndx : "createTime"
			}, {
				title : "描述",
				sortable : false,
				showText : false,
				align : 'left',
				dataIndx : "memo",
				width : $('#tab-param').width() -502 - 30 - 200 - 130 -120 -50
			} ],
			dataModel : {
				location : "remote",
				sorting : "local",
				sortIndx : 'createTime',
				sortDir : 'down',
				method : "POST",
				getUrl : function() {
					return {
						url : "./jd",
						data : {
							sid : sid,
							cmd : "com.actionsoft.apps.kms_hotspot_def_list_json"
						}
					};
				},
				getData : function(responseObject) {
					return {
						data : responseObject.data
					};
				}
			}
		};
		hotspotDefGrid = $("#hotspot-def-grid").awsGrid(hotspotDefGridConfig);
		hotspotDefGrid.on("awsgridrowselect", function(evt, ui) {
			$("#deleteHotspotDefBtn").show();
		});
		hotspotDefGrid.on("awsgridrowunselect", function(evt, ui) {
			var length = hotspotDefGrid.awsGrid("getSelectedRow").length;
			if (length > 1) {
				$("#deleteHotspotDefBtn").show();
			} else {
				$("#deleteHotspotDefBtn").hide();
			}

		});
	} else {
		resizeHotspotDefGrid();
	}
}
function resizeHotspotDefGrid() {
	hotspotDefGrid.width($('#tab-param').width() -502);
	hotspotDefGrid.height($('#tab-param').height() / 2 -40 - 3);
	hotspotDefGrid.awsGrid("refresh");
}
/**
 * 新建版本号
 */
function addVersion() {
	$('#versionNo,#memo').val('');
	$('#versionDialog').dialog({
		title : '新建版本号',
		width : 380,
		height : 235,
		buttons : [ {
			text : '确定',
			cls : "blue",
			handler : function() {
				if($('#versionNo').val() == ''){
					$.simpleAlert('版本号不能为空', 'info');
					$('#versionNo').focus();
					return false;
				}
				var versionNo = $('#versionNo').val();
				if (!/^[1-9][0-9]*(\.[0-9]+)?$/.test(versionNo)) {
					$.simpleAlert('版本号格式错误，请输入整数或小数', 'info');
					$('#versionNo').focus();
					return false;
				}
				var memo = $('#memo').val();
				awsui.ajax.request({
					url : "./jd",
					method : "POST",
					loading : true,
					data : {
						sid : sid,
						cmd : "com.actionsoft.apps.kms_system_mgr_add_version",
						versionNo : versionNo,
						memo : encodeURIComponent(memo)
					},
					success : function(responseObject) {
						if (responseObject.result === 'ok') {
							$('#versionDialog').dialog('close');
							$.simpleAlert('新建成功', 'ok');
							$("#deleteVersionBtn").hide();
							versionGrid.awsGrid("refreshDataAndView");
						}
					}
				});
			}
		}, {
			text : '取消',
			handler : function() {
				$('#versionDialog').dialog('close');
			}
		} ],
		onClose : function() {
		}
	});
}
/**
 * 新建知识地图定义
 */
function addHotspotDef() {
	$('#hotspotDefMemo,#hotspotName,#hotspotMetaId').val('');
	$('#hotspotDefDialog').dialog({
		title : '新建知识地图',
		width : 380,
		height : 235,
		buttons : [ {
			text : '确定',
			cls : "blue",
			handler : function() {
				var hotspotName = $('#hotspotName').val();
				if ($.trim(hotspotName) == '') {
					$.simpleAlert('请上传知识地图文件', 'info');
					return false;
				}
				if($('#hotspotMetaId').val() === ''){
					$.simpleAlert('请上传知识地图文件', 'info');
					return false;
				}
				var memo = $('#hotspotDefMemo').val();
				awsui.ajax.request({
					url : "./jd",
					method : "POST",
					loading : true,
					data : {
						sid : sid,
						cmd : "com.actionsoft.apps.kms_system_mgr_add_hotspot_def",
						hotspotName : encodeURIComponent(hotspotName),
						memo : encodeURIComponent(memo),
						hotspotMetaId : $('#hotspotMetaId').val()
					},
					success : function(responseObject) {
						if (responseObject.result === 'ok') {
							$('#hotspotDefDialog').dialog('close');
							$.simpleAlert('新建成功', 'ok');
							$("#deleteHotspotDefBtn").hide();
							hotspotDefGrid.awsGrid("refreshDataAndView");
						}
					}
				});
			}
		}, {
			text : '取消',
			handler : function() {
				$('#hotspotDefDialog').dialog('close');
			}
		} ],
		onClose : function() {
		}
	});
}
/**
 * 删除版本号
 */
function deleteVersion() {
	var selectedRows = versionGrid.awsGrid("getRows");
	if (selectedRows.length < 1) {
		$.simpleAlert("请选中需要删除的版本号", "info");
		return false;
	}
	var versionNoArr = [];
	for (var i = 0; i < selectedRows.length; i++) {
		var obj = selectedRows[i];
		versionNoArr[i] = obj.id;
	}
	$.confirm({
		title : "请确认",
		content : "是否删除选中的版本号？",
		onConfirm : function() {
			awsui.ajax.request({
				url : "./jd",
				method : "POST",
				loading : true,
				data : {
					sid : sid,
					cmd : "com.actionsoft.apps.kms_knwl_center_delete_version",
					versionNos : versionNoArr.toString()
				},
				success : function(responseObject) {
					if (responseObject.result == 'ok') {
						$.simpleAlert('删除成功', 'ok');
						$("#deleteVersionBtn").hide();
						versionGrid.awsGrid('refreshDataAndView');
					} else {
						$.simpleAlert('删除错误', responseObject.result);
					}
				}
			});
		}
	});
}
/**
 * 删除知识地图定义
 */
function deleteHotspotDef() {
	var selectedRows = hotspotDefGrid.awsGrid("getRows");
	if (selectedRows.length < 1) {
		$.simpleAlert("请选中需要删除的知识地图", "info");
		return false;
	}
	var hotspotIdArr = [];
	for (var i = 0; i < selectedRows.length; i++) {
		var obj = selectedRows[i];
		hotspotIdArr[i] = obj.id;
	}
	awsui.ajax.request({
		url : "./jd",
		method : "POST",
		loading : true,
		alert : false,
		data : {
			sid : sid,
			cmd : "com.actionsoft.apps.kms_knwl_center_delete_hotspot_check",
			hotspotDefIds : hotspotIdArr.toString()
		},
		success : function(responseObject) {
			if (responseObject.result == 'ok') {
				$.confirm({
					title : "请确认",
					content : "是否删除选中的知识地图？该知识地图的图形和维度的关联也将被删除",
					onConfirm : function() {
						awsui.ajax.request({
							url : "./jd",
							method : "POST",
							loading : true,
							data : {
								sid : sid,
								cmd : "com.actionsoft.apps.kms_knwl_center_delete_hotspot_def",
								hotspotDefIds : hotspotIdArr.toString()
							},
							success : function(responseObject) {
								if (responseObject.result == 'ok') {
									$.simpleAlert('删除成功', 'ok');
									$("#deleteHotspotDefBtn").hide();
									hotspotDefGrid.awsGrid('refreshDataAndView');
								} 
							}
						});
					}
				});
			} else{
				$.simpleAlert(responseObject.msg, responseObject.result);
				return false;
			}
		}
	});
}
var stat = {
		statChart : undefined,
		initStat: function () {
			statChart = echarts.init(document.getElementById('statChart'));

			statChart.showLoading();
			$.get('./jd?sid=' + sid + '&cmd=com.actionsoft.apps.kms_knwl_center_stat_json').done(function (data) {
				statChart.hideLoading();
				statChart.setOption({
					title: {
						text: '知识、文件'
					},
					tooltip: {},
					legend: {
						data: ['知识', '文件']
					},
					dataZoom: {
						orient: "horizontal",
						show: true,
						start: 0, // 起始值百分比
						end: (6 / (data.data.createUserList.length)) * 100 // 结束值百分比(计算规则：chart宽度能容纳的最大个数/数据长度
							// 再乘以100)
					},
					xAxis: {
						data: data.data.createUserList
					},
					yAxis: {},
					series: [{
						name: '知识',
						type: 'bar',
						barWidth: 20,
						data: data.data.cardList
					}, {
						name: '文件',
						type: 'bar',
						barWidth: 20,
						data: data.data.fileList
					}]
				});
			});

		}
	};