var usertaskDimensionTree;
$(function() {
	var setting = {
		sort : true,
		showLine : false,
		checkbox : true,
		checkInherit : false,
		event : {
		},
		animate : true,
		dataModel : {
			data : usertaskDimensionTreeJson
		}
	};
	usertaskDimensionTree = awsui.tree.init($("#dimensionTree"), setting);
	checkUsertaskDimension();
});

function checkUsertaskDimension() {
	// 根据usertask页面传过来的值选中维度
	var formToKMSOptionDimensionIdJsonArray = formToKMSOptionDimensionIdJA;
	var formToKMSOptionDimensionIdArray = [];
	for (var i = 0; i < formToKMSOptionDimensionIdJsonArray.length; i++) {
		formToKMSOptionDimensionIdArray[i] = formToKMSOptionDimensionIdJsonArray[i];
	}
	usertaskDimensionTree.setCheckNodes(formToKMSOptionDimensionIdArray);
}