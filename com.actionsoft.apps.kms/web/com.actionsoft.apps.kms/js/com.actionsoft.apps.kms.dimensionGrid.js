var allDG = {
	dragSeparator: function () {
		/* 拖动分隔栏开始 */
		if (all.isDimensionKnwlPage) {
			if (getCookie('kms.knwlcenter.separater.' + dimensionId + '.originalWidth')) {
				$('#all-left').css('width', getCookie('kms.knwlcenter.separater.' + dimensionId + '.originalWidth'));
				$('#all-right').css('margin-left', ($('#all-left').outerWidth(true) + $('#all-separater').outerWidth(true)));
			}
		} else {
			if (getCookie('kms.knwlcenter.separater.originalWidth')) {
				$('#all-left').css('width', getCookie('kms.knwlcenter.separater.originalWidth'));
				$('#all-right').css('margin-left', ($('#all-left').outerWidth(true) + $('#all-separater').outerWidth(true)));
			}
		}
		var dragFlag = false; // 拖动标记,mousedown时可以拖动,mouseup时不可以拖动
		var originalPageX = 0;
		var originalWidth = parseInt($('#all-left').css('width'));
		$('#all-separater').off('mousedown').on('mousedown', function (e) {
			dragFlag = true;
			originalPageX = e.pageX;
			$(document).on("selectstart.dimension", function () {
				return false;
			});
			$(document).off('mousemove.dimension').on('mousemove.dimension', function (e) {
				if (dragFlag === true) {
					var minWidthControl = parseInt($('#all-left').css('width'));
					var movePx = e.pageX - originalPageX;
					if (!((movePx > 0 && minWidthControl > 500) || (movePx < 0 && minWidthControl < 240))) {
						$('#all-left').css('width', (originalWidth + movePx));
						$('#all-right').css('margin-left', ($('#all-left').outerWidth(true) + $('#all-separater').outerWidth(true)));
						all.resizeDimensionCardGrid();
					} else {
						$(document).trigger('mouseup.dimension');
					}
				}
			});
			$(document).off('mouseup.dimension').on('mouseup.dimension', function (e) {
				if (dragFlag === true) {
					dragFlag = false;
					originalWidth = parseInt($('#all-left').css('width'));
					$(document).off("selectstart.dimension");
					$(document).off('mousemove.dimension');
					$(document).off('mouseup.dimension');
					// 记录cookie
					if (all.isDimensionKnwlPage) {
						setCookie('kms.knwlcenter.separater.' + dimensionId + '.originalWidth', originalWidth);
					} else {
						setCookie('kms.knwlcenter.separater.originalWidth', originalWidth);
					}
				}
			});
		});
		/* 拖动分隔栏结束 */
	},
	dimensionId: '',
	treeObj: undefined,
	tmpIsDimensionKnwlPage: false,//临时变量，第一次加载完树的data后置为false
	initTree: function () {
		all.tmpIsDimensionKnwlPage = (all.isDimensionKnwlPage == true ? true : false);
		// 初始化维度树
		if (!all.treeObj) {
			var treeDataUrl = "./w?sid=" + sid + "&cmd=com.actionsoft.apps.kms_knwl_center_dimension_tree_json";
			var setting = {
				showLine: false,
				sort: true,
				event: {
					beforeExpand: all.getChildren,
					onClick: all.treeClick
				},
				animate: true,
				dataModel: {
					url: treeDataUrl,
					method: "POST",
					dataType: "json",
					params: {
						parentId: all.isDimensionKnwlPage ? dimensionId : '',
						isDimensionKnwlPage: all.tmpIsDimensionKnwlPage
					}
				}
			};
			all.treeObj = awsui.tree.init($("#dimensionTree"), setting);
			// 无权限维度的cursor为default
			var result = all.treeObj.getRootNode();
			for (var i = 0 && result != null; i < result.length; i++) {
				if (result[i].hasPerm === false) {
					all.treeObj.getNodeDomById(result[i].id).addClass('treeNoPerm');
				}
			}
			// 取第一个维度的维度列表
			var rootNodes = all.treeObj.getRootNode();
			if (rootNodes.length === 0) {
				$('#dimensionTree').html('<div class="kms-no-record">无知识分类</div>');
			} else {
				if (all.isDimensionKnwlPage) {//如果是独立部署页面，并且只有根节点，则不显示左侧left区域
					if (rootNodes[0].open === undefined) {
						$('#all-left,#all-separater').hide();
						$('#all-right').css({'margin-left': 0, 'left': 0});
					}
				}
				for (var i = 0; i < rootNodes.length; i++) {
					if (rootNodes[i].hasPerm === true) {
						var firstNodeDom = all.treeObj.getNodeDomById(rootNodes[i].id);
						firstNodeDom.trigger('click');
						break;
					}
				}
				all.treeObj.setting.dataModel.params.isDimensionKnwlPage = false;
			}
			// // 第一层维度的font-size为16 其余的层级为14(默认就是14)
			// $("#dimensionTree li[level=0] > a").css('font-size', '16px');
		}
	},
	// 展开节点
	getChildren: function (treeNode) {
		var nodeDom = all.treeObj.getNodeDomById(treeNode.id);
		if (nodeDom.find("span:eq(1)[class=root-open]").length == 1) { // 闭合时无需请求网络
			return false;
		}
		if (nodeDom.siblings("ul").length == 1) { // 已经请求的网络的节点无需再次请求网络
			return false;
		}
		if (treeNode.open != null) {
			all.treeObj.setting.dataModel.params.parentId = treeNode.id;
			var result = all.treeObj.getData(all.treeObj.setting.dataModel);
			all.treeObj.buildChilren(result, treeNode);
			// 无权限维度的cursor为default
			for (var i = 0 && result != null; i < result.length; i++) {
				if (result[i].hasPerm === false) {
					all.treeObj.getNodeDomById(result[i].id).addClass('treeNoPerm');
				}
			}
		}
	},
	// 维度树单击事件
	treeClick: function (treeNode) {
		$("#publishCardBtnForAll,#moveCardBtn").hide();
		if (treeNode.hasPerm === true) {
			if (!all.isDimensionKnwlPage) {
				// 展示维度路径
				var pathNodeArr = [];
				var parentNodeTmp = treeNode;
				while (parentNodeTmp) {
					pathNodeArr[pathNodeArr.length] = parentNodeTmp;
					parentNodeTmp = all.treeObj.getParentNodeById(parentNodeTmp.id);
				}
				$('#dimensionPath').empty();
				if (pathNodeArr.length === 1) {
					var dimensionPathHtml = '' + pathNodeArr[0].name + '';
					$('#dimensionPath').html(dimensionPathHtml);
				} else {
					var dimensionPathHtml = '<a href="javascript:" onclick="window.all.treeUp();return false;" style="color:#079cda;padding-right: 10px;border-right: 1px solid #bdbdbd;margin-right:10px;">返回</a>';
					for (var i = pathNodeArr.length - 1; i >= 0; i--) {
						if (i != 0) {
							dimensionPathHtml += ('<a href="javascript:" style="color:#079cda;" onclick="javascript:window.all.treeObj.getNodeDomById(\'' + pathNodeArr[i].id + '\').trigger(\'click\');return false;">' + pathNodeArr[i].name + '</a>');
							dimensionPathHtml += '<span class="dimension-path"></span>';
						} else {
							dimensionPathHtml += pathNodeArr[i].name;
						}
					}
					dimensionPathHtml += '</ul>';
					$('#dimensionPath').html(dimensionPathHtml);
				}
			}
			if (treeNode.showType == 1 || treeNode.showType == 2) { // 普通维度
				// 清空过滤input内容
				$('#filterAllInput').val('');
				$('#dimensionCardToolbar,#dimension-card-grid').show();
				$('#hotspotDiv').hide();
				// 刷新列表
				all.dimensionId = treeNode.id;
				if (!all.dimensionCardGrid) {
					all.initDimensionCardGrid();
				} else {
					$("#publishCardBtnForAll,#moveCardBtn").hide();
					all.dimensionCardGrid.awsGrid("refreshDataAndView");
				}
			} else if (treeNode.showType == 0) { // 知识地图
				$('#dimensionCardToolbar,#dimension-card-grid').hide();
				$('#hotspotDiv').show();
				var src = encodeURI("./w?sid=" + sid + "&cmd=com.actionsoft.apps.kms_hotspot_home&dimensionId=" + treeNode.id + "");
				if ($("#hotspotFrame").attr('src') != src) {
					$("#hotspotFrame").attr('src', src);
				}
			}
			all.resizeDimensionCardGrid();
		}
	},
	isDimensionKnwlPage: false,// 是否是独立的知识列表页面
	dimensionCardGrid: undefined,
	isNeedBorrow: false,
	isDimensionManager: false,
	totalRecords: 0,
	// 全部-维度知识grid初始化
	initDimensionCardGrid: function () {
		if (!all.dimensionCardGrid) {
			// 计算每页展示多少条比较合适(5的倍数,不出现滚动条，且能尽量充满页面)
			// var gridHeight = $('#tabs-content').height() -
			// $('#dimensionCardToolbar').outerHeight(true) - 2;
			// var gridContentHeight = gridHeight - 25 - 27; // 25为grid的top
			// 27位grid的bottom
			// var gridCounts = Math.floor(Math.floor(gridContentHeight / 34) /
			// 5) * 5;
			var dimensionCardGridConfig = {
				width: all.isDimensionKnwlPage ? $(window).width() - ($('#all-left').is('visible') ? $('#all-left').outerWidth(true) : 0) - 2 : $('#tab-all').outerWidth(true) - $('#all-left').outerWidth(true) - 2,
				height: all.isDimensionKnwlPage ? $(window).height() - $('#dimensionCardToolbar').outerHeight(true) - 2 : $('#tabs-content').height() - $('#dimensionCardToolbar').outerHeight(true) - 2,
				flexWidth: false,
				flexHeight: false,
				wrap: false,
				nowrapTitle: false,
				topVisible: false,
				editable: true,
				columnBorders: false,
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
					width: 300,
					sortable: true,
					editable: false,
					dataType: "string",
					dataIndx: "cardName",
					resizable: true,
					showText: false,
					render: function (ui) {
						var cardNameText = ui.rowData[ui.dataIndx];
						if (all.isNeedBorrow === true) { // 借阅无法预览
							if (ui.rowData['createUser'] !== uid) {
								return cardNameText;
							} else {
								if (getCharCodeLength(cardNameText) > 46) { // 显示qtip
									return "<span style='cursor:pointer;color:#0000EE;' title=\"" + cardNameText + "\" onclick='parent.browseCard.browse(\"" + ui.rowData.cardId + "\",\"\",true,\"" + ui.rowData.dimensionId + "\"," + ui.rowIndxPage + ",\"all\");parent.stopPropagation(event);'>" + cardNameText + "</span>";
								} else {
									return "<span style='cursor:pointer;color:#0000EE;' onclick='parent.browseCard.browse(\"" + ui.rowData.cardId + "\",\"\",true,\"" + ui.rowData.dimensionId + "\"," + ui.rowIndxPage + ",\"all\");parent.stopPropagation(event);'>" + cardNameText + "</span>";
								}
							}
						} else {
							if (getCharCodeLength(cardNameText) > 46) { // 显示qtip
								return "<span style='cursor:pointer;color:#0000EE;' title=\"" + cardNameText + "\" onclick='parent.browseCard.browse(\"" + ui.rowData.cardId + "\",\"\",true,\"" + ui.rowData.dimensionId + "\"," + ui.rowIndxPage + ",\"all\");parent.stopPropagation(event);'>" + cardNameText + "</span>";
							} else {
								return "<span style='cursor:pointer;color:#0000EE;' onclick='parent.browseCard.browse(\"" + ui.rowData.cardId + "\",\"\",true,\"" + ui.rowData.dimensionId + "\"," + ui.rowIndxPage + ",\"all\");parent.stopPropagation(event);'>" + cardNameText + "</span>";
							}
						}
					}
				}, {
					title: "发布人",
					width: 100,
					sortable: true,
					editable: false,
					dataType: "string",
					dataIndx: "publishUsername",
					resizable: true,
					showText: false
				}, {
					title: "发布时间",
					width: 120,
					sortable: true,
					editable: false,
					dataType: "string",
					align: 'center',
					dataIndx: "publishTime",
					resizable: true,
					showText: false
				}, {
					title: "知识类型",
					// width: 200,
					editable: false,
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
					title: "阅读次数",
					sortable: true,
					editable: false,
					width: 70,
					align: 'center',
					dataIndx: "readCount"
				}, {
					title: "重要级别",
					width: 80,
					editable: false,
					dataIndx: "rdoSL"
				}, {
					title: "操作",
					width: 150,
					align: 'left',
					sortable: false,
					editable: false,
					dataIndx: "",
					render: function (ui) {
						var btnHtml = '';
						if (all.isDimensionManager) {
							btnHtml += "<span class='opt_icon edit' onclick='me.editCardDialog(\"" + ui.rowIndxPage + "\",\"all\");parent.stopPropagation(event);' title='编辑'></span>";
							btnHtml += "<span class='opt_icon publish' onclick='me.publishCardDialog(\"all\",\"" + ui.rowIndxPage + "\");parent.stopPropagation(event);' title='发布'></span>";
							btnHtml += "<span class='opt_icon cancelpublish' onclick='publish.cancelPublishCard(" + ui.rowIndxPage + ",\"all\");parent.stopPropagation(event);' title='取消发布'></span>";
							btnHtml += "<span class='opt_icon log' onclick='showLog(\"" + ui.rowData['cardId'] + "\",\"" + encodeURIComponent(ui.rowData['cardName']) + "\");parent.stopPropagation(event);' title='日志'></span>";
						}
						if (all.isNeedBorrow) {// 如果需要借阅并且不是知识创建人
							if (ui.rowData['createUser'] !== uid) {
								btnHtml += "<span class='opt_icon borrow' onclick='window.all.borrowCard(" + ui.rowIndxPage + ");parent.stopPropagation(event);' title='借阅'></span>";
							}
						}
						return btnHtml;
					}
				}],
				dataModel: {
					location: "remote",
					sorting: "remote",
					sortIndx: 'publishTime',
					sortDir: 'down',
					paging: "remote",
					method: "POST",
					curPage: 1, // 当前页
					rPP: parent.gridRowPP, // 每页个数
					getUrl: function () {
						return {
							url: "./jd",
							data: {
								sid: sid,
								cmd: "com.actionsoft.apps.kms_knwl_center_dimension_card_list_json",
								dimensionId: all.dimensionId,
								curPage: all.dimensionCardGrid == undefined ? 1 : (all.dimensionCardGrid.awsGrid("option").dataModel.curPage <= 0 ? 1 : all.dimensionCardGrid.awsGrid("option").dataModel.curPage),
								rowsPerPage: dimensionCardGridConfig.dataModel.rPP,
								sortIndx: this.sortIndx,
								sortDir: this.sortDir,
								filter: encodeURIComponent($('#filterAllInput').val())
							}
						};
					},
					getData: function (responseObject) {
						all.isNeedBorrow = responseObject.data.isNeedBorrow;
						all.isDimensionManager = responseObject.data.isDimensionManager;
						all.totalRecords = responseObject.data.totalRecords;
						return {
							curPage: responseObject.data.curPage,
							totalRecords: responseObject.data.totalRecords,
							data: responseObject.data.data
						};
					}
				}
			};
			all.dimensionCardGrid = $("#dimension-card-grid").awsGrid(dimensionCardGridConfig);
			all.dimensionCardGrid.find(".pq-pager").awsGridPager("option", $.awsgrid.awsGridPager.regional["zh"]);
			all.dimensionCardGrid.awsGrid({
				load: function (event, ui) {
					if (all.totalRecords === 0) {
						$("#dimension-card-grid .pq-cont").html('<div class="kms-no-km"></br><div class="title">&nbsp;没有知识</div><div class="content">该路径下没有知识，可以在“知识中心-个人”中新建知识、发布到这里</div></div>');
					} else {
						$("#dimension-card-grid .pq-cont .kms-no-km").remove();
					}
				}
			});
			all.dimensionCardGrid.awsGrid({
				refresh: function (event, ui) {
					var length = all.dimensionCardGrid.awsGrid("getSelectedRow").length;
					if (length > 0) {
						if (all.isDimensionManager) {
							$("#publishCardBtnForAll,#moveCardBtn").show();
						}
					} else {
						$("#publishCardBtnForAll,#moveCardBtn").hide();
					}
				}
			});
			all.dimensionCardGrid.on("awsgridrowselect", function (evt, ui) {
				if (all.isDimensionManager) {
					$("#publishCardBtnForAll,#moveCardBtn").show();
				}
			});
			all.dimensionCardGrid.on("awsgridrowunselect", function (evt, ui) {
				var length = all.dimensionCardGrid.awsGrid("getSelectedRow").length;
				if (length > 1) {
					if (all.isDimensionManager) {
						$("#publishCardBtnForAll,#moveCardBtn").show();
					}
				} else {
					$("#publishCardBtnForAll,#moveCardBtn").hide();
				}
			});
		} else {
			all.resizeDimensionCardGrid();
		}
	},
	borrowCard: function (rowIndx) {
		$.confirm({
			title: "请确认",
			content: "确认启动知识借阅流程吗？",
			onConfirm: function () {
				var rowData = all.dimensionCardGrid.awsGrid("getRowData", rowIndx);
				$('#cardId').val(rowData.cardId);
				$('#dimensionId').val(all.dimensionId);
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
	resizeDimensionCardGrid: function () {
		if (all.dimensionCardGrid) {
			all.dimensionCardGrid.width(all.isDimensionKnwlPage ? $(window).width() - ($('#all-left').is(':visible') ? $('#all-left').outerWidth(true) : 0) - 2 : $('#tab-all').outerWidth(true) - $('#all-left').outerWidth(true) - 2);
			all.dimensionCardGrid.height(all.isDimensionKnwlPage ? $(window).height() - $('#dimensionCardToolbar').outerHeight(true) - 2 : $('#tabs-content').height() - $('#dimensionCardToolbar').outerHeight(true) - 2);
			all.dimensionCardGrid.awsGrid("refresh");
			if (all.totalRecords === 0) {
				$("#dimension-card-grid .pq-cont").html('<div class="kms-no-km"></br><div class="title">&nbsp;没有知识</div><div class="content">该路径下没有知识，可以在“知识中心-个人”中新建知识、发布到这里</div></div>');
			} else {
				$("#dimension-card-grid .pq-cont .kms-no-km").remove();
			}
		}
	}
};

function showEditor() {
	$("#cardEditTd").show();
	$("#cardEditNoContent").hide();
}

var meDG = {
	cardUUID: '',
	// 编辑知识
	editCardDialog: function (rowIndxPage, gridType) {
		var rowData = {};
		if (gridType === 'all') {
			rowData = all.dimensionCardGrid.awsGrid("getRowData", rowIndxPage);
		} else if (gridType === 'me') {
			rowData = me.meGrid.awsGrid("getRowData", rowIndxPage);
		} else if (gridType === 'publish') {
			rowData = publish.publishGrid.awsGrid("getRowData", rowIndxPage);
		}
		// 表单数据使用已经查询的Grid数据,文件列表请求数据库
		me.cardUUID = rowData.cardId;
		$('#cardName').val(rowData.cardName);
		$('#validDate').val(rowData.validDate);
		//$('#cardContext').val(rowData.cardContext);
		if (window.cardContentUM) {
			cardContentUM.destroy();
		}
		if (rowData.cardContext == "") {
			$("#cardEditTd").hide();
			$("#cardEditNoContent").show();
		} else {
			$("#cardEditTd").show();
			$("#cardEditNoContent").hide();
		}
		$("#cardEditTd").html("<script type='text/plain' id='cardEditInfo' name='cardEditInfo'  style='height:170px;white-space: normal;width:98%' >" + rowData.cardContext + "</script>");
		var toolbar = window.advancedToolbar;
		toolbar.autoHeightEnabled = false;
		UE.Editor.prototype.placeholder = function (justPlainText) {
			var _editor = this;
			_editor.addListener("focus", function () {
				/*var localHtml = _editor.getContent();
				if ($.trim(localHtml) === $.trim("<p>" + justPlainText + "</p>")) {
					_editor.setContent(" ");
				}*/
			});
			_editor.addListener("blur", function () {
				var localHtml = _editor.getContent();
				if (!localHtml) {
					$("#cardEditTd").hide();
					$("#cardEditNoContent").show();
					//_editor.setContent(justPlainText);
				}
			});
			_editor.ready(function () {
				_editor.fireEvent("blur");
			});
		};
		cardContentUM = UE.getEditor("cardEditInfo", toolbar);
		cardContentUM.placeholder("");
		AddBtnFunc(cardContentUM, "cardEditInfo", "", false, false, false);
		//$("#rdoOL" + rowData.onlineLevel).check("option", "checked", true);
		var rdoOLOption = {
			width: 250,
			data: [
				{
					text: "常规",
					children: [
						{id: "1", text: "转换PDF格式在线阅读，允许下载"},
						{id: "2", text: "转换PDF格式在线阅读，禁止下载"}
					]
				},
				{
					text: "安全",
					children: [
						{id: "0", text: "转换图片格式在线阅读，禁止下载（首次转换时间较长，客户端阅读快）"}
					]
				}
			]
		};
		if ($("#rdoOL").attr("data-select2-id") != "rdoOL") {
			$("#rdoOL").select2(rdoOLOption);
		}
		$("#rdoOL").val(rowData.onlineLevel).trigger("change");
		$("#rdoSL" + rowData.securityLevel).check("option", "checked", true);
		if (!me.isCommentSB) {
			me.isCommentSB = $("#isCommentSB").switchButton({
				swheight: 25,
				swwidth: 100,
				ontext: "允许评论",
				offtext: "禁止评论"
			});
		}
		me.isCommentSB.changeStatus(rowData.isComment === 1 ? true : false);
		if (!me.isRateSB) {
			me.isRateSB = $("#isRateSB").switchButton({
				swheight: 25,
				swwidth: 100,
				ontext: "允许打分",
				offtext: "禁止打分"
			});
		}
		me.isRateSB.changeStatus(rowData.isRate === 1 ? true : false);
		awsui.ajax.request({
			url: "./jd",
			method: "POST",
			data: {
				sid: sid,
				cmd: "com.actionsoft.apps.kms_knwl_center_file_list_json",
				cardId: me.cardUUID
			},
			ok: function (responseObject) {
				var fileJA = responseObject.data;
				if (fileJA.length === 0) {
					$('#fileTable').append('<tr><td colspan="10" style="text-align: center;"><div class="kms-no-file">无文件</div></td></tr>');
				} else {
					if (typeof browserPreview == 'string') {
						var browserPreview = $.grep(parent.browserPreview.split(','), function (n, i) {// 浏览器直接预览，不调用onlinedoc
							return n != '';
						});
					} else {
						var browserPreview = $.grep(parent.browserPreview, function (n, i) {// 浏览器直接预览，不调用onlinedoc
							return n != '';
						});
					}
					for (var i = 0; i < fileJA.length; i++) {
						var file = fileJA[i];
						var tr = "<tr id='" + file.id + "TR'>";
						tr += "<td style='text-align:center;'>" + (i + 1) + "</td>";
						if (file.fileState == 2) {
							tr += "<td><div class='file_icon file-type-" + file.fileSuffixIcon + "'></div><div class='browse_file_name' title='" + file.fileName + "'><a href='javascript:' onclick='browserPreviewFun(\"" + file.id + "\",\"" + encodeURIComponent(file.fileName) + "\",0,\"" + file.createUserPhoto + "\",\"" + file.createUser + "\");'>" + file.fileName + "</a></div></td>";
						} else {
							var fileType = file.fileName.lastIndexOf(".") > -1 ? file.fileName.substring(file.fileName.lastIndexOf(".") + 1, file.fileName.length) : "";
							if ($.inArray(fileType, browserPreview) != -1) {// 浏览器直接预览，不使用onlinedoc
								tr += "<td><div class='file_icon file-type-" + file.fileSuffixIcon + "'></div><div class='browse_file_name' title='" + file.fileName + "'><a href='javascript:' onclick='browserPreviewFun(\"" + file.id + "\",\"" + encodeURIComponent(file.fileName) + "\",1,\"" + file.createUserPhoto + "\",\"" + file.createUser + "\");'>" + file.fileName + "</a></div></td>";
							} else {
								if (parent.isOnlinedocAppActive) {
									tr += "<td><div class='file_icon file-type-" + file.fileSuffixIcon + "'></div><div class='browse_file_name' title='" + file.fileName + "'><a href='javascript:' onclick='showFullScreenPanel(\"" + parent.canPreviewType + "\",\"" + file.id + "\",\"" + encodeURIComponent(file.fileName) + "\",\"" + encodeURIComponent(file.fileName) + "\",\"0\",\"1\",\"" + file.createUserPhoto + "\",\"" + file.createUser + "\")'>" + file.fileName + "</a></div></td>";
								} else {
									tr += "<td><div class='file_icon file-type-" + file.fileSuffixIcon + "'></div><div class='browse_file_name' title='" + file.fileName + "'>" + file.fileName + "</div></td>";
								}
							}
						}
						var deleteBtn = '<a href="javascript:" onclick="me.deleteFile(\'' + file.id + '\');return false;"><span class="icon_delete_file"></span></a>';
						tr += "<td>";
						if (file.fileState == 2) {
						} else {
							tr += "<a class='file_download' target='_blank' href='" + file.fileDownloadURL + "'></a>"
						}
						tr += "</td><td>" + file.fileVer + "</td><td class='browse_createuser'>" + file.createUsername + "</td><td>" + AWSFile.formatSize(file.fileSize) + "</td><td style='text-align: center;'>" + file.createTime + "</td><td style='text-align: center;'>" + deleteBtn + "</td></tr>";
						$('#fileTable').append(tr);
					}
				}
			}
		});
		$('#knwlDocDialog').dialog({
			title: '编辑知识',
			width: 1000,
			height: 538,
			onClose: function () {
				// 清空表单和文件列表
				$('#cardName').val('');
				$('#validDate').val('');
				//$("#rdoOL1").check("option", "checked", true);
				//$("#rdoSL0").check("option", "checked", true);
				$("#rdoOL").val("").trigger("change");
				me.isCommentSB.changeStatus(true);
				me.isRateSB.changeStatus(true);
				$('#fileTable tr[id!=colTR]').remove();
				if (window.cardContentUM) {
					cardContentUM.destroy();
				}
				$("#cardEditTd").hide();
				$("#cardEditNoContent").show();
				$("#cardEditTd").html("<script type='text/plain' id='cardEditInfo' name='cardEditInfo' style='height:170px;white-space: normal;width:98%' ></script>");
				var toolbar = window.advancedToolbar;
				toolbar.autoHeightEnabled = false;
				UE.Editor.prototype.placeholder = function (justPlainText) {
					var _editor = this;
					_editor.addListener("focus", function () {
						/*var localHtml = _editor.getContent();
						if ($.trim(localHtml) === $.trim("<p>" + justPlainText + "</p>")) {
							_editor.setContent(" ");
						}*/
					});
					_editor.addListener("blur", function () {
						var localHtml = _editor.getContent();
						if (!localHtml) {
							$("#cardEditTd").hide();
							$("#cardEditNoContent").show();
							//_editor.setContent(justPlainText);
						}
					});
					_editor.ready(function () {
						_editor.fireEvent("blur");
					});
				};
				cardContentUM = UE.getEditor("cardEditInfo", toolbar);
				cardContentUM.placeholder("");
				AddBtnFunc(cardContentUM, "cardEditInfo", "", false, false, false);
			}
		});
		$('#knwlDocOkBtn').off('click').on('click', {
			gridType: gridType
		}, me.editKnwl);
		$('#knwlDocNoBtn').off('click').on('click', {
			btn: "edit"
		}, me.closeKnwlDialog);
		$('#knwlDocDialog .dlg-close').off('click.knwlDoc').on('click.knwlDoc', {
			btn: "edit"
		}, me.closeKnwlDialog);
		// 上传文档
		$("#uploadDoc").upfile({
			sid: sid,
			appId: "com.actionsoft.apps.kms",
			groupValue: rowData.createUser,
			fileValue: me.cardUUID,
			numLimit: 0,
			sizeLimit: maxFileSize * 1024 * 1024,
			filesToFilter: [["*", "*"]],
			repositoryName: "-doc-",
			done: function (e, data) {
				// 增加一行
				if (data['result']['data']['result'] == 'ok') {
					$('#fileTable div.kms-no-file').parent().parent().remove();
					var fileName = decodeURIComponent(data['files'][0]['name']);
					var fileDownloadURL = data['result']['data']['data']['attrs']['fileDownloadURL'];
					var fileSize = data['result']['files']['size'];
					var fileVer = data['result']['data']['data']['attrs']['fileVer'];
					var createTime = data['result']['data']['data']['attrs']['createTime'];
					var fileSuffixIcon = data['result']['data']['data']['attrs']['fileSuffixIcon'];
					var createUsername = data['result']['data']['data']['attrs']['createUsername'];
					var fileId = data['result']['data']['data']['attrs']['fileId'];
					var fileCreateUserPhoto = data['result']['data']['data']['attrs']['fileCreateUserPhoto'];
					var fileCreateUser = data['result']['data']['data']['attrs']['fileCreateUser'];
					var tr = "<tr id='" + fileId + "TR'>";
					tr += "<td style='text-align:center;'>" + ($('#fileTable tr[id!=colTR]').length + 1) + "</td>";
					if (typeof browserPreview == 'string') {
						var browserPreview = $.grep(parent.browserPreview.split(','), function (n, i) {// 浏览器直接预览，不调用onlinedoc
							return n != '';
						});
					} else {
						var browserPreview = $.grep(parent.browserPreview, function (n, i) {// 浏览器直接预览，不调用onlinedoc
							return n != '';
						});
					}
					var fileType = fileName.lastIndexOf(".") > -1 ? fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length) : "";
					if ($.inArray(fileType, browserPreview) != -1) {// 浏览器直接预览，不使用onlinedoc
						tr += "<td><div class='file_icon file-type-" + fileSuffixIcon + "'></div><div class='browse_file_name' title='" + fileName + "'><a href='javascript:' onclick='browserPreviewFun(\"" + fileId + "\",\"" + encodeURIComponent(fileName) + "\",1,\"" + fileCreateUserPhoto + "\",\"" + fileCreateUser + "\");return false;'>" + fileName + "</a></div></td>";
					} else {
						if (parent.isOnlinedocAppActive) {
							tr += "<td><div class='file_icon file-type-" + fileSuffixIcon + "'></div><div class='browse_file_name' title='" + fileName + "'><a href='javascript:' onclick='showFullScreenPanel(\"" + parent.canPreviewType + "\",\"" + fileId + "\",\"" + encodeURIComponent(fileName) + "\",\"" + encodeURIComponent(fileName) + "\",\"0\",\"1\",\"" + fileCreateUserPhoto + "\",\"" + fileCreateUser + "\")'>" + fileName + "</a></div></td>";
						} else {
							tr += "<td><div class='file_icon file-type-" + fileSuffixIcon + "'></div><div class='browse_file_name' title='" + fileName + "'>" + fileName + "</div></td>";
						}
					}
					var deleteBtn = '<a href="javascript:" onclick="me.deleteFile(\'' + fileId + '\');return false;"><span class="icon_delete_file"></span></a>';
					tr += "<td><a class='file_download' target='_blank' href='" + fileDownloadURL + "'></a></td><td>" + fileVer + "</td><td class='browse_createuser'>" + createUsername + "</td><td>" + AWSFile.formatSize(fileSize) + "</td><td style='text-align: center;'>" + createTime + "</td><td style='text-align: center;'>" + deleteBtn + "</td></tr>";
					$('#fileTable').append(tr);
					$('#fileDiv').scrollTop($('#fileDiv').prop("scrollHeight")); // 滚动到最底端
				}
			},
			add: function (e, data) {
				var flag = true;
				// 判断大小
				var sizeLimit = maxFileSize * 1024 * 1024;
				if (data.originalFiles.length > 0) {
					$.each(data.originalFiles, function (index, file) {
						if (file.size > 0) {
							if (sizeLimit != 0 && sizeLimit < file.size) {
								flag = false;
								var _sizeLimitStr = AWSFile.formatSize(sizeLimit);
								_sizeLimitStr = _sizeLimitStr.replace(".00", "");
								$.simpleAlert(文件大小不允许超过 + _sizeLimitStr, "info");
								return false;
							}
						} else {
							flag = false;
							$.simpleAlert(空文件不能上传, "info");
							return false;
						}
					});
				}
				// 判断后缀
				if (flag) {
					if (data.originalFiles.length > 0) {
						$.each(data.originalFiles, function (index, file) {
							var dotIndex = file.name.lastIndexOf(".");
							var fileType = file.name.substring(dotIndex + 1, file.name.length);
							var blackFileArr = blackFileList.split('@`@');
							if ($.inArray(fileType, blackFileArr) !== -1) {
								flag = false;
								$.simpleAlert('后缀为' + fileType + '的文件不允许上传', "info");
								return false;
							}
						});
					}
				}
				return flag;
			},
			complete: function (e, data) {
			}
		});
	},
	editKnwl: function (event) {
		var cardName = $.trim($('#cardName').val());
		if (cardName == '') {
			$.simpleAlert('[知识名称]不允许为空', 'info');
			return false;
		} else {
			cardName = $('#cardName').val();
		}
/*
if (cardName.length > 128) {
			$.simpleAlert('[知识名称]长度不能超过128个字符', 'info');
			return false;
		}
*/
		if (cardName.length > 2000) {
			$.simpleAlert('[知识名称]长度不能超过2000个字符', 'info');
			return false;
		}
		var onlineLevel = 0;
		/*if ($("#rdoOL0").prop("checked")) {
			onlineLevel = 0;
		} else if ($("#rdoOL1").prop("checked")) {
			onlineLevel = 1;
		} else if ($("#rdoOL2").prop("checked")) {
			onlineLevel = 2;
		}*/
		onlineLevel = $("#rdoOL").val();
		if (onlineLevel == '') {
			$.simpleAlert('[格式转换]不允许为空', 'info');
			return false;
		}
		var securityLevel = 0;
		if ($("#rdoSL0").prop("checked")) {
			securityLevel = 0;
		} else if ($("#rdoSL1").prop("checked")) {
			securityLevel = 1;
		} else if ($("#rdoSL2").prop("checked")) {
			securityLevel = 2;
		}
		awsui.ajax.request({
			url: "./jd",
			method: "POST",
			data: {
				sid: sid,
				cmd: "com.actionsoft.apps.kms_knwl_center_update_card",
				cardId: me.cardUUID,
				cardName: cardName,
				validDate: $('#validDate').val(),
				onlineLevel: onlineLevel,
				securityLevel: securityLevel,
				cardType: 0,
				isComment: $("#isCommentSB")[0].checked,
				isRate: $("#isRateSB")[0].checked,
				cardContext: UE.getEditor("cardEditInfo").getContent()
			},
			ok: function (responseObject) {
				$('#knwlDocDialog').dialog('close');
				if (event.data.gridType === 'all') {
					$("#publishCardBtnForAll,#moveCardBtn").hide();
					all.dimensionCardGrid.awsGrid("refreshDataAndView");
				} else if (event.data.gridType === 'me') {
					$("#publishCardBtn,#deleteKnwlBtn").hide();
					me.meGrid.awsGrid("refreshDataAndView");
				}
			}
		});
	},
	deleteFile: function (fileId) {
		$.confirm({
			title: "请确认",
			content: "确定要删除该文件吗？",
			onConfirm: function () {
				awsui.ajax.request({
					url: "./jd",
					method: "POST",
					data: {
						sid: sid,
						cmd: "com.actionsoft.apps.kms_knwl_center_delete_file",
						cardId: me.cardUUID,
						fileId: fileId
					},
					ok: function (responseObject) {
						$('#' + fileId + 'TR').remove();
						// 重新计算序号
						$('#fileTable tr[id!=colTR]').each(function (i) {
							$(this).find('td:first').text(i + 1);
						});
					}
				});
			}
		});
	},
	closeKnwlDialog: function (event) {
		if (event.data.btn === 'add') { // 新建未保存时,删除已经上传的文件
			if ($('#fileTable tr[id!=colTR]').length != 0) { // 已经上传文件,发送请求删除无用的文件
				awsui.ajax.request({
					url: "./jd",
					method: "POST",
					alert: false,
					data: {
						sid: sid,
						cmd: "com.actionsoft.apps.kms_knwl_center_delete_unsaved_files",
						cardId: me.cardUUID
					},
					ok: function (responseObject) {
					}
				});
			}
		}
		try {
			$('#knwlDocDialog').dialog('close');
		} catch (e) {
		}
	},
	refreshGridConditional: function (cardId) {// 如果满足条件则刷新grid
		if (me.meGrid) {
			var meGridData = me.meGrid.awsGrid('getAllRows');
			$.each(meGridData, function (i, obj) {
				if (obj.cardId === cardId) {
					// 刷新grid
					$("#publishCardBtn,#deleteKnwlBtn").hide();
					me.meGrid.awsGrid("refreshDataAndView");
					return false;
				}
			});
		}
	}
};
var publishDG = {
	cancelPublishCard: function (rowIndx, gridType) {
		var rowData = {};
		if (gridType === 'all') {
			rowData = all.dimensionCardGrid.awsGrid("getRowData", rowIndx);
		} else if (gridType === 'publish') {
			rowData = publish.publishGrid.awsGrid("getRowData", rowIndx);
		}
		$.confirm({
			title: "请确认",
			content: "确认取消发布知识分类[" + rowData.dimensionName + "]下的知识[" + rowData.cardName + "]吗？",
			onConfirm: function () {
				awsui.ajax.request({
					url: "./jd",
					method: "POST",
					data: {
						sid: sid,
						cmd: "com.actionsoft.apps.kms_knwl_center_cancel_publish_card",
						publishId: rowData.publishId
					},
					success: function (responseObject) {
						var resultJO = responseObject.data.resultJO;
						if (resultJO.result === 'success') {
							if (gridType === 'all') {
								$("#publishCardBtnForAll,#moveCardBtn").hide();
								all.dimensionCardGrid.awsGrid("refreshDataAndView");
							} else if (gridType === 'publish') {
								publish.publishGrid.awsGrid("refreshDataAndView");
							}
							// 检查"我的知识"中是否有该知识,如果有的话刷新
							me.refreshGridConditional(rowData.cardId);
							$.simpleAlert("取消发布成功", "ok");
						} else if (resultJO.result === 'failure') {
							$.simpleAlert("取消发布失败", "warn");
						} else if (resultJO.result === 'process') {
							$('#cancelPublishProcessForm input[name=publishId]').val(rowData.publishId);
							$('#cancelPublishProcessDialog').dialog({
								title: '知识取消发布流程',
								width: 900,
								height: $(window).height() * 0.9,
								onClose: function () {
								}
							});
							$('#cancelPublishProcessDialog .dlg-close').off('click').on('click', function () {
								if ($('#cancelPublishProcessFrame').contents().find('#REASON').length != 0) { // 如果是可编辑状态(因为有的时候并非可编辑状态,比如提示"不能重新启动取消发布流程"的类似错误时)
									$.confirm({
										title: "请确认",
										content: "流程已经启动，确认关闭该对话框吗？（并不会作废流程）",
										onConfirm: function () {
											$('#cancelPublishProcessDialog').dialog('close');
										},
										onCancel: function () {
										}
									});
								} else { // 直接关闭
									$('#cancelPublishProcessDialog').dialog('close');
								}
							});
							document.getElementById('cancelPublishProcessForm').submit();
						}
					}
				});
			},
			onCancel: function () {
			}
		});
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
