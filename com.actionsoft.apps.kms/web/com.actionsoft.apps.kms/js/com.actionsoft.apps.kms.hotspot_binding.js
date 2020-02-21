var targetCB;
$(function() {
	try {
		// todo临时注释掉ie8的quicktip，有bug32933
		if (!$.support.leadingWhitespace) {// 判断IE8
			$(document).off('mouseover.over');
		}
	} catch (e) {
	}
	if (getCookie('kms.knwlmgr.separater.originalWidth')) {
		$('#dimension-left').css('width', getCookie('kms.knwlmgr.separater.originalWidth'));
		$('#dimension-right').css('margin-left', ($('#dimension-left').outerWidth(true) + $('#dimension-separater').outerWidth(true)));
	}
	// 悬浮窗口
	$('div[popContent]').on('mouseover', function(e) {
		var popContent = JSON.parse($(this).attr('popContent'));
		$("#popboxCommon .popHead").text(popContent.title);
		$("#popboxCommon .popBody").html(popContent.content);
		$("#popboxCommon").popbox({
			target : $(this)[0]
		});
		$('#popboxCommon').css('height', 'auto').css('border-radius', '6px').css('z-index', '100');
	});
	$('div[popContent]').on('mouseout', function(e) {
		$("#popboxCommon").popbox("close");
	});
	// 绑定知识
	$('.closeKnwl').off('click').on('click', function() {
		$('#knwlListDiv').hide();
		resizeKnwlListDiv();
	});
	$('#knwlListDiv').off('scroll').on('scroll', function() {
		$('.closeKnwl').css('top', $(this).scrollTop() + 14);
	});
	$(window).resize(function() {
		resizeKnwlListDiv();
	});

	targetCB = $("#target").combobox({
		width : 239,
		height : 30,
		menuMaxHeight : 230,
		multiple : false,
		placeholder : "请选择目标",
		sep : ",",
		data : [ "_self", "_blank", "_parent", "_top" ]
	});
	// 初始化树
	dimension.initTree();
});

var clickShapeId;// 图形ID
var clickShapeName;// 图形名称
var clickHotspotId;// 绑定后的数据ID
/**
 * 打开绑定菜单
 * 
 * @param obj
 * @returns
 */
function bindDimensionDialog(obj) {
	clickShapeId = $(obj).attr('shapeId');
	clickShapeName = $(obj).attr('shapeName');
	clickHotspotId = $(obj).attr('hotspotId');

	var bindMenuItems = [ {
		text : "绑定维度",
		tit : "add",
		iconCls : "icon-add",
		method : bindDimension
	}, {
		text : "绑定链接",
		iconCls : "icon-add",
		method : bindLink
	} ];
	if($('#knwlListDiv').is(':visible') && $('#knwlListDiv tbody tr').length > 0){
		bindMenuItems[bindMenuItems.length] = {
				text : "绑定知识",
				iconCls : "icon-add",
				method : bindKnwl
			};
	}
	if (clickHotspotId) {
		bindMenuItems[bindMenuItems.length] = {
			text : "删除绑定",
			iconCls : "icon-remove",
			method : deleteBind
		};
	}
	$("#bindMenu").menu({
		target : $(obj),
		items : bindMenuItems
	});
}
/**
 * 绑定维度
 * 
 * @param obj
 * @returns
 */
function bindDimension() {
	$('#bindMenu').hide();
	// 从树上获取维度ID和维度名称
	var treeNode = dimension.treeObj.getSelectedNode();
	if (!treeNode) {
		$.simpleAlert('请选择一个维度', "info");
		return false;
	}
    if (treeNode.showType == 2) {
        $.simpleAlert('该维度不允许发布知识', "info");
        return false;
    }

	$.confirm({
		title : "请确认",
		content : "确定将维度 [" + treeNode.name + "] 绑定到 [" + clickShapeName + "] 吗？",
		onConfirm : function() {
			awsui.ajax.request({
				url : './jd',
				method : 'POST',
				loading : true,
				dataType : 'json',
				alert : false,
				data : {
					sid : sid,
					cmd : 'com.actionsoft.apps.kms_hotspot_bind',
					dimensionId : treeNode.id,
					shapeId : clickShapeId,
					hotspotDefId : $('#hotspotDefId').val()
				},
				success : function(r) {
					if (r.result === 'ok') {
						renderShapeDiv();
						dimension.treeObj.getNodeDomById(dimension.treeObj.getSelectedNode().id).trigger('click');// 重新click下，渲染出current属性
						$.simpleAlert(r.msg, "ok");
					} else {
						$.simpleAlert(r.msg, "error");
					}
				}
			});
		},
		onCancel : function() {

		}
	});
}
/**
 * 绑定链接
 * 
 * @returns
 */
