var newWorkTree;
var sid ;
var selectedNode;
$(document).ready(function(){
	initNetWorkTree();
});
//初始化文件层级树
function initNetWorkTree(){
	sid = frmMain.sid.value;
	var dataUrl = './jd?sid=' + sid + '&cmd=com.actionsoft.apps.kms_knwl_center_get_network_tree';
	//相当于刷新树
	$("#networkTree").html('');
	var setting = {
		showIcon:true,
		dblClickToExpand:true,
		animate:true,
		remember:true,
		autoHeight:true,
		event:{
			onClick: selectNode
		},
		dataModel:{
			url:dataUrl,
			method:"POST",
			dataType:"text",
			params:{ }
		}
	};
	newWorkTree = awsui.tree.init($("#networkTree"), setting);
	newWorkTree.resizeTree();
}
function buildChildNode(treeNode){
	var dataUrl = './jd?sid=' + sid + '&cmd=com.actionsoft.apps.kms_knwl_center_get_network_tree';
	var dataModel = {
		url:dataUrl,
		method:"POST",
		dataType:"text",
		params:{
			userId: treeNode.id
		}
	};
	if(treeNode.open != null){
		var result = newWorkTree.getData(dataModel);
		newWorkTree.buildChilren(result, treeNode);
	}
}
function selectNode(treeNode){
	selectedNode = treeNode;
}
