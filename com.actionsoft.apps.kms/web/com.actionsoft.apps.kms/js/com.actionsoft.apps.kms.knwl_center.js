var isMeInited = false; // 知识中心-个人 是否已经初始化过
var isAllInited = false; // 知识中心-全部 是否已经初始化过
var tabs;

$(function () {
	// 合并all对象和me对象
	$.extend(all, allDG);
	$.extend(me, meDG);
	$.extend(publish, publishDG);
	// 加载公共html到本页面
	awsui.ajax.request({
		url: "./jd",
		method: "POST",
		async: false,
		data: {
			sid: sid,
			cmd: "com.actionsoft.apps.kms_dimension_grid_html"
		},
		ok: function (responseObject) {
			$(document.body).append('<div id="dimensionGridLoadDiv" style="display: none;"></div>');
			$('#dimensionGridLoadDiv').append(responseObject.data.html);
			// 将各个模块儿定位到各自的位置
			$('#all-left,#all-separater').prependTo($('#tab-all'));
			$('#filterAllBtn,#filterAllInput').appendTo($('#dimensionCardToolbar'));
			$('#dimension-card-grid,#hotspotDiv').appendTo($('#all-right'));
			$('#knwlDocDialog').appendTo(document.body);
			$('#publishCardDialog').appendTo(document.body);
			$('#borrowProcessForm,#borrowProcessDialog').appendTo(document.body);
			$('#fullscreenWrap').appendTo(document.body);
			// 渲染check
			$("input[type=radio]").check()
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
			$('#dimensionGridLoadDiv').remove();
		},
		err: function(){
			$.simpleAlert("页面加载错误", "error");
		}
	});
	
	try{
		// todo临时注释掉ie8的quicktip，有bug32933
		if(!$.support.leadingWhitespace){// 判断IE8
			$(document).off('mouseover.over');
		}
	}catch(e){}
	
	// 拖动分隔栏
	all.dragSeparator();

	// 个人-左侧导航栏
	$("#me-left-me").click(function () {
		global.meLeftToogle(this);
		global.meRightToogle("me");
		setCookie('kms.knwlcenter.me.opendtab', 'me-left-me');
		me.initMeGrid();
	});
	$("#me-left-publish").click(function () {
		global.meLeftToogle(this);
		global.meRightToogle("publish");
		setCookie('kms.knwlcenter.me.opendtab', 'me-left-publish');
		publish.initPublishGrid();
	});
	$("#me-left-borrow").click(function () {
		global.meLeftToogle(this);
		global.meRightToogle("borrow");
		setCookie('kms.knwlcenter.me.opendtab', 'me-left-borrow');
		borrow.initBorrowGrid();
	});
	// 初始化tab
	tabs = awsui.tabs.init($("#tabs"), {
		height: 50,
		contentPanel: $("#tabs-content"),
		focusShowAfter: function (tab) {
			// 更改样式 显示/隐藏维度路径
			if (tab.index === 'nav-tab-all') {
				$('#tabs div[index=nav-tab-me]').addClass('nav-tab-me-left-border');
				$('#tabs div[index=nav-tab-all]').removeClass('nav-tab-all-right-border');

				$('#dimensionPath').show();
			} else if (tab.index === 'nav-tab-me') {
				$('#tabs div[index=nav-tab-all]').addClass('nav-tab-all-right-border');
				$('#tabs div[index=nav-tab-me]').removeClass('nav-tab-me-left-border');

				$('#dimensionPath').hide();
			}

			var meOpendtab;
			if (tab.beforeTabIndex !== tab.index) {
				// 记录cookie-最后打开的tab
				if (getCookie('kms.knwlcenter.opendtab') !== tab.index) {
					setCookie('kms.knwlcenter.opendtab', tab.index);
				}
				if (tab.beforeTabIndex === undefined) { // 页面初始化
					if (tab.index === 'nav-tab-me') {
						// 取最新10条评论
						me.showLatestComment();
						isMeInited = true;
						meOpendtab = getCookie('kms.knwlcenter.me.opendtab');
						if (meOpendtab) { // 取上次打开的tab
							$('#' + meOpendtab).trigger('click');
						} else { // 第一次打开me
							$('#me-left-me').click();
						}
					} else if (tab.index === 'nav-tab-all') {
						isAllInited = true;
						all.initTree();
					}
				} else {
					if (tab.index === 'nav-tab-me') {
						if (!isMeInited) {
							// 取最新10条评论
							me.showLatestComment();
							meOpendtab = getCookie('kms.knwlcenter.me.opendtab');
							if (meOpendtab) { // 取上次打开的tab
								$('#' + meOpendtab).trigger('click');
							} else { // 第一次打开me
								$('#me-left-me').click();
							}
						}
						global.resizeKMSWin();
					} else if (tab.index === 'nav-tab-all') {
						if (!isAllInited) {
							all.initTree();
						}
						all.resizeDimensionCardGrid();
					}
				}
				return true;
			}
		}
	});
	tabs.addTab({
		item: {
			title: "<span class='tab-icon tab-icon-all'></span><span style='font-size: 13px;float:left;'>&nbsp;全部</span>",
			index: "nav-tab-all"
		},
		close: false
	});
	tabs.addTab({
		item: {
			title: "<span class='tab-icon tab-icon-me' style='margin-top: 5px;'></span><span style='font-size: 13px;float:left;'>&nbsp;个人</span>",
			index: "nav-tab-me"
		},
		close: false
	});
	tabs.focusTab('0000-0000-0000'); // 制造一个undefined的tab的beforeTabIndex,打开页面的时候使用
	var opendtab = getCookie('kms.knwlcenter.opendtab');
	if (opendtab) { // 取上次打开的tab
		tabs.focusTab(opendtab);
	} else { // 第一次打开all
		tabs.focusTab('nav-tab-all');
	}
	$('#tabs .awsui-tabs-container').width(200);
	$(window).resize(function () {
		global.resizeKMSWin();
	});

	// 不影响resize和布局的绑定
	// $('#addKnwlBtnFront,#addKnwlBtnMiddle').click(function () {
	// me.addKnwlDocDialog();
	// });
	// $('#addKnwlBtnLast').click(function () {
	// $("#addKnwlTypeList").menu({ // 初始化新建知识菜单
	// target: $("#addKnwlBtn")
	// });
	// });

	// 绑定click事件
	// $("#addKnwlTypeList li").click(function () {
	// var knwlType = $(this).attr("avalue");
	// if (knwlType === 'doc') {
	// alert('doc');
	// } else if (knwlType === 'img') {
	// alert('img');
	// } else if (knwlType === 'video') {
	// alert('video');
	// }
	// // 关闭menu并刷新grid
	// $("#addKnwlTypeList").css("display", "none");
	// });
	$('#addKnwlBtn').off('click').on('click', function () {
		me.addKnwlDocDialog();
	});
	$("#validDate").datepicker({
		minDate : today
	});
	$('#deleteKnwlBtn').click(function () {
		me.deleteKnwl();
	});

	$('#filterAllBtn').off('click').on('click', function () {
		$("#publishCardBtnForAll,#moveCardBtn").hide();
		all.dimensionCardGrid.awsGrid("refreshDataAndView");
	});
	$('#filterMeBtn').off('click').on('click', function () {
		$("#publishCardBtn,#deleteKnwlBtn").hide();
		me.meGrid.awsGrid("refreshDataAndView");
	});
	$('#filterPublishBtn').off('click').on('click', function () {
		publish.publishGrid.awsGrid("refreshDataAndView");
	});
	$('#filterBorrowBtn').off('click').on('click', function () {
		borrow.borrowGrid.awsGrid("refreshDataAndView");
	});
	$('#filterAllInput').off('keypress').on('keypress', function (e) {
		if (e.which == 13) {
			$('#filterAllBtn').click();
		}
	});
	$('#filterMeInput').off('keypress').on('keypress', function (e) {
		if (e.which == 13) {
			$('#filterMeBtn').click();
		}
	});
	
	$('#filterPublishInput').off('keypress').on('keypress', function (e) {
		if (e.which == 13) {
			$('#filterPublishBtn').click();
		}
	});
	$('#filterBorrowInput').off('keypress').on('keypress', function (e) {
		if (e.which == 13) {
			$('#filterBorrowBtn').click();
		}
	});
	if (parent.$('iframe[indx=search]').length === 0) { // 判断是否有全文检索页面的权限
		$('#fullsearch_anchor').remove();
	} else {
		$('#fullsearch_anchor').off('click').on('click', function () {
			// 打开全文检索
			parent.$('.top-item[indx="search"]').mouseenter();
			parent.$('.top-item[indx="search"]').click();
		});
	}
});

var global = {
	resizeKMSWin: function () {
		if ($('#me-right-me').is(':visible')) {
			me.resizeMeGrid();
		} else if ($('#me-right-publish').is(':visible')) {
			publish.resizePublishGrid();
		} else if ($('#me-right-borrow').is(':visible')) {
			borrow.resizeBorrowGrid();
		} else if ($('#all-right').is(':visible')) {
			all.resizeDimensionCardGrid();
		}
	},
	// 个人-左侧导航菜单样式改变-触发resize
	meLeftToogle: function (obj) {
		$("#me-left-ul").find(".active").removeClass("active");
		$(obj).addClass("active");
	},
	// 个人-右侧内容页面显示隐藏控制
	meRightToogle: function (key) {
		$("#me-right > div").hide();
		$("#me-right-" + key).show();
	}
};

