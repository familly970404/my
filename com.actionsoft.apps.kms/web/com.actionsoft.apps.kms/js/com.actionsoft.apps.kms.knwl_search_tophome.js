var isFullInited = false; // 知识检索-全文 是否已经初始化过
var isAttrInited = false; // 知识维护-属性 是否已经初始化过
var tabs;
var parentIdForList = '';
$(function () {
	$("#searchType").select2({minimumResultsForSearch: "Infinity"});
	attrsearch.initExtendsLink();
	try {
		// todo临时注释掉ie8的quicktip，有bug32933
		if (!$.support.leadingWhitespace) {// 判断IE8
			$(document).off('mouseover.over');
		}
	} catch (e) {
	}
	/* 拖动分隔栏开始 */
	if (getCookie('kms.knwlsearch.separater.originalWidth')) {
		$('.dimension-flotage').css('width', getCookie('kms.knwlsearch.separater.originalWidth'));
	}
	var dragFlag = false;// 拖动标记,mousedown时可以拖动,mouseup时不可以拖动
	var originalPageX = 0;
	var originalWidth = parseInt($('.dimension-flotage').css('width'));
	$('#attrsearch-separater').off('mousedown').on('mousedown', function (e) {
		dragFlag = true;
		originalPageX = e.pageX;
		$(document).on("selectstart.search", function () {
			return false;
		});
		$(document).off('mousemove.search').on('mousemove.search', function (e) {
			if (dragFlag === true) {
				var minWidthControl = parseInt($('.dimension-flotage').css('width'));
				var movePx = e.pageX - originalPageX;
				if (!((movePx > 0 && minWidthControl > 500) || (movePx < 0 && minWidthControl < 265))) {
					$('.dimension-flotage').css('width', (originalWidth + movePx));
					$('#attrsearch-separater').css({
						left: $('.dimension-flotage').outerWidth(true) - 4
					});
				} else {
					$(document).trigger('mouseup.search');
				}
			}
		});
		$(document).off('mouseup.search').on('mouseup.search', function (e) {
			if (dragFlag === true) {
				dragFlag = false;
				originalWidth = parseInt($('.dimension-flotage').css('width'));
				$(document).off("selectstart.search");
				$(document).off('mousemove.search');
				$(document).off('mouseup.search');
				// 记录cookie
				setCookie('kms.knwlsearch.separater.originalWidth', originalWidth);
				e.stopPropagation();
			}
		});
	});
	/* 拖动分隔栏结束 */
	if (isFullsearchAppActive === false) {
		$('#fullSearchBtn,#searchText').prop('disabled', true);
		$('#searchText').val('全文检索应用不可用,无法使用该功能').css({'color': '#a9a9a9'});
	}
	// 全文检索关键词
	$('#searchText').off('keypress').on('keypress', function (e) {
		if (e.which === 13) {
			$('#fullSearchBtn').click();
		}
	});
	$("#publishTimeDZ").datepickerRange({
		callbackfun: function () {
		},
		emptyBtn: true,// 是否显示清空按钮
		showLeft: 0,
		showTop: -256
	});
	$('#publishTimeDZ #navigationIntervalStart').text('');
	$('#publishTimeDZ #navigationIntervalEnd').text('');
	$("#publishTimeDZ div.report-navigation-time-interval").css('width', 'auto');
	$('#publishTimeDZ + .navigationDatepickerDivAws').css({
		'position': 'fixed'
	});
	$(window).resize(function () {
		//global.resizeKMSWin();
	});
	// datepicker组件会导致过滤区域显示出来，此行代码放到datepicker之后
	$('.filter-flotage').hide();
});
var global = {
	resizeKMSWin: function () {
		if ($('#attrsearchGrid').is(':visible')) {
			attrsearch.resizeSearchGrid();
		}
	},
};
var attrsearch = {
	dimensionTree: undefined,
	hasNextPage: undefined,
	initExtendsLink: function () {
		var extendsLinkHtml = "";
		for (var i = 0; i < extendsLinks.length; i++) {
			extendsLinkHtml += "<div class=\"extends-link\" style=\"font-size:14px;margin:0 20px;height:40px;display:inline-block;line-height:40px;\"><a href = \"" + extendsLinks[i].url + "\" style=\"color:#efefef\" target=\"_blank\">" + extendsLinks[i].title + "</a></div>"
		}
		$(".dimension-meta-bar").append(extendsLinkHtml);
	},
	initAttr: function () {
		attrsearch.initSchema();
		//attrsearch.initSearchGrid();
		topList.initGrid("commentCount");
		$("#publishUserinput").userinput({
			superbox: $("#publishUserDiv"),
			target: $("#publishUserDiv"),
			listHeight: 120,
			multiple: true,
			listHeight: 120,
			source: "./w?sid=" + sid + "&cmd=com.actionsoft.apps.kms_knwl_memberlist",
			appendTo: $("#publishUserDiv")
		});
		$('#publishUserinput_menu').css({'position': 'fixed'});
		$('#publishUserinput_menu').css({'width': '150px'});
	},
	attrSearchTreeData: undefined,
	initDimensionTree: function () {
		var setting;
		// 选中级联子节点
		var checkInheritSB = $("#checkInheritSB").switchButton({
			swheight: 25,
			change: function () {
				attrsearch.dimensionTree.destroy();
				setting.checkInherit = this.checked;
				attrsearch.dimensionTree = awsui.tree.init($("#attrDimensionTree"), setting);
				// 记录cookie
				setCookie('kms.knwlsearch.attr.checkInheritSB', this.checked);
			}
		});// 级联是否级联子节点
		var checkInheritCookie = getCookie('kms.knwlsearch.attr.checkInheritSB');
		if (checkInheritCookie == "false") {
			checkInheritSB.changeStatus(false);
		} else {
			checkInheritSB.changeStatus(true);
		}
		if (!attrsearch.dimensionTree) {
			// var treeDataUrl = "./w?sid=" + sid +
			// "&cmd=com.actionsoft.apps.kms_knwl_search_attr_dimension_tree_json";
			// dataModel : {
			// url : treeDataUrl,
			// method : "POST",
			// dataType : "json",
			// params : {
			// parentId : ''
			// }
			// }
			$.simpleAlert("正在加载数据...", "loading");
			awsui.ajax.request({
				url: "./jd",
				method: "POST",
				loading: false,
				data: {
					sid: sid,
					cmd: "com.actionsoft.apps.kms_knwl_search_attr_dimension_tree_all_json"
				},
				success: function (responseObject) {
					attrsearch.attrSearchTreeData = responseObject;
					setting = {
						showLine: false,
						checkbox: true,
						checkInherit: $('#checkInheritSB')[0].checked,
						sort: true,
						event: {
							// beforeExpand : attrsearch.getChildren,
							onClick: attrsearch.treeClick,
							onCheck: attrsearch.treeCheck,
							afterLoad: function () {
								$.simpleAlert("close");
							}
						},
						dataModel: {
							data: attrsearch.attrSearchTreeData
						},
						animate: true,
					};
					attrsearch.dimensionTree = awsui.tree.init($("#attrDimensionTree"), setting);
					var rootNodes = attrsearch.dimensionTree.getRootNode();
					if (rootNodes.length === 0) {
						$('#attrDimensionTree').html('<div class="kms-no-km"></br><div class="title">&nbsp;没有知识</div></div>');
					}
				}
			});
		}
	},
	sleep: function (numberMillis) {
		var now = new Date();
		var exitTime = now.getTime() + numberMillis;
		while (true) {
			now = new Date();
			if (now.getTime() > exitTime)
				return;
		}
	},
	// 展开节点
	getChildren: function (treeNode) {
		var nodeDom = attrsearch.dimensionTree.getNodeDomById(treeNode.id);
		if (nodeDom.find("span:eq(1)[class=root-open]").length === 1) { // 闭合时无需请求网络
			return false;
		}
		if (nodeDom.siblings("ul").length === 1) { // 已经请求的网络的节点无需再次请求网络
			return false;
		}
		if (treeNode.open !== null) {
			attrsearch.dimensionTree.setting.dataModel.params.parentId = treeNode.id;
			var result = attrsearch.dimensionTree.getData(attrsearch.dimensionTree.setting.dataModel);
			attrsearch.dimensionTree.buildChilren(result, treeNode);
		}
	},
	// 维度树单击事件
	treeClick: function (treeNode) {
		// 如果有checkbox 自动选中/取消选中
		var nodeDom = attrsearch.dimensionTree.getNodeDomById(treeNode.id);
		nodeDom.find('input[type=checkbox]').click();
	},
	firstNodeRecurEnd: false,
	descCount: 1,
	checkTriggerCount: 0,
	treeCheck: function (treeNode) {
		attrsearch.lastPublishId = '';//搜索重置
		if ($('#checkInheritSB')[0].checked) {// 自动选中子节点
			if (!attrsearch.firstNodeRecurEnd) {
				// 递归计算一共有多少后代节点
				var childNodeIds = attrsearch.dimensionTree.getNodeIdsByPid($(treeNode).val());
				attrsearch.recurTree(childNodeIds);
				attrsearch.firstNodeRecurEnd = true;
			}
			// 计数器
			attrsearch.checkTriggerCount++;
			if (attrsearch.descCount === attrsearch.checkTriggerCount) {// 计数器和后代数量一致时进行查询
				// 重置参数状态，并查询列表
				attrsearch.firstNodeRecurEnd = false;
				attrsearch.descCount = 1;
				attrsearch.checkTriggerCount = 0;
				attrsearch.search();
			}
		} else {
			attrsearch.search();
		}
	},
	recurTree: function (childNodeIds) {
		for (var i = 0; i < childNodeIds.length; i++) {
			attrsearch.descCount++;
			attrsearch.recurTree(attrsearch.dimensionTree.getNodeIdsByPid(childNodeIds[i]));
		}
	},
	mouseLeaveFlag: false,//当鼠标leave.meta时，检测50毫秒内是否进入新的.meta，如果enter则自动打开.meta（避免用户clicks）
	initSchema: function () {
		awsui.ajax.request({
			url: "./jd",
			method: "POST",
			// loading: true,
			data: {
				sid: sid,
				cmd: "com.actionsoft.apps.kms_knwl_search_schema_attr_list_json"
			},
			success: function (responseObject) {
				// 渲染html
				var result = responseObject.data;
				var schemaHtml = '';
				if ($.isEmptyObject(result)) {// 如果是空对象
					//schemaHtml = '<div class="kms-no-record">无描述</div>';
				} else {
					for (var schemaId in result) {
						var schemaObj = result[schemaId];
						schemaHtml += '<div class="meta" id="' + schemaId + '">';
						schemaHtml += schemaObj.schemaTitle + '<span isnullable="' + schemaObj.isNullable + '"></span>';
						if (schemaObj.isNullable == 0) { // 必填
							schemaHtml += '<span class="schema-required">*</span>';
						}
						schemaHtml += '<div class="meta-flotage" showType="' + schemaObj.showType + '">';
						if (schemaObj.showType == 0) { // 复选框
							var attrList = schemaObj.attrList;
							for (var i = 0; i < attrList.length; i++) {
								var attrObj = attrList[i];
								schemaHtml += '<div class="meta-attr"><input class="awsui-checkbox" type="checkbox" id="' + attrObj.id + '"><label class="awsui-checkbox-label ' + attrsearch.getClassByLength(attrObj.attrTitle) + '" for="' + attrObj.id + '">' + attrObj.attrTitle + '</label></div>';
							}
						} else if (schemaObj.showType == 1) { // 单选框
							var attrList = schemaObj.attrList;
							for (var i = 0; i < attrList.length; i++) {
								var attrObj = attrList[i];
								schemaHtml += '<div class="meta-attr"><input class="awsui-radio" name="radiox' + schemaId + '" id="' + attrObj.id + '" type="radio"><label class="awsui-radio-label ' + attrsearch.getClassByLength(attrObj.attrTitle) + '" for="' + attrObj.id + '">' + attrObj.attrTitle + '</label></div>';
							}
//							schemaHtml += '<div class="meta-attr"><img src="../apps/com.actionsoft.apps.kms/raty/img/cancel-off.png" onclick="attrsearch.radioRemoveClick(this,event)" onmouseover="attrsearch.radioRemoveOver(this,event)" onmouseout="attrsearch.radioRemoveOut(this,event)" alt="x" class="raty-cancel" title="清除"></div>';
						} else if (schemaObj.showType == 2) { // 文本框
							schemaHtml += '<div class="meta-attr" style="width:100%;padding-right: 10px;"><input name="showType2" type="text" class="txt" schemaId="' + schemaId + '" placeholder="请输入知识描述关键词..." style="height:17px;vertical-align: middle;width:100%;"/></div>';
						}
						schemaHtml += '</div>';
						schemaHtml += '</div>';
					}
				}
				$('.dimension-meta-bar').append(schemaHtml);
				// 计算悬浮meta的位置
				var dimensionFlotageTop = $('#dimension-meta-bar-dimension').offset().top + $('#dimension-meta-bar-dimension').outerHeight(true);
				$('.meta-flotage').css({
					top: dimensionFlotageTop
				});
				// 绑定元数据的事件
				$('.meta').off('click').on('click', function () {
					$(this).find('.meta-flotage').toggle();
				});
				$('.meta').off('mouseenter').on('mouseenter', function () {
					if (attrsearch.mouseLeaveFlag) {
						$(this).find('.meta-flotage').show();
					}
				});
				$('.meta .meta-flotage').off('click').on('click', function (e) {
					e.stopPropagation();
				});
				$('.meta').off('mouseleave').on('mouseleave', function (e) {
					if ($(this).find('.meta-flotage').is(':visible')) {
						attrsearch.mouseLeaveFlag = true;
					}
					$(this).find('.meta-flotage').hide();
					setTimeout(function () {
						attrsearch.mouseLeaveFlag = false;
					}, 50);
				});
				$(".meta input[type=checkbox]").check();
				$(".meta input[type=radio]").check();
				// 绑定input、checkbox、radio和清空radio的事件
				$(".meta input[type=text]").off('change').on('change', function () {
					attrsearch.selectMetaAttrCB(this);
				});
				$(".meta input[type=checkbox],.meta input[type=radio]").off('ifChanged').on("ifChanged", function () {
					attrsearch.selectMetaAttrCB(this);
				});
			}
		});
	},
	getClassByLength: function (str) {
		//获取长度 中文算2个字符
		var len = 0;
		for (var i = 0; i < str.length; i++) {
			if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
				len += 2;
			} else {
				len++;
			}
		}
		if (len > 16) {
			return "label1 label2";
		} else {
			return "label1";
		}
	},
	selectMetaAttrCB: function (obj) {
		var showtype = $(obj).parents('.meta-flotage[showtype]').attr('showtype');
		var schemaId = $(obj).parents('.meta[id]').attr('id');
		if (showtype == 0) {// checkbox
			var text = encodeURIComponent($(obj).parent().next().text());
			if ($(obj).prop("checked")) {
				attrsearch.addSelectMetaAttr(showtype, schemaId, text, $(obj).attr('id'));
			} else {
				attrsearch.removeSelectMetaAttr(showtype, schemaId, $(obj).attr('id'));
			}
		} else if (showtype == 1) {// radio
			var text = encodeURIComponent($(obj).parent().next().text());
			if ($(obj).prop("checked")) {
				attrsearch.addSelectMetaAttr(showtype, schemaId, text, $(obj).attr('id'));
			} else {
				attrsearch.removeSelectMetaAttr(showtype, schemaId, $(obj).attr('id'));
			}
		} else if (showtype == 2) {// text
			var text = $(obj).val();
			if (text != '') {
				attrsearch.addSelectMetaAttr(showtype, schemaId, encodeURIComponent(text), '');
			} else {
				attrsearch.removeSelectMetaAttr(showtype, schemaId, '');
			}
		}
	},
	addSelectMetaAttr: function (showtype, schemaId, text, attrId) {
		attrsearch.search();
		if (showtype == 2) {
			if ($('.filter-bar-left > div[schemaId=' + schemaId + ']').length != 0) {// 已经存在则修改
				$('.filter-bar-left > div[schemaId=' + schemaId + '] .selected-meta-attr-text').text(text);
				return;
			}
		}
		var selectMetaAttrHtml = '<div class="selected-meta-attr" showtype="' + showtype + '" schemaId="' + schemaId + '" attrId="' + attrId + '" onclick="attrsearch.removeSelectMetaAttr(\'' + showtype + '\',\'' + schemaId + '\',\'' + attrId + '\')"><div class="selected-meta-attr-text">' + decodeURIComponent(text) + '</div><div class="selected-meta-attr-img"></div></div>';
		$('.filter-bar-left').append(selectMetaAttrHtml);
	},
	removeSelectMetaAttr: function (showtype, schemaId, attrId) {
		// 查找是否还有选中的attr，如果没有就清除bar上的选中状态
		if (showtype == 0) {
			$('input[id=' + attrId + ']').check("option", "checked", false);
			$('.filter-bar-left > div[attrId=' + attrId + ']').remove();
		} else if (showtype == 1) {
			$('input[id=' + attrId + ']').check("option", "checked", false);
			$('.filter-bar-left > div[attrId=' + attrId + ']').remove();
		} else if (showtype == 2) {
			$('.filter-bar-left > div[schemaId=' + schemaId + ']').remove();
			$('.meta[id=' + schemaId + '] input[type=text]').val('');
		}
		attrsearch.search();
	},
	radioRemoveClick: function (obj, event) {
		$(obj).parents('div.meta-flotage').find('input[type=radio]:checked').check("option", "checked", false);
		var eve = $.Event(event);
		eve.stopPropagation();
		return false;
	},
	radioRemoveOver: function (obj, event) {
		$(obj).attr('src', "../apps/com.actionsoft.apps.kms/raty/img/cancel-on.png");
		var eve = $.Event(event);
		eve.stopPropagation();
		return false;
	},
	radioRemoveOut: function (obj, event) {
		$(obj).attr('src', "../apps/com.actionsoft.apps.kms/raty/img/cancel-off.png");
		var eve = $.Event(event);
		eve.stopPropagation();
		return false;
	},
	search: function () {
		attrsearch.lastPublishId = '';//搜索重置
		$('#searchText').val('');
		$('#attrsearchGrid').show();
		$('#attrsearchGrid-btn').show();
		$('#fullsearch-result').hide();
		$(".filter-bar").hide();
		// 参数-维度
		var searchDimensionIds = [];
		try {//如果树未构建完，忽略此参数
			var checkedNodes = attrsearch.dimensionTree.getCheckedNodes();
			for (var i = 0; i < checkedNodes.length; i++) {
				searchDimensionIds[searchDimensionIds.length] = checkedNodes[i].id;
			}
		} catch (e) {
		}
		// 参数-元数据
		// 取值-元数据
		var schemaMetaData = {
			'01': [], // 复选框和单选按钮
			'2': []
			// 文本框
		};
		$.each($('.meta input[type=checkbox]:checked,.meta input[type=radio]:checked'), function (i, n) {
			var schemaMetaData01 = schemaMetaData['01'];
			schemaMetaData01[schemaMetaData01.length] = {
				attrId: this.id,
				schemaId: $(this).parents('div.meta').attr('id')
			};
		});
		$.each($('.meta input[type=text]'), function (i, n) {
			if ($.trim(this.value) != '') {
				var schemaMetaData2 = schemaMetaData['2'];
				schemaMetaData2[schemaMetaData2.length] = {
					metaValue: $.trim(this.value),
					schemaId: $(this).parents('div.meta').attr('id')
				};
			}
		});
		// 参数-标签
		var tags = [];
		var tag = $('#tag').val();
		if (tag != '') {
			tags[0] = tag;
		}
		// 参数-名称、描述
		var cardName = $('#cardName').val();
		attrsearch.searchDimensionIds = JSON.stringify(searchDimensionIds);
		attrsearch.schemaMetaData = encodeURIComponent(JSON.stringify(schemaMetaData));
		attrsearch.cardName = encodeURIComponent(cardName);
		attrsearch.publishTime = JSON.stringify({
			'startPublishTime': $('#publishTimeDZ #navigationIntervalStart').text(),
			'endPublishTime': $('#publishTimeDZ #navigationIntervalEnd').text()
		});
		attrsearch.publishUser = $("#publishUserinput").userinput("value");
		attrsearch.tags = encodeURIComponent(JSON.stringify(tags));
		// 刷新表格
		attrsearch.searchGrid.awsGrid('refreshDataAndView');
	},
	searchDimensionIds: JSON.stringify([]),
	schemaMetaData: encodeURIComponent(JSON.stringify({
		'01': [],
		'2': []
	})),
	tags: encodeURIComponent(JSON.stringify([])),
	title: '',
	searchGrid: undefined,
	totalRecords: 0,
	attrsearchGridConfig: {},
	lastPublishId: '',
	initSearchGrid: function () {
		if (!attrsearch.searchGrid) {
			// var gridHeight = $('#tabs-content').height() -
			// $('#attrsearch-toolbar').outerHeight(true) - 2;
			// var gridContentHeight = gridHeight - 25 - 27; // 25为grid的top
			// 27位grid的bottom
			// var gridCounts = Math.floor(Math.floor(gridContentHeight / 34) /
			// 5) * 5;
			attrsearch.attrsearchGridConfig = {
				width: $(window).width() - 2,
				height: $(window).height() - $('.head-wrap').outerHeight(true) - $('.doc-type-wrap').outerHeight(true) - $('.dimension-meta-bar').outerHeight(true) - $('.filter-bar').outerHeight(true) - 2 - 30,
				flexWidth: false,
				flexHeight: false,
				columnBorders: false,
				wrap: false,
				nowrapTitle: false,
				topVisible: false,
				editable: true,
				scrollModel: {
					autoFit: false,
					horizontal: true,
					vertical: true
				},
				colModel: [{
					title: "",
					checkbox: true,
					resizable: false,
					editable: false,
					align: "center",
					width: 30
				}, {
					title: "名称",
					width: 500,
					sortable: true,
					editable: false,
					dataType: "string",
					dataIndx: "cardName",
					resizable: true,
					showText: false,
					render: function (ui) {
						var cardNameHtml = '';
						if (getCharCodeLength(ui.rowData[ui.dataIndx]) > 46) {// 显示qtip
							cardNameHtml += "<span title=\"" + ui.rowData[ui.dataIndx] + "\"  style='cursor:pointer;color:#0000ee; position: relative;top: -7px;' onclick='parent.browseCard.browse(\"" + ui.rowData.cardId + "\",\"\",false,\"" + ui.rowData.dimensionId + "\");parent.stopPropagation(event);'>" + ui.rowData[ui.dataIndx] + "</span>";
						} else {
							cardNameHtml += "<span style='cursor:pointer;color:#0000ee;position: relative;top: -7px;' onclick='parent.browseCard.browse(\"" + ui.rowData.cardId + "\",\"\",false,\"" + ui.rowData.dimensionId + "\");parent.stopPropagation(event);'>" + ui.rowData[ui.dataIndx] + "</span>";
						}
						cardNameHtml += '<span class="searchDimensionPath" >' + ui.rowData.dimensionPath + '</span>';
						return cardNameHtml;
					}
				}, {
					title: "知识类型",
					// width: 200,
					editable: false,
					dataIndx: "cardType",
					hidden: true,
					render: function (ui) {
						var cardType = ui.rowData[ui.dataIndx];
						if (cardType == 0) {
							return "文档";
						} else if (cardType == 1) {
							return "图集";
						} else if (cardType == 2) {
							return "视频集";
						} else if (cardType == 3) {
							return "文本文件";
						} else {
							return "数据错误[知识类型]";
						}
					}
				}, {
					title: "发布人",
					width: 120,
					sortable: false,
					editable: false,
					dataType: "string",
					dataIndx: "publishUsername",
					resizable: true,
					showText: false
				}, {
					title: "发布时间",
					width: 140,
					sortable: true,
					editable: false,
					dataType: "string",
					align: 'center',
					dataIndx: "publishTime",
					resizable: true,
					showText: false
				}, {
					title: "阅读次数",
					sortable: true,
					width: 100,
					align: 'center',
					editable: false,
					dataIndx: "readCount"
				}, {
					title: "讨论次数",
					sortable: true,
					width: 100,
					align: 'center',
					editable: false,
					dataIndx: "commentCount"
				}, {
					title: "操作",
					width: 75,
					sortable: false,
					align: 'left',
					editable: false,
					dataIndx: "",
					render: function (ui) {
						var btnHtml = "";
						btnHtml += "<span class='opt_icon log' onclick='showLog(\"" + ui.rowData['cardId'] + "\",\"" + encodeURIComponent(ui.rowData['cardName']) + "\");parent.stopPropagation(event);' title='日志'></span>";
						return btnHtml;
					}
				}],
				dataModel: {
					location: "remote",
					sorting: "remote",
					sortIndx: 'publishTime',
					sortDir: 'down',
					//paging: "remote",
					method: "POST",
					curPage: 1, // 当前页
					rPP: parent.gridRowPP, // 每页个数
					//rPP: 2,
					getUrl: function () {
						attrsearch.attrsearchGridConfig.dataModel.sortIndx = this.sortIndx;
						attrsearch.attrsearchGridConfig.dataModel.sortDir = this.sortDir;
						return {
							url: "./jd",
							data: {
								sid: sid,
								cmd: "com.actionsoft.apps.kms_knwl_attr_search_dosearch",
								curPage: 1,
								rowsPerPage: attrsearch.attrsearchGridConfig.dataModel.rPP,
								//rowsPerPage: parent.gridRowPP,
								searchDimensionIds: attrsearch.searchDimensionIds,
								schemaMetaData: attrsearch.schemaMetaData,
								cardName: attrsearch.cardName,
								publishTime: attrsearch.publishTime,
								publishUser: attrsearch.publishUser,
								tags: attrsearch.tags,
								sortIndx: this.sortIndx,
								sortDir: this.sortDir,
								lastPublishId: ''
							}
						};
					},
					getData: function (responseObject) {
						attrsearch.totalRecords = responseObject.data.totalRecords;
						attrsearch.lastPublishId = responseObject.data.lastPublishId;
						attrsearch.hasNextPage = responseObject.data.hasNextPage;
						if (attrsearch.hasNextPage) {
							$(".more-button").show();
							$(".search-end").hide();
						} else {
							$(".more-button").hide();
							$(".search-end").show();
						}
						return {
							curPage: responseObject.data.curPage,
							totalRecords: responseObject.data.totalRecords,
							data: responseObject.data.data
						};
					}
				}
			};
			attrsearch.searchGrid = $("#attrsearchGrid").awsGrid(attrsearch.attrsearchGridConfig);
			// attrsearch.searchGrid.find(".pq-pager").awsGridPager("option", $.awsgrid.awsGridPager.regional["zh"]);
			attrsearch.searchGrid.awsGrid({
				load: function (event, ui) {
					if (attrsearch.totalRecords === 0) {
						$("#attrsearchGrid .pq-cont").html('<div class="kms-no-km"></br><div class="title">&nbsp;没有知识</div></div>');
					} else {
						$("#attrsearchGrid .pq-cont .kms-no-km").remove();
					}
					// $('#attrsearchGrid > .aws-grid-bottom > .aws-grid-footer > button:eq(0)').hide();
					$('#attrsearchGrid > .aws-grid-bottom > .aws-grid-footer > button:eq(0)').off('mousedown.kms').on('mousedown.kms', function () {
						attrsearch.lastPublishId = '';
					});
					attrsearch.hidePagination();
				}
			});
			attrsearch.searchGrid.awsGrid({
				beforeSort: function (event, ui) {
					attrsearch.lastPublishId = '';//排序前重置
				},
				refresh: function () {
					attrsearch.hidePagination();
				}
			});
		} else {
			attrsearch.resizeSearchGrid();
		}
	},
	loadNextPage: function () {
		awsui.ajax.request({
			url: "./jd",
			method: "POST",
			//	loading: true,
			data: {
				sid: sid,
				cmd: "com.actionsoft.apps.kms_knwl_attr_search_dosearch",
				curPage: attrsearch.searchGrid.awsGrid("option").dataModel.curPage <= 0 ? 1 : attrsearch.searchGrid.awsGrid("option").dataModel.curPage + 1,
				rowsPerPage: attrsearch.attrsearchGridConfig.dataModel.rPP,
				//rowsPerPage: parent.gridRowPP,
				searchDimensionIds: attrsearch.searchDimensionIds,
				schemaMetaData: attrsearch.schemaMetaData,
				cardName: attrsearch.cardName,
				publishTime: attrsearch.publishTime,
				publishUser: attrsearch.publishUser,
				tags: attrsearch.tags,
				sortIndx: attrsearch.attrsearchGridConfig.dataModel.sortIndx,
				sortDir: attrsearch.attrsearchGridConfig.dataModel.sortDir,
				lastPublishId: attrsearch.lastPublishId
			},
			success: function (responseObject) {
				attrsearch.totalRecords = responseObject.data.totalRecords;
				attrsearch.lastPublishId = responseObject.data.lastPublishId;
				attrsearch.hasNextPage = responseObject.data.hasNextPage;
				var data = responseObject.data.data;
				attrsearch.searchGrid.awsGrid("addRow", data, "bottom");
				if (attrsearch.hasNextPage) {
					$(".more-button").show();
					$(".search-end").hide();
				} else {
					$(".more-button").hide();
					$(".search-end").show();
				}
			}
		});
	},
	hidePagination: function () {
		//隐藏页数信息
		$('#attrsearchGrid > .aws-grid-bottom > .aws-grid-footer > button:eq(1)').hide();
		$('#attrsearchGrid > .aws-grid-bottom > .aws-grid-footer > button:eq(3)').hide();
		$('#attrsearchGrid > .aws-grid-bottom > .aws-grid-footer > button:eq(4)').hide();
		$('#attrsearchGrid > .aws-grid-bottom > .aws-grid-footer > .pq-pageholder > input').attr('readonly', 'readonly');
		$('#attrsearchGrid > .aws-grid-bottom > .aws-grid-footer > .pq-pageholder > span:eq(1)').text('页');
		$('#attrsearchGrid > .aws-grid-bottom > .aws-grid-footer > .pq-pageholder > span.total').hide();
		$('#attrsearchGrid > .aws-grid-bottom > .aws-grid-footer > .pq-pageholder > span:last').hide();
		var pqPagerMsg = $('#attrsearchGrid > .aws-grid-bottom > .aws-grid-footer > .pq-pager-msg').text();
		if (pqPagerMsg.indexOf('，共') > -1) {
			$('#attrsearchGrid > .aws-grid-bottom > .aws-grid-footer > .pq-pager-msg').text(pqPagerMsg.substring(0, pqPagerMsg.indexOf('，共')));
		}
	},
	resizeSearchGrid: function () {
		attrsearch.searchGrid.width($(window).width() - 2);
		attrsearch.searchGrid.height($(window).height() - $('.head-wrap').outerHeight(true) - $('.doc-type-wrap').outerHeight(true) - $('.dimension-meta-bar').outerHeight(true) - $('.filter-bar').outerHeight(true) - 2);
		attrsearch.searchGrid.awsGrid("refresh");
		if (attrsearch.totalRecords === 0) {
			$("#attrsearchGrid .pq-cont").html('<div class="kms-no-km"></br><div class="title">&nbsp;没有知识</div></div>');
		} else {
			$("#attrsearchGrid .pq-cont .kms-no-km").remove();
		}
	},
	initSearchArea: function () {
		// 计算悬浮树的高度和位置
		var dimensionFlotageHeight = $(window).height() - $('.head-wrap').outerHeight(true) - $('.doc-type-wrap').outerHeight(true) - $('.dimension-meta-bar').outerHeight(true);
		var dimensionFlotageTop = $('#dimension-meta-bar-dimension').offset().top + $('#dimension-meta-bar-dimension').outerHeight(true);
		$('.dimension-flotage').css({
			height: dimensionFlotageHeight,
			top: dimensionFlotageTop
		});
		$('#attrsearch-separater').css({
			height: dimensionFlotageHeight,
			top: dimensionFlotageTop,
			left: $('.dimension-flotage').outerWidth(true) - 4
		});
		// 绑定知识目录的事件
		$('#dimension-meta-bar-dimension').off('click').on('click', function () {
			$("#dimension-meta-bar-dimension .img").toggleClass('up');
			$('.dimension-flotage,#attrsearch-separater').toggle();
			if (!attrsearch.dimensionTree) {
				attrsearch.initDimensionTree();
			}
			attrsearch.dimensionTree.resizeTree();
		});
		$('#dimension-meta-bar-dimension').off('mouseleave').on('mouseleave', function (e) {
			$("#dimension-meta-bar-dimension .img").removeClass('up');
			$('.dimension-flotage,#attrsearch-separater').hide();
		});
		// 计算排序下拉列表的位置
		var rightFlotageTop = $('.filter-bar-right').offset().top + $('.filter-bar-right').outerHeight(true);
		// var rightOrderFlotageLeft = $('.filter-bar-right').offset().left;
		// $('.order-list-ul').css({top:rightFlotageTop,left:rightOrderFlotageLeft});
		// 绑定排序下拉列表的事件
		$('#filter-bar-right-order').off('mouseenter').on('mouseenter', function () {
			$('.order-list-ul').show();
		});
		$('#filter-bar-right-order').off('mouseleave').on('mouseleave', function (e) {
			$('.order-list-ul').hide();
		});
		// 计算过滤下拉列表的位置
		$('.filter-flotage').css({
			top: rightFlotageTop
		});
		// 绑定过滤下拉列表的事件
		$('#filter-bar-right-filter').off('mouseenter').on('mouseenter', function () {
			$('.filter-flotage').show();
		});
		$('#filter-bar-right-filter').off('mouseleave').on('mouseleave', function (e) {
			$('.filter-flotage').hide();
		});
		// 绑定排序的事件
		$('#filter-bar-right-order').off('click').on('click', function () {
			var currSortIndx = $('div.order-text').attr('sortIndx');
			var currSortDir = $('div.order-text').attr('sortDir');
			if (currSortDir == "down") {
				$('div.order-text').attr('sortDir', 'up');
			} else if (currSortDir == "up") {
				$('div.order-text').attr('sortDir', 'down');
			}
			$('div.order-img > div[indx=up]').toggleClass('order-img-up-gray');
			$('div.order-img > div[indx=up]').toggleClass('order-img-up-green');
			$('div.order-img > div[indx=down]').toggleClass('order-img-down-gray');
			$('div.order-img > div[indx=down]').toggleClass('order-img-down-green');
			$('#searchText').val('');
			$('#attrsearchGrid').show();
			$('#attrsearchGrid-btn').show();
			$('#fullsearch-result').hide();
			$(".filter-bar").hide();
			attrsearch.attrsearchGridConfig.dataModel.sortIndx = $('div.order-text').attr('sortIndx');
			attrsearch.attrsearchGridConfig.dataModel.sortDir = $('div.order-text').attr('sortDir');
			attrsearch.lastPublishId = '';//排序后重置
			attrsearch.searchGrid = $("#attrsearchGrid").awsGrid(attrsearch.attrsearchGridConfig);
		});
		$('ul.order-list-ul li').off('click').on('click', function (e) {
			var currSortIndx = $('div.order-text').attr('sortIndx');
			var currSortDir = $('div.order-text').attr('sortDir');
			if (currSortIndx == $(this).attr('sortIndx')) {
				if (currSortDir == "down") {
					$('div.order-text').attr('sortDir', 'up');
				} else if (currSortDir == "up") {
					$('div.order-text').attr('sortDir', 'down');
				}
				$('div.order-img > div[indx=up]').toggleClass('order-img-up-gray');
				$('div.order-img > div[indx=up]').toggleClass('order-img-up-green');
				$('div.order-img > div[indx=down]').toggleClass('order-img-down-gray');
				$('div.order-img > div[indx=down]').toggleClass('order-img-down-green');
			} else {
				$('div.order-text').attr('sortIndx', $(this).attr('sortIndx'));
				$('div.order-text').attr('sortDir', 'down');
				$('div.order-img > div[indx=up]').removeClass('order-img-up-gray');
				$('div.order-img > div[indx=up]').removeClass('order-img-up-green');
				$('div.order-img > div[indx=down]').removeClass('order-img-down-gray');
				$('div.order-img > div[indx=down]').removeClass('order-img-down-green');
				$('div.order-img > div[indx=up]').addClass('order-img-up-gray');
				$('div.order-img > div[indx=down]').addClass('order-img-down-green');
				$('div.order-text').text($(this).text());
			}
			$('ul.order-list-ul').hide();
			e.stopPropagation();
			$('#searchText').val('');
			$('#attrsearchGrid').show();
			$('#attrsearchGrid-btn').show();
			$('#fullsearch-result').hide();
			$(".filter-bar").hide();
			attrsearch.attrsearchGridConfig.dataModel.sortIndx = $('div.order-text').attr('sortIndx');
			attrsearch.attrsearchGridConfig.dataModel.sortDir = $('div.order-text').attr('sortDir');
			attrsearch.lastPublishId = '';//排序后重置
			attrsearch.searchGrid = $("#attrsearchGrid").awsGrid(attrsearch.attrsearchGridConfig);
		});
	},
	openAttrSearch: function () {
		$('#searchText').val('');
		$('#attrsearchGrid').show();
		$('#attrsearchGrid-btn').show();
		$('#fullsearch-result').hide();
		$(".filter-bar").hide();
	}
};
var topList = {
	searchGrid: undefined,
	initGrid: function (topType) {
		var gridConfig = {
			width: $(window).width() - 2,
			height: $(window).height() - $('.head-wrap').outerHeight(true) - $('.doc-type-wrap').outerHeight(true) - $('.dimension-meta-bar').outerHeight(true) - $('.filter-bar').outerHeight(true) - 2 - 30,
			flexWidth: false,
			flexHeight: false,
			columnBorders: false,
			wrap: false,
			nowrapTitle: false,
			topVisible: false,
			editable: true,
			scrollModel: {
				autoFit: false,
				horizontal: true,
				vertical: true
			},
			colModel: [{
				title: "标题",
				width: 500,
				sortable: true,
				editable: false,
				dataType: "string",
				dataIndx: "cardName",
				resizable: true,
				showText: false,
				render: function (ui) {
					var cardNameHtml = '';
					if (getCharCodeLength(ui.rowData[ui.dataIndx]) > 46) {// 显示qtip
						if (ui.rowData['hasPerm'] != true) {
							cardNameHtml += "<span title=\"" + ui.rowData[ui.dataIndx] + "\"  style='cursor:pointer; position: relative;top: -7px;'>" + ui.rowData[ui.dataIndx] + "</span>";
						} else {
							cardNameHtml += "<span title=\"" + ui.rowData[ui.dataIndx] + "\"  style='cursor:pointer;color:#0000ee; position: relative;top: -7px;' onclick='parent.browseCard.browse(\"" + ui.rowData.cardId + "\",\"\",false,\"" + ui.rowData.dimensionId + "\");parent.stopPropagation(event);'>" + ui.rowData[ui.dataIndx] + "</span>";
						}
					} else {
						if (ui.rowData['hasPerm'] != true) {
							cardNameHtml += "<span style='cursor:pointer;position: relative;top: -7px;' >" + ui.rowData[ui.dataIndx] + "</span>";
						} else {
							cardNameHtml += "<span style='cursor:pointer;color:#0000ee;position: relative;top: -7px;' onclick='parent.browseCard.browse(\"" + ui.rowData.cardId + "\",\"\",false,\"" + ui.rowData.dimensionId + "\");parent.stopPropagation(event);'>" + ui.rowData[ui.dataIndx] + "</span>";
						}
					}
					cardNameHtml += '<span class="searchDimensionPath" >' + ui.rowData.dimensionPath + '</span>';
					return cardNameHtml;
				}
			}, {
				title: "发布人",
				width: 120,
				sortable: false,
				editable: false,
				dataType: "string",
				dataIndx: "publishUsername",
				resizable: true,
				showText: false
			}, {
				title: "发布时间",
				width: 140,
				sortable: true,
				editable: false,
				dataType: "string",
				align: 'center',
				dataIndx: "publishTime",
				resizable: true,
				showText: false
			}, {
				title: "阅读次数",
				sortable: true,
				width: 100,
				align: 'center',
				editable: false,
				dataIndx: "readCount"
			}, {
				title: "讨论次数",
				sortable: true,
				width: 100,
				align: 'center',
				editable: false,
				dataIndx: "commentCount"
			}, {
				title: "操作",
				width: 75,
				sortable: false,
				align: 'left',
				editable: false,
				dataIndx: "",
				render: function (ui) {
					var btnHtml = "";
					btnHtml += "<span class='opt_icon log' onclick='showLog(\"" + ui.rowData['cardId'] + "\",\"" + encodeURIComponent(ui.rowData['cardName']) + "\");parent.stopPropagation(event);' title='日志'></span>";
					if (ui.rowData['hasPerm'] != true) {
						btnHtml += "<span class='opt_icon borrow' onclick='topList.borrowCard(" + ui.rowIndxPage + ");parent.stopPropagation(event);' title='借阅'></span>";
					}
					return btnHtml;
				}
			}],
			dataModel: {
				location: "remote",
				//paging: "remote",
				method: "POST",
				getUrl: function () {
					return {
						url: "./jd",
						data: {
							sid: sid,
							cmd: "com.actionsoft.apps.kms_querycardtoplist",
							sortIndx: topType
						}
					};
				},
				getData: function (responseObject) {
					return {
						data: responseObject.data.data
					};
				}
			}
		};
		topList.searchGrid = $("#attrsearchGrid").awsGrid(gridConfig);
	},
	borrowCard: function (rowIndx) {
		$.confirm({
			title: "请确认",
			content: "确认启动知识借阅流程吗？",
			onConfirm: function () {
				var rowData = topList.searchGrid.awsGrid("getRowData", rowIndx);
				$('#cardId').val(rowData.cardId);
				$('#dimensionId').val(rowData.dimensionId);
				$('#borrowProcessDialog').dialog({
					title: '知识借阅流程',
					width: 900,
					height: $(window).height() * 0.9,
					onClose: function () {
					}
				});
				document.getElementById('borrowProcessForm').submit();
				$('#borrowProcessDialog .dlg-close').off('click').on('click', function () {
					if ($('#borrowProcessFrame').contents().find('#REASON').length != 0) { // 如果是可编辑状态(因为有的时候并非可编辑状态,比如提示错误时)
						$.confirm({
							title: "请确认",
							content: "流程已经启动，确认关闭该对话框吗？（并不会作废流程）",
							onConfirm: function () {
								$('#borrowProcessDialog').dialog('close');
							},
							onCancel: function () {
							}
						});
					} else { // 直接关闭
						$('#borrowProcessDialog').dialog('close');
					}
				});
			},
			onCancel: function () {
			}
		});
	}
};
var fullsearch = {
	rowsPerPage: parent.gridRowPP,
	curPage: 0,
	searchText: '',
	docTypeArr: [],
	searchType: "1",
	search: function () {
		$('#attrsearchGrid').hide();
		$('#attrsearchGrid-btn').hide();
		$('#fullsearch-result').show();
		$(".filter-bar").show();
		if ($("#searchType").length > 0) {
			fullsearch.searchType = $("#searchType").val();
		}
		fullsearch.searchText = $.trim($('#searchText').val());
		// 检索关键词
		if (fullsearch.searchText == '') {
			$.simpleAlert('请输入检索关键词', 'info');
			return false;
		}
		fullsearch.docTypeArr = [];
		//文件类型
		var docTypeCB = $('.doc-type-wrap input[type=checkbox]');
		for (var i = 0; i < docTypeCB.length; i++) {
			if ($(docTypeCB[i]).prop("checked")) {
				fullsearch.docTypeArr[fullsearch.docTypeArr.length] = $(docTypeCB[i]).val();
			}
		}
		// 清空列表
		$('#fullsearchListOl').empty();
		fullsearch.firstSearchFlag = true;
		// 重置分页
		fullsearch.curPage = 0;
		fullsearch.doSearch(true);
	},
	doSearch: function (firstSearchFlag) {
		$('#pagination button').hide();
		$('#pagination img,#pagination span').show();
		// 全文检索开始
		awsui.ajax.request({
			url: "./jd",
			method: "POST",
			// loading: true,
			data: {
				sid: sid,
				cmd: "com.actionsoft.apps.kms_knwl_fullsearch_list_json",
				curPage: fullsearch.curPage,
				rowsPerPage: fullsearch.rowsPerPage,
				searchText: encodeURIComponent(fullsearch.searchText),
				docTypes: JSON.stringify(fullsearch.docTypeArr),
				searchType: fullsearch.searchType
			},
			success: function (responseObject) {
				var hasNextPage = responseObject.data.data.hasNextPage;
				$('#pagination img,#pagination span').hide();
				if (hasNextPage === true) {//如果还有下一页，则显示“加载更多”按钮
					$('#pagination button').show();
					$('#pagination img,#pagination span').hide();
				} else {
					$('#pagination span').text('已经显示全部结果').show();
				}
				fullsearch.curPage = responseObject.data.data.curPage;
				var datas = responseObject.data.data.result;
				if (datas.length == 0) {
					if (firstSearchFlag) {
						$('#pagination button').hide();
						$('#pagination img,#pagination span').hide();
						$('#fullsearchListOl').append('<div class="kms-no-file"></br><div class="title">&nbsp;没有找到文件</div><div class="content">查询“' + fullsearch.searchText + '”没有结果，请尝试其他关键字或者按<span style="color: #0e6bcb;cursor: pointer;" onclick="attrsearch.openAttrSearch()">条件检索</span></div></div></div>');
					}
				} else {
					if (fullsearch.searchType == "1") {
						var browserPreview = parent.browserPreview;
						if (typeof browserPreview == "string") {
							browserPreview = browserPreview.split(',');
						}
						var browserPreview = $.grep(browserPreview, function (n, i) {// 浏览器直接预览，不调用onlinedoc
							return n != '';
						});
						for (var i = 0; i < datas.length; i++) {
							var data = datas[i];
							var li = '<li class="result-item" id="search-result-item' + i + '"><div style="position:relative;">';
							var fileType = data.fileName.lastIndexOf(".") > -1 ? data.fileName.substring(data.fileName.lastIndexOf(".") + 1, data.fileName.length) : "";
							if ($.inArray(fileType, browserPreview) != -1) {// 浏览器直接预览，不使用onlinedoc
								if (data.onlineLevel != "0" && data.onlineLevel != "2") {
									li += "<span class='result-title' style='cursor:pointer;' onclick='browserPreviewFun(\"" + data.fileId + "\",\"" + encodeURIComponent(data.fileName.replace("style='color:red'", "")) + "\",1,\"" + data.createUserPhoto + "\",\"" + data.createUser + "\");return false;'>" + data.fileName + "</span>";
								} else {
									li += "<span class='result-title' style='cursor:pointer;' onclick='browserPreviewFun(\"" + data.fileId + "\",\"" + encodeURIComponent(data.fileName.replace("style='color:red'", "")) + "\",0,\"" + data.createUserPhoto + "\",\"" + data.createUser + "\");return false;'>" + data.fileName + "</span>";
								}
							} else {
								if (parent.isOnlinedocAppActive) {
									if (data.onlineLevel != "0" && data.onlineLevel != "2") {
										li += "<span class='result-title' style='cursor:pointer;' onclick='showFullScreenPanel(\"" + parent.canPreviewType + "\",\"" + data.fileId + "\",\"" + encodeURIComponent(data.fileName.replace("style='color:red'", "")) + "\",\"" + encodeURIComponent(data.fileName.replace("style='color:red'", "")) + "\",\"0\",\"1\",\"" + data.createUserPhoto + "\",\"" + data.createUser + "\")'>" + data.fileName + "</span>";
									} else {
										li += "<span class='result-title' style='cursor:pointer;' onclick='showFullScreenPanel(\"" + parent.canPreviewType + "\",\"" + data.fileId + "\",\"" + encodeURIComponent(data.fileName.replace("style='color:red'", "")) + "\",\"" + encodeURIComponent(data.fileName.replace("style='color:red'", "")) + "\",\"0\",\"0\",\"" + data.createUserPhoto + "\",\"" + data.createUser + "\")'>" + data.fileName + "</span>";
									}
								} else {
									li += '<span class="result-title">' + data.fileName + '</span>';
								}
							}
							if (data.onlineLevel != "0" && data.onlineLevel != "2") {
								li += '<br> <span class="result-snippet"></span><br><span>知识简介：</span> <span class="result-abstract"></span><br><span class="result-dimension">位置：' + data.dimensionPath + '&nbsp;&nbsp;</span><span class="result-dimension">知识名称：' + data.cardName + '</span><span class="result-timeauthor">' + data.fileCreateTime + '&nbsp;&nbsp;' + data.fileCreateUser + '</span><span onclick="parent.downloadFile(this)" aFileId="' + data.fileId + '" class="result-download">下载</span></div></li>';
							} else {
								li += '<br> <span class="result-snippet"></span><br><span>知识简介：</span><span class="result-abstract"></span><br> <span class="result-dimension">位置：' + data.dimensionPath + '&nbsp;&nbsp;</span><span class="result-dimension">知识名称：' + data.cardName + '</span><span class="result-timeauthor">' + data.fileCreateTime + '&nbsp;&nbsp;' + data.fileCreateUser + '</span></div></li>';
							}
							$('#fullsearchListOl').append(li);
							$('#search-result-item' + i).find('span.result-snippet').html(data.content);
							$('#search-result-item' + i).find('span.result-abstract').html(data.cardContent);
						}
					} else if (fullsearch.searchType == "2") {
						for (var i = 0; i < datas.length; i++) {
							var data = datas[i];
							var li = '<li class="result-item" id="search-result-item' + i + '"><div style="position:relative;">';
							if (data.idNeedBorrow) {
								li += '<span class="result-title" style="cursor:pointer" onclick=\'fullsearch.borrowCard(\"' + data.cardId + '\",\"' + data.dimensionId + '\");parent.stopPropagation(event);\'>' + data.cardName + '</span>';
							} else {
								li += '<span class="result-title" style="cursor:pointer" onclick=\'parent.browseCard.browse(\"' + data.cardId + '\",\"\",false);parent.stopPropagation(event);\'>' + data.cardName + '</span>';
							}
							li += '<br> <span class="result-snippet"></span><span class="result-abstract"></span><br> <span class="result-dimension">位置：' + data.dimensionPath + '&nbsp;&nbsp;</span><span class="result-timeauthor">' + data.cardCreateTime + '&nbsp;&nbsp;' + data.cardCreateUser + '</span></div></li>';
							$('#fullsearchListOl').append(li);
							$('#search-result-item' + i).find('span.result-abstract').html(data.cardContent);
						}
					}
				}
			}
		});
	},
	borrowCard: function (cardId, dimensionId) {
		$.confirm({
			title: "请确认",
			content: "确认启动知识借阅流程吗？",
			onConfirm: function () {
				$('#cardId').val(cardId);
				$('#dimensionId').val(dimensionId);
				$('#borrowProcessDialog').dialog({
					title: '知识借阅流程',
					width: 900,
					height: $(window).height() * 0.9,
					onClose: function () {
					}
				});
				document.getElementById('borrowProcessForm').submit();
				$('#borrowProcessDialog .dlg-close').off('click').on('click', function () {
					if ($('#borrowProcessFrame').contents().find('#REASON').length != 0) { // 如果是可编辑状态(因为有的时候并非可编辑状态,比如提示错误时)
						$.confirm({
							title: "请确认",
							content: "流程已经启动，确认关闭该对话框吗？（并不会作废流程）",
							onConfirm: function () {
								$('#borrowProcessDialog').dialog('close');
							},
							onCancel: function () {
							}
						});
					} else { // 直接关闭
						$('#borrowProcessDialog').dialog('close');
					}
				});
			},
			onCancel: function () {
			}
		});
	},
	backToTopList: function () {
		$('#attrsearchGrid').show();
		$('#attrsearchGrid-btn').show();
		$('#fullsearch-result').hide();
		$(".filter-bar").hide();
	}
};

