var browseCard;
$(function() {
	try{
		//todo临时注释掉ie8的quicktip，有bug32933
		if(!$.support.leadingWhitespace){//判断IE8
			$(document).off('mouseover.over');
		}
	}catch(e){}
	// 判断权限
	if (hasKnwlCenterNavPerm === false) {
		$('*[indx=center]').remove();
	}
	if (hasKnwlSearchPerm === false) {
		$('*[indx=search]').remove();
	}
	$('.top-item').off('click').on('click', function() {// 导航click
		if ($(this).find('span.current').length != 0) {
			return false;
		}
		$('.top-item span.top-item-line.current').animate({
			width : 0,
			left : '50%'
		}, 400, function() {
			$(this).removeClass('current');
			$(this).siblings('span.top-item-word').removeClass('current');
		});
		$(this).find('span').addClass('current');
		// 打开页面
		var knwlIndx = $(this).attr('indx');
		$('div.content-item[indx!="' + knwlIndx + '"]').hide();
		$('div.content-item[indx="' + knwlIndx + '"]').show();

		var iframeJQ = $('iframe[indx="' + knwlIndx + '"]');
		if (!iframeJQ.attr('src')) {
			if (knwlIndx === 'center') {
				iframeJQ.attr('src', './w?sid=' + sid + '&cmd=com.actionsoft.apps.kms_knwl_center');
			} else if (knwlIndx === 'search') {
				iframeJQ.attr('src', './w?sid=' + sid + '&cmd=com.actionsoft.apps.kms_knwl_search');
			}
		}
	});
	$('.top-item').off('mouseenter').on('mouseenter', function(e) {// 飘入动画效果
		if ($(this).find('span.current').length === 0) {// 如果不是选中状态
			$(this).find('span.top-item-line').animate({
				width : $(this).width(),
				left : 0
			}, 400);
		}
	});
	$('.top-item').off('mouseleave').on('mouseleave', function(e) {// 飘出动画效果
		if ($(this).find('span.current').length === 0) {// 如果不是选中状态
			$(this).find('span.top-item-line').animate({
				width : 0,
				left : '50%'
			}, 400);
		}
	});

	$('.top-item[indx="' + page + '"]').mouseenter();// 根据参数打开某个页面
	$('.top-item[indx="' + page + '"]').click();
	// 初始化右侧浏览dialog
	browseCard = $('#browseCardDialog').browsecard({
		mePhoto : mePhoto,
		isFavoriteAppActive : isFavoriteAppActive,
        isOnlinedocAppActive: isOnlinedocAppActive,
		canPreviewType : canPreviewType,
		isNetworkAppActive : isNetworkAppActive,
        browserPreview: $.grep(browserPreview.split(','), function (n, i) {// 浏览器直接预览，不调用onlinedoc
			return n != '';
		})
	});
});
/**
 * 利用jquery组织冒泡
 * @param event
 * @returns
 */
function stopPropagation(event){
	var eve = $.Event(event);
	eve.stopPropagation();
	return false;
}
