$(function(){
	fullsearch.search();
});
var fullsearch = {
    rowsPerPage: 50,
    curPage: 0,
    searchText: '',
    search: function () {
        fullsearch.searchText = $.trim(searchWords);
        // 检索关键词
        if (fullsearch.searchText == '') {
            $.simpleAlert('请输入检索关键词', 'info');
            return false;
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
		$('#pagination img,#pagination span').hide();
        // 全文检索开始
        awsui.ajax.request({
            url: "./jd",
            method: "POST",
			//loading: true,
            data: {
                sid: sid,
                cmd: "com.actionsoft.apps.kms_knwl_fullsearch_list_json",
                curPage: fullsearch.curPage,
                rowsPerPage: fullsearch.rowsPerPage,
                searchText: encodeURIComponent(fullsearch.searchText)
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
						$('#fullsearchListOl').append('<div class="kms-no-file"></br><div class="title">&nbsp;没有搜索到内容</div><div class="content">查询“' + fullsearch.searchText + '”没有结果，请尝试其他关键字</div></div></div>');
                    }
                } else {
                    var browserPreview = $.grep(browserPreviewStr.split(','), function (n, i) {// 浏览器直接预览，不调用onlinedoc
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
                            if (isOnlinedocAppActive) {
								if (data.onlineLevel != "0" && data.onlineLevel != "2") {
									li += "<span class='result-title' style='cursor:pointer;' onclick='showFullScreenPanel(\"" + canPreviewType + "\",\"" + data.fileId + "\",\"" + encodeURIComponent(data.fileName.replace("style='color:red'", "")) + "\",\"" + encodeURIComponent(data.fileName.replace("style='color:red'", "")) + "\",\"0\",\"1\",\"" + data.createUserPhoto + "\",\"" + data.createUser + "\","+data.onlineLevel+")'>" + data.fileName + "</span>";
								} else {
									li += "<span class='result-title' style='cursor:pointer;' onclick='showFullScreenPanel(\"" + canPreviewType + "\",\"" + data.fileId + "\",\"" + encodeURIComponent(data.fileName.replace("style='color:red'", "")) + "\",\"" + encodeURIComponent(data.fileName.replace("style='color:red'", "")) + "\",\"0\",\"0\",\"" + data.createUserPhoto + "\",\"" + data.createUser + "\","+data.onlineLevel+")'>" + data.fileName + "</span>";
								}
                            } else {
                                li += '<span class="result-title">' + data.fileName + '</span>';
                            }
                        }
						if (data.onlineLevel != "0" && data.onlineLevel != "2") {
							li += '<br> <span class="result-snippet">' + data.content + '</span><br> <span class="result-dimension">位置：' + data.dimensionPath + '&nbsp;&nbsp;</span><span class="result-dimension">知识名称：' + data.cardName + '</span><span class="result-timeauthor">' + data.fileCreateTime + '&nbsp;&nbsp;' + data.fileCreateUser + '</span><span onclick="downloadFile(this)" aFileId="' + data.fileId + '" class="result-download">下载</span></div></li>';
						} else {
							li += '<br> <span class="result-snippet">' + data.content + '</span><br> <span class="result-dimension">位置：' + data.dimensionPath + '&nbsp;&nbsp;</span><span class="result-dimension">知识名称：' + data.cardName + '</span><span class="result-timeauthor">' + data.fileCreateTime + '&nbsp;&nbsp;' + data.fileCreateUser + '</span></div></li>';
						}
                        $('#fullsearchListOl').append(li);
                    }
                }
            }
        });
    }
};
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
		// loading: true,
        data: {
            sid: sid,
            cmd: "com.actionsoft.apps.kms_knwl_center_download_file",
            fileId: fileId
        },
        success: function (responseObject) {
            if (responseObject.result == 'ok') {
                if ($('#signleFilesHref').length === 0) {
                    // $(document.body).append("<iframe id='signleFilesIframe'
                    // name='signleFilesIframe'
                    // style='display:none;'>tmpIframe</iframe>");
                    $(document.body).append("<a id='signleFilesHref' style='display:none;' target='_blank'>tmpLink</a>");
                    // if (document.getElementById('signleFilesHref').download
                    // == undefined) { //
                    // 如果只是download属性则支持预览,target为_blank.否则target为iframe
                    // document.getElementById('signleFilesHref').target =
                    // 'signleFilesIframe';
                    // }
                }
                $('#signleFilesHref').attr('href', responseObject.data.downloadURL);
                $('#signleFilesHref')[0].click();
                return false;
            } else {
                $.simpleAlert(responseObject.msg, responseObject.result);
            }
        }
    });
}
/**
 * onlinedoc预览
 */
function showFullScreenPanel(canPreviewType, fileId, fileName, fileNameVersion, canPreviewFlag, canDownloadFlag, createUserPhoto, createUser,onlineLevel) {
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
    $(".toolbar-title").append(fileName);
    $(".toolbar-photo img").attr('src', createUserPhoto);
    $(".toolbar-photo img").attr('userId', createUser);
	var isCopy = 1;
	if (onlineLevel == 0) {
		isCopy = 0;
	} else if (onlineLevel == 1 || onlineLevel == 2) {
		isCopy = 1;
	}
    previewMyFile(fileId, canDownloadFlag,isCopy);
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
function previewMyFile(fileId, canDownloadFlag,isCopy) {
    $('#previewpanel').empty();
//    $.simpleAlert("文件正在加载，请稍侯...", "loading");
    var params = {
        fileId: fileId,
		isCopy:isCopy == 1
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
		$("body").css("overflow", "auto");
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
function browserPreviewFun(fileId, fileName, canDownloadFlag, createUserPhoto, createUser,onlineLevel) {
    fileName = decodeURIComponent(fileName);
    $('#fullscreenWrap').show();
    $("body").css("overflow", "hidden");
    // 将文件标题显示
    $(".toolbar-title").empty();
    $(".toolbar-title").append(fileName);
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