/**
 * 获取char长度(一个汉字两个长度)
 *
 * @param str
 * @returns
 */
function getCharCodeLength(str) {
	var len = 0;
	for (var i = 0; i < str.length; i++) {
		if (str.charCodeAt(i) > 127) {
			len += 2;
		} else {
			len++;
		}
	}
	return len;
}

/**
 * 预览
 *
 * @param fileId
 * @param fileName
 * @param fileType
 * @param canPreviewFlag
 * @param canDownloadFlag
 * @returns
 */
function showFullScreenPanel(canPreviewType, fileId, fileName, fileNameVersion, canPreviewFlag, canDownloadFlag, createUserPhoto, createUser) {
	if (canPreviewFlag != undefined && canPreviewFlag == '0') { // 文件允许预览
	} else {// 文件不允许预览
		if (canDownloadFlag != undefined && canDownloadFlag == '1') {
			parent.downloadFile(fileId);
		} else {
			$.simpleAlert('该文件不支持预览和下载', "info");
		}
		return false;
	}
	fileName = decodeURIComponent(fileName);
	fileNameVersion = decodeURIComponent(fileNameVersion);
	var fileType = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length);
	if (canPreviewType.indexOf(fileType) != -1) {
	} else {
		if (canDownloadFlag != undefined && canDownloadFlag == '1') {
			parent.downloadFile(fileId);
		} else {
			$.simpleAlert('该文件不支持预览和下载', "info");
		}
		return;
	}
	$('#fullscreenWrap').show();
	$("body").css("overflow", "hidden");
	// 将文件标题显示
	$(".toolbar-title").empty();
	/* $(".toolbar-title").append(fileName);*/
	$(".toolbar-photo img").attr('src', createUserPhoto);
	$(".toolbar-photo img").attr('userId', createUser);
	previewMyFile(fileId, canDownloadFlag);
	if (canDownloadFlag != undefined && canDownloadFlag == '0') {
		$('fsdownloadbtn').hide();
	} else if (canDownloadFlag != undefined && canDownloadFlag == '1') {
		$('#fsdownloadbtn').show();
	} else {
	}
	$('#fsdownloadbtn').attr('aFileId', fileId);
	$('#fsclosebtn').click(function () {
		closeFsPanel();
	});
}

