$(function() {
	try {
		// todo临时注释掉ie8的quicktip，有bug32933
		if (!$.support.leadingWhitespace) {// 判断IE8
			$(document).off('mouseover.over');
		}
	} catch (e) {
	}

	var fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled;
	if (fullscreenEnabled) {// 如果允许全屏
		$('#fullscreenImg').show();
		$('#fullscreenImg').off('click').on('click', function() {
			toggleFullscreen();
		});
	}

	$(window).resize(function() {
		resizeKnwlListDiv();
	});
	$('.closeKnwl').off('click').on('click', function() {
		$('#knwlListDiv').hide();
		resizeKnwlListDiv();
	});
	$('#knwlListDiv').off('scroll').on('scroll', function() {
		$('.closeKnwl').css('top', $(this).scrollTop() + 14);
	});

	$('#contentWrap').off('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange').on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange',function(){
		var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
		if (fullscreenElement) {
			$('#fullscreenImg').attr({
				'alt' : '取消全屏',
				'title' : '取消全屏',
				'src' : '../apps/com.actionsoft.apps.kms/img/fullscreen_exit_24px.png'
			});
		} else {
			$('#fullscreenImg').attr({
				'alt' : '全屏',
				'title' : '全屏',
				'src' : '../apps/com.actionsoft.apps.kms/img/fullscreen_24px.png'
			});
		}
	});
});
// 切换全屏/非全屏
function toggleFullscreen() {
	var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
	if (fullscreenElement) {// 全屏状态,点击取消全屏
		exitFullscreen();
	} else {
		launchFullscreen(document.getElementById('contentWrap'));
	}
}
// 全屏
function launchFullscreen(element) {
	if (element.requestFullscreen) {
		element.requestFullscreen();
	} else if (element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if (element.msRequestFullscreen) {
		element.msRequestFullscreen();
	} else if (element.webkitRequestFullscreen) {
		element.webkitRequestFullScreen();
	}
}
// 取消全屏
function exitFullscreen() {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	}
}
/**
 * 根据知识地图的图形Id查询知识(改为下方展示列表)
 * 
 * @param obj
 * @returns
 */
function showCardByDimensionPath(obj) {
	var linkURL = $(obj).attr('linkURL');
	if (linkURL) {// 打开链接
		var target = $(obj).attr('target');
		var aTag = '<a id="hotspotLinkURL" href="' + decodeURIComponent(linkURL) + '" target="' + target + '" style="display:none"></a>';
		$(document.body).append(aTag);
		$('#hotspotLinkURL')[0].click();
		$('#hotspotLinkURL').remove();
	} else {
		var showtype = $(obj).attr('showtype');
		if (showtype == 1) {//维度
			// 打开维度列表
			awsui.ajax.request({
				url : './jd',
				method : 'POST',
				loading : true,
				dataType : 'json',
				alert : false,
				data : {
					sid : sessionId,
					cmd : 'com.actionsoft.apps.kms_knwl_center_dimension_card_list_all_json',
					dimensionId : $(obj).attr('dimensionId')
				},
				ok : function(r) {
					$('#knwlListDiv tbody tr').remove();
					var html = '';
					var list = r.data.list;
					if (list.length && list.length > 0) {
						for (var i = 0; i < list.length; i++) {
							var card = list[i];
							html += "<tr>";
							html += "<td>" + (i + 1) + "</td>";
							html += "<td>";
							if (r.data.isNeedBorrow === true) { // 借阅无法预览
								if (card['createUser'] !== uid) {
									html += card.cardName;
								} else {
									html += "<span class='knwl-span' onclick='parent.parent.browseCard.browse(\"" + card.cardId + "\",\"\",true,\"" + card.dimensionId + "\");'>" + card.cardName + "</span>";
								}
							} else {
								html += "<span class='knwl-span' onclick='parent.parent.browseCard.browse(\"" + card.cardId + "\",\"\",true,\"" + card.dimensionId + "\");'>" + card.cardName + "</span>";
							}
							html += "</td>";
							html += "<td>" + card.publishUsername + "</td><td>" + card.publishTime + "</td>";
							html += "<tr>";
						}

						$('#knwlListDiv tbody').append(html)
						$('#knwlListDiv').show();
					} else {
						$('#knwlListDiv').hide();
					}
					resizeKnwlListDiv();
					return false;
				},
				err : function() {

				}
			});
		} else if (showtype == 0) {//链接
			// 跳转到对应的流程图
			awsui.ajax.request({
				url : './jd',
				method : 'POST',
				loading : true,
				dataType : 'json',
				alert : false,
				data : {
					sid : sessionId,
					cmd : 'com.actionsoft.apps.kms_get_dimension_path_from_root',
					dimensionId : $(obj).attr('dimensionId')
				},
				success : function(r) {
					try {
						// 层层递进展开左侧流程树
						var dimensionIdList = r.data.dimensionIdList;
						for (var i = 0; i < dimensionIdList.length; i++) {
							var dimensionId = dimensionIdList[i];
							parent.all.treeObj.expandNode(parent.all.treeObj.getNodeDomById(dimensionId), true);
						}
						// 触发左侧树的click事件展示右侧的知识
						var dimnensionNodeDom = parent.all.treeObj.getNodeDomById(dimensionIdList[dimensionIdList.length - 1]);
						dimnensionNodeDom.trigger('click');
						return false;
					} catch (e) {
					}
				}
			});
		}else if (showtype == 2) {//知识
			parent.parent.browseCard.browse($(obj).attr('cardId'),'',true)
		}
	}
}
/**
 * 重新计算知识列表的高度
 * 
 * @returns
 */
function resizeKnwlListDiv() {
	if ($('#knwlListDiv').is(':visible')) {
		$('#hotspotDiv').css('height', $('#contentWrap').height() - $('#knwlListDiv').outerHeight(true));
	} else {
		$('#hotspotDiv').css('height', '100%');
	}
}
