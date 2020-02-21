var browseCard;
$(function() {
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
 * 
 * @param event
 * @returns
 */
function stopPropagation(event) {
	var eve = $.Event(event);
	eve.stopPropagation();
	return false;
}