function previewMyFile(fileId, canDownloadFlag) {
	$('#previewpanel').empty();
//    $.simpleAlert("文件正在加载，请稍侯...", "loading");
	var params = {
		fileId: fileId
	};
	var url = './jd?sid=' + sid + '&cmd=com.actionsoft.apps.kms_knwl_center_preview_file&isDownload=' + (canDownloadFlag == 1);
	awsui.ajax.post(url, params, function (responseObject) {
		if (responseObject['result'] == 'ok') {
			// $.simpleAlert("close");
			var url = responseObject["data"]['url'];
			$('#previewpanel').empty();
			$('#previewpanel').append("<iframe frameBorder='0'  class='previewfrm' id='previewfrm'></iframe>");
			$('#previewfrm').attr("src", url);
			var iframemy = document.getElementById("previewfrm");
			if (iframemy.attachEvent) {
				iframemy.attachEvent("onload", function () {
					closePreviewFile();
//		        		$.simpleAlert("close");
				});
			} else {
				iframemy.onload = function () {
					closePreviewFile();
//		        		$.simpleAlert("close");
				};
			}
		} else {
			$.simpleAlert(responseObject['msg'], responseObject['result']);
		}
	}, 'json');
}

//关闭预览
function closePreviewFile() {
	var back = $("#previewfrm").contents().find("#filepre_back");
	back.click(function () {
		// $('div[name=previewpanel]').hide();//页面关闭销毁转换请求
		$("#fullscreenWrap").hide();
	});
}