var all = {
		treeUp : function() {
			var selectedNode = window.all.treeObj.getSelectedNode();
			var parentNode = window.all.treeObj.getParentNodeById(selectedNode.id);
			var parentNodeDom = window.all.treeObj.getNodeDomById(parentNode.id);
			parentNodeDom.click();
		}
};

function showEditor() {
	$("#cardEditTd").show();
	$("#cardEditNoContent").hide();
}
var me = {
	meGrid: undefined,
	isCommentSB: undefined,
    isRateSB: undefined,
	totalRecords : 0,
	// 个人-知识grid初始化
	initMeGrid: function () {
		if (!me.meGrid) {
			// 计算每页展示多少条比较合适(5的倍数,不出现滚动条，且能尽量充满页面)
// var gridHeight = $('#tabs-content').height() -
// $('#me-toolbar').outerHeight(true) - 2;
// var gridContentHeight = gridHeight - 25 - 27; // 25为grid的top 27位grid的bottom
// var gridCounts = Math.floor(Math.floor(gridContentHeight / 34) / 5) * 5;

			var meGridConfig = {
				width: $('#tab-me').outerWidth(true) - $('#me-left').outerWidth(true) -1,
				height: $('#tabs-content').height() - $('#me-toolbar').outerHeight(true) - 2,
				flexWidth: false,
				flexHeight: false,
				wrap: false,
				nowrapTitle: false,
				topVisible: false,
				editable: true,
				columnBorders: false,
				oddRowsHighlight : false,
				scrollModel: {
					autoFit: false,
					horizontal: true,
					vertical :true
				},
				colModel: [
					{
						title: "",
						checkbox: true,
						resizable: false,
						editable: false,
						align: "center",
						width: 30
						},
					{
						title: "名称",
						width: 300,
						sortable: true,
						editable: false,
						dataType: "string",
						dataIndx: "cardName",
						resizable: true,
						showText: false,
						render: function (ui) {
							if (getCharCodeLength(ui.rowData[ui.dataIndx]) > 46) { // 显示qtip
								return "<span title=\"" + ui.rowData[ui.dataIndx] + "\"  style='cursor:pointer;color:#0000EE' onclick='parent.browseCard.browse(\"" + ui.rowData.cardId + "\",\"\",true,\"\","+ui.rowIndxPage+",\"me\");parent.stopPropagation(event);'>" + ui.rowData[ui.dataIndx] + "</span>";
							} else {
								return "<span style='cursor:pointer;color:#0000EE' onclick='parent.browseCard.browse(\"" + ui.rowData.cardId + "\",\"\",true,\"\","+ui.rowIndxPage+",\"me\");parent.stopPropagation(event);'>" + ui.rowData[ui.dataIndx] + "</span>";
							}
						}
						},
					{
						title: "创建时间",
						width: 120,
						sortable: true,
						editable: false,
						align: 'center',
						dataType: "string",
						dataIndx: "createTime",
						resizable: true,
						showText: false
						}, {
						title: "阅读次数",
						sortable: true,
						width: 70,
						align: 'center',
						editable: false,
						dataIndx: "readCount"
					}, {
						title: "知识内容",
						hidden: true,
						dataIndx: "cardContext"
					}, {
						title: "重要级别",
						width: 80,
						editable: false,
						dataIndx: "rdoSL"
					}, {
						title: "发布状态",
						sortable: true,
						editable: false,
						showText: false,
						width: 70,
						align: 'center',
						dataIndx: "isPublished",
						render: function (ui) {
							var isPublished = ui.rowData[ui.dataIndx];
							if (isPublished == 0) {
								return "未发布";
							} else if (isPublished == 1) {
								return "已发布";
							} else {
								return "数据错误[发布状态]";
							}
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
						title: "操作",
                        width: 130,
						align: 'left',
						editable: false,
						dataIndx: "",
						render: function (ui) {
							var btnHtml = '';
							btnHtml += "<span class='opt_icon edit' onclick='me.editCardDialog(\"" + ui.rowIndxPage + "\",\"me\");parent.stopPropagation(event);' title='编辑'></span>";
                            btnHtml += "<span class='opt_icon publish' onclick='me.publishCardDialog(\"me\",\"" + ui.rowIndxPage + "\");parent.stopPropagation(event);' title='发布'></span>";
							btnHtml += "<span class='opt_icon ac' onclick='me.cardAC(\"" + ui.rowIndxPage + "\");parent.stopPropagation(event);' title='授权'></span>";
							btnHtml += "<span class='opt_icon log' onclick='showLog(\"" + ui.rowData['cardId'] + "\",\"" + encodeURIComponent(ui.rowData['cardName']) + "\");parent.stopPropagation(event);' title='日志'></span>";
							return btnHtml;
						}
						}],
				dataModel: {
					location: "remote",
					sorting: "remote",
					paging: "remote",
					method: "POST",
					sortIndx: 'createTime',
					sortDir: 'down',
					curPage: 1, // 当前页
					rPP: parent.gridRowPP, // 每页个数
					getUrl: function () {
						return {
							url: "./jd",
							data: {
								sid: sid,
								cmd: "com.actionsoft.apps.kms_knwl_center_me_card_list_json",
								curPage: me.meGrid == undefined ? 1 : (me.meGrid.awsGrid("option").dataModel.curPage <= 0 ? 1 :
									me.meGrid.awsGrid("option").dataModel.curPage),
								rowsPerPage: meGridConfig.dataModel.rPP,
								sortIndx: this.sortIndx,
								sortDir: this.sortDir,
								filter: encodeURIComponent($('#filterMeInput').val())
							}
						};
					},
					getData: function (responseObject) {
						me.totalRecords = responseObject.data.totalRecords;
						if($('#filterMeInput').val() == ''){// 如果不是过滤查询,则更新气泡
							$('#meCount').text(responseObject.data.totalRecords);
						}
						return {
							curPage: responseObject.data.curPage,
							totalRecords: responseObject.data.totalRecords,
							data: responseObject.data.data
						};
					}
				}
			};
			me.meGrid = $("#me-grid").awsGrid(meGridConfig);
			me.meGrid.find(".pq-pager").awsGridPager("option", $.awsgrid.awsGridPager.regional["zh"]);

			me.meGrid.awsGrid({
				refresh: function (event, ui) {
					// 未发布的行用浅黄色背景
					if(!$("#me-grid .aws-grid-header-table td[rowspan=1][colspan=1] input[type=checkbox]").prop('checked')){
						var dataArr = ui.data;
						for (var i = 0; i < dataArr.length; i++) {
							if (dataArr[i].isPublished === 0) {
								$("#me-grid table tr[pq-row-indx=" + i + "]").addClass('unpublished').attr('unpublished','true');
							}
						}
					}
					// hover时移除unpublished样式
					$("#me-grid tr.aws-grid-row").off('mouseenter').on('mouseenter',function(){
						$(this).removeClass('unpublished');
					});
					// out时添加unpublished样式
					$("#me-grid tr.aws-grid-row").off('mouseleave').on('mouseleave',function(){
						if($(this).attr('rowSelected') === 'true'){
							
						}else{
							if($(this).attr('unpublished')){
								$(this).addClass('unpublished');
							}
						}
					});
				}
			});
			
			me.meGrid.awsGrid({
				rowSelect: function (event, ui) {
					if(ui.$tr.attr('unpublished')){
						ui.$tr.removeClass('unpublished').attr('rowSelected','true');
					}
				}
			});
			me.meGrid.awsGrid({
				rowUnSelect: function (event, ui) {
					if(ui.$tr.attr('unpublished')){
						if(ui.$tr.attr('unpublished')){
							ui.$tr.addClass('unpublished').attr('rowSelected','false');;
						}
					}
				}
			});
			me.meGrid.awsGrid({
				load: function (event, ui) {
					if(me.totalRecords === 0){
						$("#me-grid .pq-cont").html('<div class="kms-no-km"></br><div class="title">&nbsp;没有知识</div></div>');
					}else{
						$("#me-grid .pq-cont .kms-no-km").remove();
					}
				}
			});

			me.meGrid.on("awsgridrowselect", function (evt, ui) {
				$("#publishCardBtn,#deleteKnwlBtn").show();
			});
			me.meGrid.on("awsgridrowunselect", function (evt, ui) {
				var length = me.meGrid.awsGrid("getSelectedRow").length;
				if (length > 1) {
					$("#publishCardBtn,#deleteKnwlBtn").show();
				} else {
					$("#publishCardBtn,#deleteKnwlBtn").hide();
				}

			});
		} else {
			me.resizeMeGrid();
		}
	},
	deleteKnwl: function () {
		var selectedRows = me.meGrid.awsGrid("getRows");
		if (selectedRows.length < 1) {
			$.simpleAlert("请选中需要删除的知识", "info");
			return false;
		}
		var cardIds;
		for (var i = 0; i < selectedRows.length; i++) {
			var obj = selectedRows[i];
			if (cardIds == undefined) {
				cardIds = obj.cardId;
			} else {
				cardIds += "," + obj.cardId;
			}
		}
		$.confirm({
			title: "请确认",
			content: "是否删除选中的知识？",
			onConfirm: function () {
				awsui.ajax.request({
					url: "./jd",
					method: "POST",
					data: {
						sid: sid,
						cmd: "com.actionsoft.apps.kms_knwl_center_delete_card",
						cardIds: cardIds
					},
					success: function (responseObject) {
						$("#publishCardBtn,#deleteKnwlBtn").hide();
						me.meGrid.awsGrid('refreshDataAndView');
					}
				});
			}
		});

	},
	addKnwlDocDialog: function () {
		me.cardUUID = 'obj_' + (new UUID()).createUUID().toLowerCase(); // 知识UUID,在此生成因上传文件需此ID作为fileValue
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
						{id: "0", text: "转换图片格式在线阅读，禁止下载（首次转换时间较长）"}
					]
				}
			]
		};
		if ($("#rdoOL").attr("data-select2-id") != "rdoOL") {
			$("#rdoOL").select2(rdoOLOption);
		}
		$('#knwlDocDialog').dialog({
			title: '新建知识',
			width: 1000,
			height: 538,
			onClose: function () {
				// 清空表单和文件列表
				$('#cardName').val('');
				$('#validDate').val('');
				//$("#rdoOL1").check("option", "checked", true);
				//$("#rdoSL0").check("option", "checked", true);
				$("#rdoSL").val("").trigger("change");
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
				$('#fileTable tr[id!=colTR]').remove();
				me.isCommentSB.changeStatus(true);
                me.isRateSB.changeStatus(true);
			}
		});
		if (!me.isCommentSB) {
			me.isCommentSB = $("#isCommentSB").switchButton({
				swheight: 25,
				swwidth: 100,
				ontext: "允许评论",
				offtext: "禁止评论"
			});
			me.isCommentSB.changeStatus(true);
        }
        if (!me.isRateSB) {
			me.isRateSB = $("#isRateSB").switchButton({
				swheight: 25,
				swwidth: 100,
				ontext: "允许打分",
				offtext: "禁止打分"
			});
            me.isRateSB.changeStatus(true);
		}
		$('#knwlDocOkBtn').off('click').on('click', me.addKnwl);
		$('#knwlDocNoBtn').off('click').on('click', {
			btn: "add"
		}, me.closeKnwlDialog);
		$('#knwlDocDialog .dlg-close').off('click.knwlDoc').on('click.knwlDoc', {
			btn: "add"
		}, me.closeKnwlDialog);
		// 上传文档
		$("#uploadDoc").upfile({
			sid: sid,
			appId: "com.actionsoft.apps.kms",
			groupValue: uid,
			fileValue: me.cardUUID,
			numLimit: 0,
			// sizeLimit : maxFileSize * 1024 * 1024,//实现了add 此参数失效
			filesToFilter: [["*", "*"]],
			repositoryName: "-doc-",
			done: function (e, data) {
				// 增加一行
				if (data['result']['data']['result'] == 'ok') {
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
					var browserPreview = parent.browserPreview;
					if (typeof parent.browserPreview == 'string') {
						browserPreview = $.grep(parent.browserPreview.split(','), function (n, i) {// 浏览器直接预览，不调用onlinedoc
							return n != '';
						});
					}
					var fileType = fileName.lastIndexOf(".") > -1 ? fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length) : "";
                    if ($.inArray(fileType, browserPreview) != -1) {// 浏览器直接预览，不使用onlinedoc
						tr += "<td><div class='file_icon file-type-" + fileSuffixIcon + "'></div><div class='browse_file_name' title='" + fileName + "'><a href='javascript:' onclick='browserPreviewFun(\"" + fileId + "\",\"" + encodeURIComponent(fileName) + "\",1,\""+fileCreateUserPhoto+"\",\""+fileCreateUser+"\");'>" + fileName
						+ "</a></div></td>";
					}else{
                        if (parent.isOnlinedocAppActive) {
							tr += "<td><div class='file_icon file-type-" + fileSuffixIcon + "'></div><div class='browse_file_name' title='" + fileName + "'><a href='javascript:' onclick='showFullScreenPanel(\"" + parent.canPreviewType + "\",\"" + fileId + "\",\"" + encodeURIComponent(fileName) + "\",\"" + encodeURIComponent(fileName) + "\",\"0\",\"1\",\""+fileCreateUserPhoto+"\",\""+fileCreateUser+"\")'>" + fileName
									+ "</a></div></td>";
						} else {
							tr += "<td><div class='file_icon file-type-" + fileSuffixIcon + "'></div><div class='browse_file_name' title='" + fileName + "'>" + fileName + "</div></td>";
						}
					}
					var deleteBtn = '<a href="javascript:" onclick="me.deleteFile(\'' + fileId + '\');return false;"><span class="icon_delete_file"></span></a>';
					tr += "<td><a class='file_download' href='" + fileDownloadURL + "'></a></td><td>"+fileVer+"</td><td class='browse_createuser'>" + createUsername + "</td><td>" + AWSFile.formatSize(fileSize) + "</td><td style='text-align: center;'>" + createTime + "</td><td style='text-align: center;'>" + deleteBtn + "</td></tr>";
					
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
			complete: function (e, data) {}
		});
	},
	addKnwl: function () {
		var cardName = $.trim($('#cardName').val());
		if (cardName == '') {
			$.simpleAlert('[知识名称]不允许为空', 'info');
			return false;
		} else {
			cardName = $('#cardName').val();
		}
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
			//loading: true,
			data: {
				sid: sid,
				cmd: "com.actionsoft.apps.kms_knwl_center_insert_card",
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
				$("#publishCardBtn,#deleteKnwlBtn").hide();
				me.meGrid.awsGrid("refreshDataAndView");
			}
		});
	},
	resizeMeGrid: function () {
		me.meGrid.width($('#tab-me').outerWidth(true) - $('#me-left').outerWidth(true) -1);
		me.meGrid.height($('#tabs-content').height() - $('#me-toolbar').outerHeight(true) - 2);
		me.meGrid.awsGrid("refresh");
		if(me.totalRecords === 0){
			$("#me-grid .pq-cont").html('<div class="kms-no-km"></br><div class="title">&nbsp;没有知识</div></div>');
		}else{
			$("#me-grid .pq-cont .kms-no-km").remove();
		}
	},
	dimensionTree: undefined,
    publishCardDialog: function (gridType, rowIndxPage) {
		var selectedRows = [];
		if (gridType === 'all') {
            if (rowIndxPage === undefined) {
                selectedRows = all.dimensionCardGrid.awsGrid("getRows");
            } else {
                selectedRows[0] = all.dimensionCardGrid.awsGrid("getRowData", rowIndxPage);
            }
		} else if (gridType === 'me') {
            if (rowIndxPage === undefined) {
                selectedRows = me.meGrid.awsGrid("getRows");
            } else {
                selectedRows[0] = me.meGrid.awsGrid("getRowData", rowIndxPage);
            }
		}
		if (selectedRows.length == 0) {
			$.simpleAlert("请选中需要发布的知识", "info");
			return false;
		}
		// 过期的不允许发布
		var validDateFlag;
		var publishCardIds = $.each(selectedRows, function (i,obj) {
			if(obj.validDate && obj.validDate!= '' && obj.validDate < today){
				validDateFlag = '知识['+obj.cardName+']已过期，不允许发布';
				return false;
			}
		});
		if(validDateFlag){
			$.simpleAlert(validDateFlag, "info");
			return false;
		}
		
		// 无文件的知识不允许发布
		var publishCardIds = $.map(selectedRows, function (obj) {
			return obj.cardId;
		});
		var hasFileFlag = true;
		awsui.ajax.request({
			url: "./jd",
			method: "POST",
			async: false,
			//loading: true,
			alert : false,
			data: {
				sid: sid,
				cmd: "com.actionsoft.apps.kms_knwl_center_check_card_has_file",
				cardIds: JSON.stringify(publishCardIds)
			},
			success: function (responseObject) {
				if(responseObject.result !== 'ok'){
					$.simpleAlert(responseObject.msg, responseObject.result);
					hasFileFlag = false;
				}
			}
		});
		if(!hasFileFlag){
			return false;
		}
		
		var dialogTitle = '发布知识';
		for (var i = 0; i < selectedRows.length; i++) {
			dialogTitle += '[' + selectedRows[i].cardName + ']';
		}
		
		$('#publishCardDialog').dialog({
			title: dialogTitle,
			width: 874,
			buttons: [{
				text: '确定',
				cls: "blue",
				handler: function () {
                    me.publishCard(gridType, rowIndxPage);
				}
			}, {
				text: '取消',
				handler: function () {
					$('#publishCardDialog').dialog('close');
				}
			}],
			onClose: function () {
				// 清空表单

			}
		});
		// 初始化维度树
		if (!me.dimensionTree) {
			var treeDataUrl = "./w?sid=" + sid + "&cmd=com.actionsoft.apps.kms_knwl_center_me_publish_dimension_tree_json";
			var setting = {
				showLine: false,
				checkbox: true,
				checkInherit: false,
				sort: true,
				event: {
					beforeExpand: me.getChildren,
					onClick: me.treeClick,
					onCheck: me.checkNode,
					afterExpand: me.checkNode
				},
				animate: true,
				dataModel: {
					url: treeDataUrl,
					method: "POST",
					dataType: "json",
					params: {
						parentId: ''
					}
				}
			};
			me.dimensionTree = awsui.tree.init($("#meDimensionTree"), setting);
			var rootNodes = me.dimensionTree.getRootNode();
			if(rootNodes.length === 0){
				$('#meDimensionTree').html('<div class="kms-no-record">无知识分类</div>');
			}
		} else {
			var checkedNodes = me.dimensionTree.getCheckedNodes();
			for (var i = 0; i < checkedNodes.length; i++) {
				me.dimensionTree.toggleCheck(checkedNodes[i]);
			}

			// 取消禁用状态
			var allNodes = me.getAllNodes(me.dimensionTree);
			for (var i = 0; i < allNodes.length; i++) {
				$('#ckb_' + allNodes[i].id).removeAttr('disabled');
			}
		}
		// 初始化元数据
		if ($('#publishCardSchemaDiv').html() == '') {
			awsui.ajax
				.request({
					url: "./jd",
					method: "POST",
					data: {
						sid: sid,
						cmd: "com.actionsoft.apps.kms_knwl_center_schema_attr_list_json"
					},
					success: function (responseObject) {
						// 渲染html
						var result = responseObject.data;
						var schemaHtml = '';
						if($.isEmptyObject(result)){
							schemaHtml = '<div class="kms-no-record">无描述</div>';
						}else{
							for (var schemaId in result) {
								var schemaObj = result[schemaId];
								schemaHtml += '<li class="schemaLI" id="' + schemaId + '">';
								schemaHtml += '<ul class="schema-title"><span>' + schemaObj.schemaTitle + '</span><span isnullable="' + schemaObj.isNullable +
									'"></span>';
								if (schemaObj.isNullable == 0) { // 必填
									schemaHtml += '<span class="schema-required">*</span>';
								}
								schemaHtml += '</ul>';
	
								schemaHtml += '<ul class="schema-attr-list" showType="' + schemaObj.showType + '">';
								if (schemaObj.showType == 0) { // 复选框
									var attrList = schemaObj.attrList;
									for (var i = 0; i < attrList.length; i++) {
										var attrObj = attrList[i];
										schemaHtml += '<li><input class="awsui-checkbox" type="checkbox" id="' + attrObj.id +
											'"><label class="awsui-checkbox-label" for="' + attrObj.id + '">' + attrObj.attrTitle + '</label></li>';
									}
								} else if (schemaObj.showType == 1) { // 单选框
									var attrList = schemaObj.attrList;
									for (var i = 0; i < attrList.length; i++) {
										var attrObj = attrList[i];
										schemaHtml += '<li><input class="awsui-radio" name="radiox' + schemaId + '" id="' + attrObj.id +
											'" type="radio"><label class="awsui-radio-label" for="' + attrObj.id + '">' + attrObj.attrTitle +
											'</label></li>';
									}
									schemaHtml += '<li><img src="../apps/com.actionsoft.apps.kms/raty/img/cancel-off.png" onclick="me.radioRemoveClick(this,event)" onmouseover="me.radioRemoveOver(this,event)" onmouseout="me.radioRemoveOut(this,event)" alt="x" class="raty-cancel" title="清除"></li>';
								} else if (schemaObj.showType == 2) { // 文本框
									schemaHtml += '<li><input name="showType2" type="text" class="txt" /></li>';
								}
								schemaHtml += '</ul>';
								schemaHtml += '</li>';
							}
						}
						$('#publishCardSchemaDiv').append(schemaHtml);
						$("#publishCardSchemaDiv input[type=checkbox]").check();
						$("#publishCardSchemaDiv input[type=radio]").check();
					}
				});
		} else {
			$("#publishCardSchemaDiv input[type=text]").val('');
			$("#publishCardSchemaDiv input[type=checkbox]").check("option", "checked", false);
			$("#publishCardSchemaDiv input[type=radio]").check("option", "checked", false)
		}
		// 初始化标签input
		if ($("#userinput").attr('inited') === "false") {
			var availableTags = [];
			$("#userinput").userinputkms({
				superbox: $("#usersuper"),
				target: $("#usersuper"),
				seperator: '@`@',
				initData: [],
				listHeight: 120,
				multiple: true, // 多选
				source: availableTags,
				add: function (e, d) {},
				del: function (e, d) {}
			});
			$("#userinput").attr('inited', "true");
		} else {
			$("#userinput").val('');
			$("#usersuper div span").remove();
		}
		// 初始化描述
		$('#memo').val('');
	},
    publishCard: function (gridType, rowIndxPage) {
        // 维度校验、元数据必填校验
        var checkedNodes = me.dimensionTree.getCheckedNodes();
        if (checkedNodes.length == 0) {
            $.simpleAlert("请选择要发布到的知识分类", "info");
            return false;
        }
        // 校验长度
        var schemaFlag = true;
        $.each($('#publishCardSchemaDiv input[type=text]'), function (i, n) {
            if (this.value.length > 128) {
                var schemaTitle = $(this).parent().parent('.schema-attr-list').prev('.schema-title').children(':first-child').text();
                $.simpleAlert('元数据[' + schemaTitle + ']长度不能超过128个字符', 'info');
                schemaFlag = false;
                return false;
            }
        });
        if (!schemaFlag) {
            return false;
        }
        // 取值-描述
        var publishMemo = $('#memo').val();
        if (publishMemo.length > 1000) {
            $.simpleAlert('[描述]长度不能超过1000个字符', 'info');
            return false;
        }
        var isnullableSpans = $('#publishCardSchemaDiv span[isnullable=0]');
        for (var i = 0; i < isnullableSpans.length; i++) {
            var isnullableSpan = isnullableSpans[i];
            var schemaTitle = $(isnullableSpan).prev('span').text();
            var metaAttrUI = $(isnullableSpan).parent().next('ul.schema-attr-list');
            if (metaAttrUI.attr('showtype') == 0) { // 复选框
                var isChecked = false;
                var checkboxes = metaAttrUI.find('input[type=checkbox]');
                for (var j = 0; j < checkboxes.length; j++) {
                    var checkbox = checkboxes[j];
                    if ($(checkbox).prop('checked') == true) {
                        isChecked = true;
                        break;
                    }
                }
                if (!isChecked) {
                    $.simpleAlert("请选择元数据[" + schemaTitle + "]", "info");
                    return false;
                }
            } else if (metaAttrUI.attr('showtype') == 1) { // 单选按钮
                var isChecked = false;
                var radios = metaAttrUI.find('input[type=radio]');
                for (var j = 0; j < radios.length; j++) {
                    var checkbox = radios[j];
                    if ($(checkbox).prop('checked') == true) {
                        isChecked = true;
                        break;
                    }
                }
                if (!isChecked) {
                    $.simpleAlert("请选择元数据[" + schemaTitle + "]", "info");
                    return false;
                }
            } else if (metaAttrUI.attr('showtype') == 2) { // 文本框
                var metaAttrText = $.trim(metaAttrUI.find('input[type=text]').val());
                if (metaAttrText == '') {
                    $.simpleAlert("元数据[" + schemaTitle + "]不允许为空", "info");
                    return false;
                }
            }
        }
        // 取值-知识Id
        var selectedRows = [];
        if (gridType === 'all') {
            if (rowIndxPage === undefined) {
                selectedRows = all.dimensionCardGrid.awsGrid("getRows");
            } else {
                selectedRows[0] = all.dimensionCardGrid.awsGrid("getRowData", rowIndxPage);
            }
        } else if (gridType === 'me') {
            if (rowIndxPage === undefined) {
                selectedRows = me.meGrid.awsGrid("getRows");
            } else {
                selectedRows[0] = me.meGrid.awsGrid("getRowData", rowIndxPage);
            }
        }
        var publishCardIds = $.map(selectedRows, function (obj) {
            return obj.cardId;
        });
        // 取值-维度id
        var publishDimensionIds = [];
        for (var i = 0; i < checkedNodes.length; i++) {
            publishDimensionIds[publishDimensionIds.length] = checkedNodes[i].id;
        }
        // 取值-元数据
        var schemaMetaData = {
            '01': [], // 复选框和单选按钮
            '2': []
            // 文本框
        };
        $.each($('#publishCardSchemaDiv input[type=checkbox]:checked,#publishCardSchemaDiv input[type=radio]:checked'), function (i, n) {
            var schemaMetaData01 = schemaMetaData['01'];
            schemaMetaData01[schemaMetaData01.length] = {
                attrId: this.id,
                schemaId: $(this).parents('li.schemaLI').attr('id')
            };
        });
        $.each($('#publishCardSchemaDiv input[type=text]'), function (i, n) {
            var schemaMetaData2 = schemaMetaData['2'];
            schemaMetaData2[schemaMetaData2.length] = {
                metaValue: $.trim(this.value),
                schemaId: $(this).parents('li.schemaLI').attr('id')
            };
        });
        // 取值-标签
        var tags = $('#usersuper span[class=awsui-supertext-item]').map(function () {
            return $(this).text();
        }).toArray().join('@`@');
        if (tags && tags != '') {
            tags = '@`@' + tags + '@`@'; // 前后包裹分隔符，便于SQL查询
        }
        // 判断直接发布OR启动流程
        if (checkedNodes[0].publishPerm === 'publish') {
            $.confirm({
                title: "请确认",
				content: "是否发布选中的知识到相关知识分类？发布知识前，请先进行授权（如果不授权，默认所有用户可见）",
                onConfirm: function () {
                    awsui.ajax.request({
                        url: "./jd",
                        method: "POST",
						// loading: true,
                        data: {
                            sid: sid,
                            cmd: "com.actionsoft.apps.kms_knwl_center_publish_card",
                            publishCardIds: JSON.stringify(publishCardIds),
                            publishDimensionIds: JSON.stringify(publishDimensionIds),
                            schemaMetaData: encodeURIComponent(JSON.stringify(schemaMetaData)),
                            tags: encodeURIComponent(tags),
                            publishMemo: encodeURIComponent(publishMemo)
                        },
                        ok: function (responseObject) {
                            $('#publishCardDialog').dialog('close');
                            if (gridType === 'all') {
                                $("#publishCardBtnForAll,#moveCardBtn").hide();
                                if (all.dimensionCardGrid) {
                                    all.dimensionCardGrid.awsGrid('refreshDataAndView');
                                }
                            } else if (gridType === 'me') {
                                $("#publishCardBtn,#deleteKnwlBtn").hide();
                                if (me.meGrid) {
                                    me.meGrid.awsGrid('refreshDataAndView');
                                }
                            }
                            // 刷新-publishGrid
                            if (publish.publishGrid) {
                                publish.publishGrid.awsGrid('refreshDataAndView');
                            }
                        },
                        err: function () {
                            return false;// 防止关闭dialog
                        }
                    });
                }
            });
        } else {
            $.confirm({
                title: "请确认",
				content: "发布到当前知识分类下需要审批，确认启动知识发布流程吗？发布知识前，请先进行授权（如果不授权，默认所有用户可见）",
                onConfirm: function () {
                    $('#publishProcessForm input[name=cardIds]').val(JSON.stringify(publishCardIds));
                    $('#publishProcessForm input[name=dimensionId]').val(publishDimensionIds[0]); // 需审批的时候只允许发布到一个维度
                    $('#publishProcessForm input[name=schemaMetaData]').val(encodeURIComponent(JSON.stringify(schemaMetaData)));
                    $('#publishProcessForm input[name=tags]').val(encodeURIComponent(tags));
                    $('#publishProcessForm input[name=publishMemo]').val(encodeURIComponent(publishMemo));
                    // 关闭发布窗口
                    $('#publishCardDialog').dialog("close");
                    $('#publishProcessDialog').dialog({
                        title: '知识发布流程',
                        width: 900,
                        height: $(window).height() * 0.9,
                        onClose: function () {
                        }
                    });
                    $('#publishProcessDialog .dlg-close').off('click').on('click', function () {
                        if ($('#publishProcessFrame').contents().find('#REASON').length != 0) { // 如果是可编辑状态(因为有的时候并非可编辑状态,比如提示"不能重新启动取消发布流程"的类似错误时)
                            $.confirm({
                                title: "请确认",
                                content: "流程已经启动，确认关闭该对话框吗？（并不会作废流程）",
                                onConfirm: function () {
                                    $('#publishProcessDialog').dialog('close');
                                },
                                onCancel: function () {
                                }
                            });
                        } else { // 直接关闭
                            $('#publishProcessDialog').dialog('close');
                        }
                    });
                    document.getElementById('publishProcessForm').submit();
                },
                onCancel: function () {
                }
            });
        }
    },
	moveDimensionTree: undefined,
	moveKnwlDialog: function () { // 此方法本应该属于all,但是依赖的方法已经在me中书写,所以此方法放入me
		var selectedRows = all.dimensionCardGrid.awsGrid("getRows");
		if (selectedRows.length == 0) {
			$.simpleAlert("请选中需要移动/复制的知识", "info");
			return false;
		}
		var dialogTitle = '移动/复制知识';
		for (var i = 0; i < selectedRows.length; i++) {
			dialogTitle += '[' + selectedRows[i].cardName + ']';
		}

		$('#moveCardDialog').dialog({
			title: dialogTitle,
			width: 800,
			buttons: [{
				text: '移动',
				cls: "blue",
				handler: function () {
					me.moveCard();
				}
				}, {
				text: '复制',
				cls: "blue",
				handler: function () {
					me.copyCard();
				}
					}, {
				text: '取消',
				handler: function () {
					$('#moveCardDialog').dialog('close');
				}
				}],
			onClose: function () {
				// 清空表单
				
			}
		});
		// 初始化维度树
		if (!me.moveDimensionTree) {
			var treeDataUrl = "./w?sid=" + sid + "&cmd=com.actionsoft.apps.kms_knwl_center_all_move_dimension_tree_json";
			var setting = {
				showLine: false,
				checkbox: true,
				checkInherit: false,
				sort: true,
				event: {
					beforeExpand: me.getChildrenForMove,
					onClick: me.treeMoveClick,
					onCheck: me.checkNodeForMove,
					afterExpand: me.checkNodeForMove
				},
				animate: true,
				dataModel: {
					url: treeDataUrl,
					method: "POST",
					dataType: "json",
					params: {
						parentId: ''
					}
				}
			};
			me.moveDimensionTree = awsui.tree.init($("#moveKnwlDimensionTree"), setting);
		} else {
			var checkedNodes = me.moveDimensionTree.getCheckedNodes();
			for (var i = 0; i < checkedNodes.length; i++) {
				me.moveDimensionTree.toggleCheck(checkedNodes[i]);
			}

			// 取消禁用状态
			var allNodes = me.getAllNodes(me.moveDimensionTree);
			for (var i = 0; i < allNodes.length; i++) {
				$('#ckb_' + allNodes[i].id).removeAttr('disabled');
			}
		}
	},
	moveCard : function(){
		// 维度校验
		var checkedNodes = me.moveDimensionTree.getCheckedNodes();
		if (checkedNodes.length == 0) {
			$.simpleAlert("请选择要移动到的知识分类", "info");
			return false;
		}
		
		// 取值-维度id
		var publishDimensionIds = [];
		for (var i = 0; i < checkedNodes.length; i++) {
			publishDimensionIds[publishDimensionIds.length] = checkedNodes[i].id;
		}
		// 取值-知识Id
		var selectedRows = all.dimensionCardGrid.awsGrid("getRows");
		var publishCardIds = $.map(selectedRows, function (obj) {
			return obj.cardId;
		});
		$.confirm({
				title: "请确认",
				content: "是否移动选中的知识到相关知识分类？",
				onConfirm: function () {
					awsui.ajax.request({
						url: "./jd",
						method: "POST",
						//loading: true,
						data: {
							sid: sid,
							cmd: "com.actionsoft.apps.kms_knwl_center_move_card",
							cardIds: JSON.stringify(publishCardIds),
							dimensionIds: JSON.stringify(publishDimensionIds),
							currDimensionId : all.treeObj.getSelectedNode().id
						},
						success: function (responseObject) {
							$('#moveCardDialog').dialog('close');
							$("#publishCardBtnForAll,#moveCardBtn").hide();
							all.dimensionCardGrid.awsGrid('refreshDataAndView');
						}
					});
				}
			});
	},
	copyCard : function(){
		// 维度校验
		var checkedNodes = me.moveDimensionTree.getCheckedNodes();
		if (checkedNodes.length == 0) {
			$.simpleAlert("请选择要复制到的知识分类", "info");
			return false;
		}
		
		// 取值-维度id
		var publishDimensionIds = [];
		for (var i = 0; i < checkedNodes.length; i++) {
			publishDimensionIds[publishDimensionIds.length] = checkedNodes[i].id;
		}
		// 取值-知识Id
		var selectedRows = all.dimensionCardGrid.awsGrid("getRows");
		var publishCardIds = $.map(selectedRows, function (obj) {
			return obj.cardId;
		});
		$.confirm({
				title: "请确认",
				content: "是否复制选中的知识到相关知识分类？",
				onConfirm: function () {
					awsui.ajax.request({
						url: "./jd",
						method: "POST",
						//loading: true,
						data: {
							sid: sid,
							cmd: "com.actionsoft.apps.kms_knwl_center_copy_card",
							cardIds: JSON.stringify(publishCardIds),
							dimensionIds: JSON.stringify(publishDimensionIds),
							currDimensionId : all.treeObj.getSelectedNode().id
						},
						success: function (responseObject) {
							$('#moveCardDialog').dialog('close');
							$("#publishCardBtnForAll,#moveCardBtn").hide();
							all.dimensionCardGrid.awsGrid('refreshDataAndView');
						}
					});
				}
			});
	},
	checkNode: function (dom) {
		var checkedNodes = me.dimensionTree.getCheckedNodes();
		var allNodes = me.getAllNodes(me.dimensionTree);
		if (checkedNodes.length > 0) {
			var checkNode = checkedNodes[0]; // 第一个选中的节点决定着其他节点的checkbox状态
			var grepedNodes = $.grep(allNodes, function (node, i) {
				return inCheckedNodes(checkedNodes, node.id);
			}, true);
			if (checkNode.publishPerm === 'publish') { // 直接发布
				// 隐藏需要启动流程的节点
				for (var i = 0; i < grepedNodes.length; i++) {
					if (grepedNodes[i].publishPerm === 'processPublish') {
						$('#ckb_' + grepedNodes[i].id).prop('disabled', true);
					}
				}
			} else if (checkNode.publishPerm === 'processPublish') { // 启动流程
				// 隐藏其他全部节点
				for (var i = 0; i < grepedNodes.length; i++) {
					$('#ckb_' + grepedNodes[i].id).prop('disabled', true);
				}
			}
		} else {
			for (var i = 0; i < allNodes.length; i++) {
				$('#ckb_' + allNodes[i].id).removeAttr('disabled');
			}
		}

		function inCheckedNodes(checkedNodes, id) {
			for (var i = 0; i < checkedNodes.length; i++) {
				if (id === checkedNodes[i].id) {
					return true;
				}
			}
			return false;
		}
	},
	checkNodeForMove: function (dom) {
		var checkedNodes = me.moveDimensionTree.getCheckedNodes();
		var allNodes = me.getAllNodes(me.moveDimensionTree);
		if (checkedNodes.length > 0) {
			var checkNode = checkedNodes[0]; // 第一个选中的节点决定着其他节点的checkbox状态
			var grepedNodes = $.grep(allNodes, function (node, i) {
				return inCheckedNodes(checkedNodes, node.id);
			}, true);
			if (checkNode.publishPerm === 'publish') { // 直接发布
				// 隐藏需要启动流程的节点
				for (var i = 0; i < grepedNodes.length; i++) {
					if (grepedNodes[i].publishPerm === 'processPublish') {
						$('#ckb_' + grepedNodes[i].id).prop('disabled', true);
					}
				}
			} else if (checkNode.publishPerm === 'processPublish') { // 启动流程
				// 隐藏其他全部节点
				for (var i = 0; i < grepedNodes.length; i++) {
					$('#ckb_' + grepedNodes[i].id).prop('disabled', true);
				}
			}
		} else {
			for (var i = 0; i < allNodes.length; i++) {
				$('#ckb_' + allNodes[i].id).removeAttr('disabled');
			}
		}

		function inCheckedNodes(checkedNodes, id) {
			for (var i = 0; i < checkedNodes.length; i++) {
				if (id === checkedNodes[i].id) {
					return true;
				}
			}
			return false;
		}
	},
	getAllNodes: function (treeObj) {
		var rootNodes = treeObj.getRootNode();
		var allNodes = [];
		if (rootNodes && rootNodes.length > 0) {
			$.merge(allNodes, rootNodes);
			for (var i = 0; i < rootNodes.length; i++) {
				mergeNodes(rootNodes[i].id);
			}
		}

		function mergeNodes(parentNodeId) {
			var childrenNodes = treeObj.getChildrenByPid(parentNodeId);
			if (childrenNodes && childrenNodes.length > 0) {
				$.merge(allNodes, childrenNodes);
				for (var i = 0; i < childrenNodes.length; i++) {
					mergeNodes(childrenNodes[i].id);
				}
			}
		}
		return allNodes;
	},
	radioRemoveClick: function (obj,event) {
		$(obj).parent('li').parent('ul').find('input[type=radio]:checked').check("option", "checked", false)
		var eve = $.Event(event);
		eve.stopPropagation();
		return false;
	},
	radioRemoveOver: function (obj,event) {
		$(obj).attr('src', "../apps/com.actionsoft.apps.kms/raty/img/cancel-on.png");
		var eve = $.Event(event);
		eve.stopPropagation();
		return false;
	},
	radioRemoveOut: function (obj,event) {
		$(obj).attr('src', "../apps/com.actionsoft.apps.kms/raty/img/cancel-off.png");
		var eve = $.Event(event);
		eve.stopPropagation();
		return false;
	},
	// 展开节点
	getChildren: function (treeNode) {
		var nodeDom = me.dimensionTree.getNodeDomById(treeNode.id);
		if (nodeDom.find("span:eq(1)[class=root-open]").length == 1) { // 闭合时无需请求网络
			return false;
		}
		if (nodeDom.siblings("ul").length == 1) { // 已经请求的网络的节点无需再次请求网络
			return false;
		}
		if (treeNode.open != null) {
			me.dimensionTree.setting.dataModel.params.parentId = treeNode.id;
			var result = me.dimensionTree.getData(me.dimensionTree.setting.dataModel);
			me.dimensionTree.buildChilren(result, treeNode);
		}
	},
	// 展开节点(移动复制)
	getChildrenForMove: function (treeNode) {
		var nodeDom = me.moveDimensionTree.getNodeDomById(treeNode.id);
		if (nodeDom.find("span:eq(1)[class=root-open]").length == 1) { // 闭合时无需请求网络
			return false;
		}
		if (nodeDom.siblings("ul").length == 1) { // 已经请求的网络的节点无需再次请求网络
			return false;
		}
		if (treeNode.open != null) {
			me.moveDimensionTree.setting.dataModel.params.parentId = treeNode.id;
			var result = me.moveDimensionTree.getData(me.moveDimensionTree.setting.dataModel);
			me.moveDimensionTree.buildChilren(result, treeNode);
		}
	},
	// 发布维度树单击事件
	treeClick: function (treeNode) {
		// 如果有checkbox 自动选中/取消选中
		var nodeDom = me.dimensionTree.getNodeDomById(treeNode.id);
		nodeDom.find('input[type=checkbox]').click();
	},
	// 移动复制维度树单击事件
	treeMoveClick: function (treeNode) {
		// 如果有checkbox 自动选中/取消选中
		var nodeDom = me.moveDimensionTree.getNodeDomById(treeNode.id);
		nodeDom.find('input[type=checkbox]').click();
	},
	// 展示最新10条评论
	showLatestComment: function () {
		awsui.ajax.request({
			url: "./jd",
			method: "POST",
			//loading: true,
			data: {
				sid: sid,
				cmd: "com.actionsoft.apps.kms_knwl_center_latest_comment"
			},
			success: function (responseObject) {
				var commentCountShow = Math.floor($('#latestComment').height() / 83); // 计算可以展示的条数(每条高度93)
				var optJA = responseObject.data.optJA;
				var commentHtml = '';
				if(optJA.length === 0){
					commentHtml += '<div class="no-latest-comment">无最新评论</div>';
				}else{
					for (var i = 0; i < optJA.length && i < commentCountShow; i++) {
						commentHtml += '<div class="left-comment-wrap" >';
						commentHtml += '	<div class="img-wrap">';
						commentHtml += '		<img alt="' + optJA[i].optUser + '" src="' + optJA[i].optUserPhoto + '" >';
						commentHtml += '	</div>';
						commentHtml += '	<div class="right-wrap">';
						commentHtml += '		<div class="author">';
						commentHtml += '			<span style="float: left;">' + optJA[i].optUser + '</span><span style="float: right;">' + optJA[i].optTime + '</span>';
							commentHtml += '		</div>';
							if (getCharCodeLength(optJA[i].cardName) > 24) { // 显示qtip
								commentHtml += '		<div class="word" title="' + optJA[i].cardName + '" onclick="parent.browseCard.browse(\'' + optJA[i].cardId + '\')" style="cursor:pointer;color:#0000EE">' + optJA[i].cardName + '</div>';
							} else {
								commentHtml += '		<div class="word" onclick="parent.browseCard.browse(\'' + optJA[i].cardId + '\')" style="cursor:pointer;color:#0000EE">' + optJA[i].cardName + '</div>';
							}
							if (getCharCodeLength(optJA[i].optContent) > 24) { // 显示qtip
								commentHtml += '		<div class="word" title="' + optJA[i].optContent + '">' + optJA[i].optContent + '</div>';
							} else {
								commentHtml += '		<div class="word">' + optJA[i].optContent + '</div>';
							}
							commentHtml += '	</div>';
							commentHtml += '</div>';
						}
				}
				$('#latestComment').html(commentHtml);
			}
		});
	},
	// 知识权限
	cardAC : function(rowIndx) {
		var rowData = me.meGrid.awsGrid("getRowData", rowIndx);
		var url = './w?sid=' + sid + '&cmd=CLIENT_COMMON_AC_ACTION_OPEN&resourceId=' + rowData.cardId + '&resourceType=kms.card';
		FrmDialog.open({
			title : "知识访问授权",
			width : 750,
			height : 400,
			url : url,
			id : "cardAC",
			buttons : [ {
				text : '添加',
				cls : "blue",
				handler : function() {
					FrmDialog.win().saveAC();
				}
			}, {
				text : '关闭',
				handler : function() {
					FrmDialog.close();
				}
			} ]
		});
	}
};
var publish = {
	publishGrid: undefined,
	totalRecords : 0,
	// 个人-我发布的知识grid初始化
	initPublishGrid: function () {
		if (!publish.publishGrid) {
			// 计算每页展示多少条比较合适(5的倍数,不出现滚动条，且能尽量充满页面)
// var gridHeight = $('#tabs-content').height() -
// $('#publish-toolbar').outerHeight(true) - 2;
// var gridContentHeight = gridHeight - 25 - 27; // 25为grid的top 27位grid的bottom
// var gridCounts = Math.floor(Math.floor(gridContentHeight / 34) / 5) * 5;
			var publishGridConfig = {
				width: $('#tab-me').outerWidth(true) - $('#me-left').outerWidth(true) -1,
				height: $('#tabs-content').height() - $('#publish-toolbar').outerHeight(true) - 2,
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
					vertical :true
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
							if (getCharCodeLength(ui.rowData[ui.dataIndx]) > 46) { // 显示qtip
								return "<span title=\"" + ui.rowData[ui.dataIndx] + "\"  style='cursor:pointer;color:#0000EE' onclick='parent.browseCard.browse(\"" + ui.rowData.cardId + "\",\"\",true,\"\","+ui.rowIndxPage+",\"publish\");parent.stopPropagation(event);'>" + ui.rowData[ui.dataIndx] + "</span>";
							} else {
								return "<span style='cursor:pointer;color:#0000EE' onclick='parent.browseCard.browse(\"" + ui.rowData.cardId + "\",\"\",true,\"\","+ui.rowIndxPage+",\"publish\");parent.stopPropagation(event);'>" + ui.rowData[ui.dataIndx] + "</span>";
							}
						}
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
						width: 70,
						editable: false,
						align: 'center',
						dataIndx: "readCount"
				}, {
					title: "重要级别",
					width: 80,
					editable: false,
					dataIndx: "rdoSL"
				}, {
					title: "知识分类名称",
					sortable: true,
					editable: false,
					showText: false,
					width: 200,
					align: 'left',
					dataIndx: "dimensionName",
					render: function (ui) {
						return '<span title="' + ui.rowData[ui.dataIndx] + '">' + ui.rowData[ui.dataIndx] + '</span>';
					}
				},
				{
						title: "审批状态",
						sortable: false,
						editable: false,
						showText: false,
						width: 80,
						align: 'left',
						dataIndx: "publishStatus"
				},
				{
						title: "操作",
						sortable: false,
						editable: false,
						showText: false,
						width: 120,
						align: 'left',
						dataIndx: "",
						render: function (ui) {
							var btnHtml = '';
							btnHtml += "<span class='opt_icon edit' onclick='me.editCardDialog(\"" + ui.rowIndxPage + "\",\"publish\");parent.stopPropagation(event);' title='编辑'></span>";
							if (ui.rowData.publishStatus === '无需审批' || ui.rowData.publishStatus === '同意') {
								btnHtml += "<span class='opt_icon cancelpublish' onclick='publish.cancelPublishCard(" + ui.rowIndxPage + ",\"publish\");parent.stopPropagation(event);' title='取消发布'></span>";
							}
							btnHtml += "<span class='opt_icon log' onclick='showLog(\"" + ui.rowData['cardId'] + "\",\"" + encodeURIComponent(ui.rowData['cardName']) + "\");parent.stopPropagation(event);' title='日志'></span>";

							if (ui.rowData.publishStatus && ui.rowData.publishStatus !== '无需审批') {
								btnHtml += "<span class='opt_icon track' onclick='publish.showTrack(\"" + ui.rowData.processInstId + "\");parent.stopPropagation(event);' title='跟踪'></span>";
							}
							return btnHtml;
						}
				}
				],
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
								cmd: "com.actionsoft.apps.kms_knwl_center_publish_card_list_json",
								curPage: publish.publishGrid == undefined ? 1 : (publish.publishGrid.awsGrid("option").dataModel.curPage <= 0 ? 1 :
									publish.publishGrid.awsGrid("option").dataModel.curPage),
								rowsPerPage: publishGridConfig.dataModel.rPP,
								sortIndx: this.sortIndx,
								sortDir: this.sortDir,
								filter: encodeURIComponent($('#filterPublishInput').val())
							}
						};
					},
					getData: function (responseObject) {
						publish.totalRecords = responseObject.data.totalRecords;
						if($('#filterPublishInput').val() == ''){// 如果不是过滤查询,则更新气泡
							$('#publishCount').text(responseObject.data.totalRecords);
						}
						return {
							curPage: responseObject.data.curPage,
							totalRecords: responseObject.data.totalRecords,
							data: responseObject.data.data
						};
					}
				}
			};

			publish.publishGrid = $("#publish-grid").awsGrid(publishGridConfig);
			publish.publishGrid.find(".pq-pager").awsGridPager("option", $.awsgrid.awsGridPager.regional["zh"]);
			
			publish.publishGrid.awsGrid({
				load: function (event, ui) {
					if(publish.totalRecords === 0){
						$("#publish-grid .pq-cont").html('<div class="kms-no-km"></br><div class="title">&nbsp;没有知识</div></div>');
					}else{
						$("#publish-grid .pq-cont .kms-no-km").remove();
					}
				}
			});
		} else {
			publish.resizePublishGrid();
		}
	},
	resizePublishGrid: function () {
		publish.publishGrid.width($('#tab-me').outerWidth(true) - $('#me-left').outerWidth(true) -1);
		publish.publishGrid.height($('#tabs-content').height() - $('#publish-toolbar').outerHeight(true) - 2);
		publish.publishGrid.awsGrid("refresh");
		if(publish.totalRecords === 0){
			$("#publish-grid .pq-cont").html('<div class="kms-no-km"></br><div class="title">&nbsp;没有知识</div></div>');
		}else{
			$("#publish-grid .pq-cont .kms-no-km").remove();
		}
	},
	
	showTrack: function (processInstId) {
		var isSupportCanvas = !!document.createElement('canvas').getContext;
		var url = "./w?sid=" + sid + "&cmd=CLIENT_BPM_FORM_TRACK_OPEN" + "&processInstId=" + processInstId + "&supportCanvas=" + isSupportCanvas;
		// 改为_blank打开
		window.open(url,'_blank');
// var dlg = FrmDialog.open({
// // width:$(window).width(),
// // height:$(window).height(),
// width: 900,
// height: 600,
// url: url,
// data: {},
// id: "publishTrackDialog"
// });
	}
};
var borrow = {
	borrowGrid: undefined,
	totalRecords : 0,
	// 个人-我借阅的知识grid初始化
	initBorrowGrid: function () {
		if (!borrow.borrowGrid) {
			// 计算每页展示多少条比较合适(5的倍数,不出现滚动条，且能尽量充满页面)
// var gridHeight = $('#tabs-content').height() -
// $('#borrow-toolbar').outerHeight(true) - 2;
// var gridContentHeight = gridHeight - 25 - 27; // 25为grid的top 27位grid的bottom
// var gridCounts = Math.floor(Math.floor(gridContentHeight / 34) / 5) * 5;
			var borrowGridConfig = {
				width: $('#tab-me').outerWidth(true) - $('#me-left').outerWidth(true) -1,
				height: $('#tabs-content').height() - $('#borrow-toolbar').outerHeight(true) - 2,
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
					vertical :true
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
					dataIndx: "CARDNAME",
					resizable: true,
					showText: false,
					render: function (ui) {
						if (ui.rowData.STATUS === '同意') {
							if (ui.rowData.CONTROLTYPE === '限制阅读次数') {
								if (ui.rowData.READTIMES >= ui.rowData.TIMES) {
									if (getCharCodeLength(ui.rowData[ui.dataIndx]) > 46) { // 显示qtip
										return "<span title=\"" + ui.rowData[ui.dataIndx] + "\" >" + ui.rowData[ui.dataIndx] + "</span>";
									} else {
										return "<span>" + ui.rowData[ui.dataIndx] + "</span>";
									}
								} else {
									if (getCharCodeLength(ui.rowData[ui.dataIndx]) > 46) { // 显示qtip
										return "<span title=\"" + ui.rowData[ui.dataIndx] + "\"  style='cursor:pointer;color:#0000EE' onclick='parent.browseCard.browse(\"" + ui.rowData.CARDID + "\",\"" + ui.rowData["boId"] + "\",false,\""+ui.rowData["DIMENSIONID"]+"\");parent.stopPropagation(event);'>" + ui.rowData[ui.dataIndx] + "</button>";
									} else {
										return "<span style='cursor:pointer;color:#0000EE' onclick='parent.browseCard.browse(\"" + ui.rowData.CARDID + "\",\"" + ui.rowData["boId"] + "\",false,\""+ui.rowData["DIMENSIONID"]+"\");parent.stopPropagation(event);'>" + ui.rowData[ui.dataIndx] + "</button>";
									}
								}
							} else if (ui.rowData.CONTROLTYPE === '限制有效日期') {
								if (ui.rowData.isEndDate === true) {
									if (getCharCodeLength(ui.rowData[ui.dataIndx]) > 46) { // 显示qtip
										return "<span title=\"" + ui.rowData[ui.dataIndx] + "\" >" + ui.rowData[ui.dataIndx] + "</span>";
									} else {
										return "<span>" + ui.rowData[ui.dataIndx] + "</span>";
									}
								} else {
									if (getCharCodeLength(ui.rowData[ui.dataIndx]) > 46) { // 显示qtip
										return "<span title=\"" + ui.rowData[ui.dataIndx] + "\"  style='cursor:pointer;color:#0000EE' onclick='parent.browseCard.browse(\"" + ui.rowData.CARDID + "\",\"" + ui.rowData["boId"] + "\",false,\""+ui.rowData["DIMENSIONID"]+"\");parent.stopPropagation(event);'>" + ui.rowData[ui.dataIndx] + "</button>";
									} else {
										return "<span style='cursor:pointer;color:#0000EE' onclick='parent.browseCard.browse(\"" + ui.rowData.CARDID + "\",\"" + ui.rowData["boId"] + "\",false,\""+ui.rowData["DIMENSIONID"]+"\");parent.stopPropagation(event);'>" + ui.rowData[ui.dataIndx] + "</button>";
									}
								}

							}
						} else {
							if (getCharCodeLength(ui.rowData[ui.dataIndx]) > 46) { // 显示qtip
								return "<span title=\"" + ui.rowData[ui.dataIndx] + "\">" + ui.rowData[ui.dataIndx] + "</span>";
							} else {
								return "<span>" + ui.rowData[ui.dataIndx] + "</span>";
							}
						}
					}
				}, {
					title: "申请时间",
					sortable: true,
					width: 120,
					align: 'center',
					editable: false,
					dataIndx: "CREATEDATE"
				}, {
					title: "状态",
					sortable: true,
					editable: false,
					showText: false,
					width: 100,
					align: 'center',
					dataIndx: "STATUS"
				}, {
					title: "限阅类型",
					sortable: false,
					editable: false,
					showText: false,
					width: 160,
					align: 'left',
					dataIndx: "CONTROLTYPE",
					render: function (ui) {
						if (ui.rowData.STATUS === '同意') {
							if (ui.rowData.CONTROLTYPE === '限制阅读次数') {
								return "阅读次数:" + ui.rowData.READTIMES + " / " + ui.rowData.TIMES;
							} else if (ui.rowData.CONTROLTYPE === '限制有效日期') {
								return "有效期至:" + ui.rowData.ENDDATE;
							}
						}
					}
				}],
				dataModel: {
					location: "remote",
					sorting: "remote",
					sortIndx: 'CREATEDATE',
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
								cmd: "com.actionsoft.apps.kms_knwl_center_borrow_card_list_json",
								curPage: borrow.borrowGrid == undefined ? 1 : (borrow.borrowGrid.awsGrid("option").dataModel.curPage <= 0 ? 1 :
									borrow.borrowGrid.awsGrid("option").dataModel.curPage),
								rowsPerPage: borrowGridConfig.dataModel.rPP,
								sortIndx: this.sortIndx,
								sortDir: this.sortDir,
								filter: encodeURIComponent($('#filterBorrowInput').val())
							}
						};
					},
					getData: function (responseObject) {
						borrow.totalRecords = responseObject.data.totalRecords;
						if($('#filterBorrowInput').val() == ''){// 如果不是过滤查询,则更新气泡
							$('#borrowCount').text(responseObject.data.totalRecords);
						}
						return {
							curPage: responseObject.data.curPage,
							totalRecords: responseObject.data.totalRecords,
							data: responseObject.data.data
						};
					}
				}
			};
			borrow.borrowGrid = $("#borrow-grid").awsGrid(borrowGridConfig);
			borrow.borrowGrid.find(".pq-pager").awsGridPager("option", $.awsgrid.awsGridPager.regional["zh"]);
			borrow.borrowGrid.awsGrid({
				load: function (event, ui) {
					if(borrow.totalRecords === 0){
						$("#borrow-grid .pq-cont").html('<div class="kms-no-km"></br><div class="title">&nbsp;没有知识</div></div>');
					}else{
						$("#borrow-grid .pq-cont .kms-no-km").remove();
					}
				}
			});
		} else {
			borrow.resizeBorrowGrid();
		}
	},
	resizeBorrowGrid: function () {
		borrow.borrowGrid.width($('#tab-me').outerWidth(true) - $('#me-left').outerWidth(true) -1);
		borrow.borrowGrid.height($('#tabs-content').height() - $('#borrow-toolbar').outerHeight(true) -2);
		borrow.borrowGrid.awsGrid("refresh");
		if(borrow.totalRecords === 0){
			$("#borrow-grid .pq-cont").html('<div class="kms-no-km"></br><div class="title">&nbsp;没有知识</div></div>');
		}else{
			$("#borrow-grid .pq-cont .kms-no-km").remove();
		}
	}
};

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
function showFullScreenPanel( canPreviewType, fileId, fileName, fileNameVersion, canPreviewFlag, canDownloadFlag,createUserPhoto,createUser) {
	if (canPreviewFlag != undefined && canPreviewFlag == '0') { // 文件允许预览

	} else {// 文件不允许预览
		$.simpleAlert('该类型文件不支持预览', "info");
		return false;
	}
	fileName = decodeURIComponent(fileName);
	fileNameVersion = decodeURIComponent(fileNameVersion);
	var fileType = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length);
	if (canPreviewType.indexOf(fileType) != -1) {

	} else {
		$.simpleAlert('该类型文件不支持预览', "info");
        return;
	}
	$('#fullscreenWrap').show();

	$("body").css("overflow", "hidden");
	// 将文件标题显示
	$(".toolbar-title").empty();
	$(".toolbar-title").append(fileName);
	$(".toolbar-photo img").attr('src',createUserPhoto);
	$(".toolbar-photo img").attr('userId',createUser);
    previewMyFile(fileId, canDownloadFlag);

	if (canDownloadFlag != undefined && canDownloadFlag == '0') {
		$('#fsdownloadbtn').hide();
	} else if (canDownloadFlag != undefined && canDownloadFlag == '1') {
		$('#fsdownloadbtn').show();
	} else {
	}

	$('#fsdownloadbtn').attr('aFileId', fileId);
	$('#fsclosebtn').click(function() {
		closeFsPanel();
	});

}

