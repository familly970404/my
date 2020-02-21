var isFullInited = false; // 知识检索-全文 是否已经初始化过
var isAttrInited = false; // 知识维护-属性 是否已经初始化过
var tabs;
var parentIdForList = '';
$(function () {
	topList.initGrid(sortIndx);
});
var topList = {
	searchGrid: undefined,
	initGrid: function (topType) {
		var gridConfig = {
			width: $(window).width() - 2,
			height: $(window).height(),
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
							cardNameHtml += "<span title=\"" + ui.rowData[ui.dataIndx] + "\"  style='cursor:pointer;color:#0000ee; position: relative;top: -7px;' onclick='parent.parent.parent.browseCard.browse(\"" + ui.rowData.cardId + "\",\"\",false,\"" + ui.rowData.dimensionId + "\");parent.parent.parent.stopPropagation(event);'>" + ui.rowData[ui.dataIndx] + "</span>";
						}
					} else {
						if (ui.rowData['hasPerm'] != true) {
							cardNameHtml += "<span style='cursor:pointer;position: relative;top: -7px;' >" + ui.rowData[ui.dataIndx] + "</span>";
						} else {
							cardNameHtml += "<span style='cursor:pointer;color:#0000ee;position: relative;top: -7px;' onclick='parent.parent.parent.browseCard.browse(\"" + ui.rowData.cardId + "\",\"\",false,\"" + ui.rowData.dimensionId + "\");parent.parent.parent.stopPropagation(event);'>" + ui.rowData[ui.dataIndx] + "</span>";
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
				title: "重要级别",
				width: 80,
				editable: false,
				dataIndx: "rdoSL"
			}, {
				title: "操作",
				width: 75,
				sortable: false,
				align: 'left',
				editable: false,
				dataIndx: "",
				render: function (ui) {
					var btnHtml = "";
					btnHtml += "<span class='opt_icon log' onclick='parent.parent.showLog(\"" + ui.rowData['cardId'] + "\",\"" + encodeURIComponent(ui.rowData['cardName']) + "\");' title='日志'></span>";
					if (ui.rowData['hasPerm'] != true) {
						btnHtml += "<span class='opt_icon borrow' onclick='parent.parent.fullsearch.borrowCard(\"" + ui.rowData['cardId'] + "\",\"" + ui.rowData['dimensionId'] + "\");' title='借阅'></span>";
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

function moreTop() {
	var iframeJQ = $("iframe[indx=\"search\"]", parent.parent.parent.document);
	iframeJQ.attr("src", "./w?cmd=com.actionsoft.apps.kms_knwl_search");
}