function bindLink() {
	$('#bindMenu').hide();
	var linkURL = $('#hotspotDiv div[shapeId=' + clickShapeId + ']').attr('linkURL');
	if (linkURL) {
		var target = $('#hotspotDiv div[shapeId=' + clickShapeId + ']').attr('target');
		linkURL = decodeURIComponent(linkURL);
		$('#linkURL').val(linkURL)
		target = decodeURIComponent(target);
		$("#target").setComboboxVal(target);
	}
	$('#linkURLDialog').dialog({
		title : '设置链接',
		buttons : [ {
			text : '确定',
			cls : "blue",
			handler : function() {
				awsui.ajax.request({
					url : './jd',
					method : 'POST',
					loading : true,
					dataType : 'json',
					alert : false,
					data : {
						sid : sid,
						cmd : 'com.actionsoft.apps.kms_hotspot_bind_linkurl',
						linkurl : encodeURIComponent($('#linkURL').val()),
						target : encodeURIComponent(targetCB.getValue()),
						shapeId : clickShapeId,
						hotspotDefId : $('#hotspotDefId').val()
					},
					success : function(r) {
						if (r.result === 'ok') {
							$('#linkURLDialog').dialog('close');
							renderShapeDiv();
							$.simpleAlert(r.msg, "ok");
						} else {
							$.simpleAlert(r.msg, "error");
						}
					}
				});
			}
		}, {
			text : '取消',
			handler : function() {
				$('#linkURLDialog').dialog('close');
			}
		} ],
		onClose : function() {
			$('#linkURL').val('');
			$('#target').setComboboxVal('');
		}

	});
}
/**
 * 绑定知识
 * @returns
 */
function bindKnwl(){
	$('#bindMenu').hide();
	if($('#knwlListDiv').is(':hidden') || $('#knwlListDiv tbody tr.knwl_selected').length < 1){
		$.simpleAlert('请选择一个知识', "info");
		return false;
	}
	var cardId = $('#knwlListDiv tbody tr.knwl_selected').attr('cardId');
	
	$.confirm({
		title : "请确认",
		content : "确定将知识 [" + $('#knwlListDiv tbody tr.knwl_selected td[name=cardName]').text() + "] 绑定到 [" + clickShapeName + "] 吗？",
		onConfirm : function() {
			awsui.ajax.request({
				url : './jd',
				method : 'POST',
				loading : true,
				dataType : 'json',
				alert : false,
				data : {
					sid : sid,
					cmd : 'com.actionsoft.apps.kms_hotspot_bind_card',
					cardId : cardId,
					shapeId : clickShapeId,
					hotspotDefId : $('#hotspotDefId').val()
				},
				success : function(r) {
					if (r.result === 'ok') {
						renderShapeDiv();
						$.simpleAlert(r.msg, "ok");
					} else {
						$.simpleAlert(r.msg, "error");
					}
				}
			});
		},
		onCancel : function() {

		}
	});
}
/**
 * 删除绑定
 * 
 * @returns
 */
function deleteBind() {
	$('#bindMenu').hide();
	$.confirm({
		title : "请确认",
		content : "确认删除绑定吗？",
		onConfirm : function() {
			awsui.ajax.request({
				url : './jd',
				method : 'POST',
				loading : true,
				dataType : 'json',
				alert : false,
				data : {
					sid : sid,
					cmd : 'com.actionsoft.apps.kms_hotspot_delete_bind',
					hotspotId : clickHotspotId
				},
				success : function(r) {
					if (r.result === 'ok') {
						$.simpleAlert(r.msg, "ok");
						renderShapeDiv();
					} else {
						$.simpleAlert(r.msg, "error");
					}
				}
			});
		},
		onCancel : function() {
		}
	});
}
/**
 * 重新渲染shape的div
 * 
 * @returns
 */