function previewMyFile(fileId, canDownloadFlag) {
	$('#previewpanel').empty();
//	$.simpleAlert("文件正在加载，请稍侯...", "loading");
	var params = {
		fileId : fileId
	};
    var url = './jd?sid=' + sid + '&cmd=com.actionsoft.apps.kms_knwl_center_preview_file&isDownload=' + (canDownloadFlag == 1);
	awsui.ajax.post(url, params, function(responseObject) {
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
			$("#fstoolbar").show();
			$('#fsdownloadbtn').hide();
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
function browserPreviewFun(fileId,fileName,canDownloadFlag,createUserPhoto,createUser){
	fileName = decodeURIComponent(fileName);
	$('#fullscreenWrap').show();
	$("body").css("overflow", "hidden");

	// 将文件标题显示
	$(".toolbar-title").empty();
	$(".toolbar-title").append(fileName);
	$(".toolbar-photo img").attr('src',createUserPhoto);
	$(".toolbar-photo img").attr('userId',createUser);

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
				if(responseObject.data.isImg === true){
					$('#previewfrm').attr("src", './w?sid='+sid+'&cmd=com.actionsoft.apps.kms_knwl_browser_preview_image&fileId='+fileId);
				}else{
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
	} else {}

	$('#fsdownloadbtn').attr('aFileId', fileId);
	$('#fsclosebtn').click(function () {
		closeFsPanel();
	});
}

/**
 * 下载文件
 * 
 * @param obj
 * @returns
 */
function downloadFile(obj) {
	var fileId;
	if (typeof obj === 'string') { // fileId
		fileId = obj;
	} else { // html element
		fileId = $(obj).attr('aFileId')
	}

	awsui.ajax.request({
		url: "./jd",
		method: "POST",
		alert: false,
		//loading: true,
		data: {
			sid: sid,
			cmd: "com.actionsoft.apps.kms_knwl_center_download_file",
			fileId: fileId
		},
		success: function (responseObject) {
			if (responseObject.result == 'ok') {
				if ($('#signleFilesHref').length === 0) {
// $(document.body).append("<iframe id='signleFilesIframe'
// name='signleFilesIframe' style='display:none;'>tmpIframe</iframe>");
					$(document.body).append("<a id='signleFilesHref' style='display:none;' target='_blank'>tmpLink</a>");
// if (document.getElementById('signleFilesHref').download == undefined) { //
// 如果只是download属性则支持预览,target为_blank.否则target为iframe
// document.getElementById('signleFilesHref').target = 'signleFilesIframe';
// }
				}
				$('#signleFilesHref').attr('href', responseObject.data.downloadURL);
				$('#signleFilesHref')[0].click();
			} else {
				$.simpleAlert(responseObject.msg, responseObject.result);
			}
		}
	});
}