/**
 * 关闭预览
 *
 * @returns
 */
function closeFsPanel() {
	$('#fullscreenWrap').hide();
}

/**
 * 浏览器预览
 *
 * @returns
 */
function browserPreviewFun(fileId, fileName, canDownloadFlag, createUserPhoto, createUser) {
	fileName = decodeURIComponent(fileName);
	$('#fullscreenWrap').show();
	$("body").css("overflow", "hidden");
	// 将文件标题显示
	$(".toolbar-title").empty();
	/*  $(".toolbar-title").append(fileName);*/
	$(".toolbar-photo img").attr('src', createUserPhoto);
	$(".toolbar-photo img").attr('userId', createUser);
	$('#previewpanel').empty();
	$.simpleAlert("正在加载文件，请稍侯。。。", "loading");
	awsui.ajax.request({
		url: "./jd",
		method: "POST",
		data: {
			fileId: fileId,
			sid: sid,
			cmd: 'com.actionsoft.apps.kms_knwl_browser_preview'
		},
		ok: function (responseObject) {
			if (responseObject['result'] == 'ok') {
				// $.simpleAlert("close");
				var url = responseObject["data"]['url'];
				$('#previewpanel').empty();
				$('#previewpanel').append("<iframe frameBorder='0' class='previewfrm' id='previewfrm'></iframe>");
				if (responseObject.data.isImg === true) {
					$('#previewfrm').attr("src", './w?sid=' + sid + '&cmd=com.actionsoft.apps.kms_knwl_browser_preview_image&fileId=' + fileId);
				} else {
					$('#previewfrm').attr("src", responseObject.data.url);
				}
				var iframemy = document.getElementById("previewfrm");
				if (iframemy.attachEvent) {
					iframemy.attachEvent("onload", function () {
						$.simpleAlert("close");
					});
				} else {
					iframemy.onload = function () {
						$.simpleAlert("close");
					};
				}
			} else {
				$.simpleAlert(responseObject['msg'], responseObject['result']);
			}
		},
		err: function () {
			$('#window-mask').hide();
			$('#fsclosebtn').click();
		}
	});
	if (canDownloadFlag === 0) {
		$('#fsdownloadbtn').hide();
	} else if (canDownloadFlag == 1) {
		$('#fsdownloadbtn').show();
	} else {
	}
	$('#fsdownloadbtn').attr('aFileId', fileId);
	$('#fsclosebtn').click(function () {
		closeFsPanel();
	});
}