function renderShapeDiv() {
	awsui.ajax.request({
		url : './jd',
		method : 'POST',
		loading : true,
		dataType : 'json',
		alert : false,
		async : false,// 同步执行：渲染完毕后需要根据返回结果计算render信息
		data : {
			sid : sid,
			cmd : 'com.actionsoft.apps.kms_hotspot_render_hotspot_div',
			dimensionId : dimensionId,
			shapeId : clickShapeId
		},
		success : function(r) {
			if (r.result === 'ok') {
				$('#hotspotDiv div[shapeId=' + clickShapeId + ']').replaceWith(r.msg);
			} else {
				$.simpleAlert('解析图形出现错误', "error");
			}
		}
	});
}

var dimension = {
	treeObj : undefined,
	initTree : function() { // 初始化维度树(tree)
		if (!dimension.treeObj) {
			var treeDataUrl = "./w?sid=" + sid + "&cmd=com.actionsoft.apps.kms_dimension_tree_bindhotspot_json";
			var setting = {
				sort : true,
				showLine : false,
				event : {
					beforeExpand : dimension.getChildren,
					onClick : dimension.treeClick
				},
				animate : true,
				dataModel : {
					url : treeDataUrl,
					method : "POST",
					dataType : "json",
					params : {
						parentId : ''
					}
				}
			};
			dimension.treeObj = awsui.tree.init($("#dimensionTree"), setting);
			// 取第一个维度的维度列表
			var rootNodes = dimension.treeObj.getRootNode();
			if (rootNodes.length === 0) {
				$('#dimensionTree').html('<div class="kms-no-record">无知识分类</div>');
			} else {
				for (var i = 0; i < rootNodes.length; i++) {
					var firstNodeDom = dimension.treeObj.getNodeDomById(rootNodes[i].id);
					firstNodeDom.trigger('click');
					break;
				}
			}
		}
	},
	getChildren : function(treeNode) {
		var nodeDom = dimension.treeObj.getNodeDomById(treeNode.id);
		if (nodeDom.find("span:eq(1)[class=root-open]").length === 1) { // 闭合时无需请求网络
			return false;
		}
		if (nodeDom.siblings("ul").length === 1) { // 已经请求的网络的节点无需再次请求网络
			return false;
		}
		if (treeNode.open !== null) {
			dimension.treeObj.setting.dataModel.params.parentId = treeNode.id;
			var result = dimension.treeObj.getData(dimension.treeObj.setting.dataModel, treeNode.id);
			dimension.treeObj.buildChilren(result, treeNode);
		}
	},
	treeClick : function(treeNode) {
		$('#hotspotDiv div').removeClass('currHotspotDimension');
		$('#hotspotDiv div[dimensionId=' + treeNode.id + ']').addClass('currHotspotDimension');
		// 打开知识列表
		var showtype = treeNode.showType;
		if (showtype == 1) {
			// 打开维度列表
			awsui.ajax.request({
				url : './jd',
				method : 'POST',
				loading : true,
				dataType : 'json',
				alert : false,
				data : {
					sid : sid,
					cmd : 'com.actionsoft.apps.kms_knwl_center_dimension_card_list_all_json',
					dimensionId : treeNode.id
				},
				ok : function(r) {
					$('#knwlListDiv tbody tr').remove();
					var html = '';
					var list = r.data.list;
					if (list.length && list.length > 0) {
						for (var i = 0; i < list.length; i++) {
							var card = list[i];
							html += "<tr style='cursor:pointer;' onclick='selectKnwl(this)' cardId='"+card.cardId+"'>";
							html += "<td>" + (i + 1) + "</td>";
							html += "<td name='cardName'>";
							html += "<span>" + card.cardName + "</span>";
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
		} else {
			$('#knwlListDiv').hide();
			resizeKnwlListDiv();
		}
	}
};
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

/**
 * 选中知识（行）
 * @param obj
 * @returns
 */
function selectKnwl(obj){
	$('#knwlListDiv tbody tr.knwl_selected').removeClass('knwl_selected');
	$(obj).addClass('knwl_selected');
}