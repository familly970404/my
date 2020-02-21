var isDimensionInited = false; // 知识维护-维度 是否已经初始化过
var isMetaInited = false; // 知识维护-元数据 是否已经初始化过
var isPeriofvaliInited = false; // 知识维护-有效期 是否已经初始化过
var tabs;
var parentIdForList = '';
var isHotspotSelectInited = false;
$(function () {
    try {
        // todo临时注释掉ie8的quicktip，有bug32933
        if (!$.support.leadingWhitespace) {// 判断IE8
            $(document).off('mouseover.over');
        }
    } catch (e) {
    }
    // 删除知识管理员授权
    if (isSysAdmin !== true && isKnwlMgr !== true) {
        $('#knwlMgrACBtn').remove();
    } else {
        if (isSysAdmin === true) {
            $('#knwlMgrACBtn').show();
        }
        // if (isKnwlMgr === true) {
        //     $('#dimensionReportBtn').show();
        // }
    }
    /* 维度拖动分隔栏开始 */
    if (getCookie('kms.knwlmgr.separater.originalWidth')) {
        $('#dimension-left').css('width', getCookie('kms.knwlmgr.separater.originalWidth'));
        $('#dimension-right').css('margin-left', ($('#dimension-left').outerWidth(true) + $('#dimension-separater').outerWidth(true)));
    }
    var dragFlag = false;// 拖动标记,mousedown时可以拖动,mouseup时不可以拖动
    var originalPageX = 0;
    var originalWidth = parseInt($('#dimension-left').css('width'));
    $('#dimension-separater').off('mousedown').on('mousedown', function (e) {
        dragFlag = true;
        originalPageX = e.pageX;
        $(document).on("selectstart.dimensionmgr", function () {
            return false;
        });
        $(document).off('mousemove.dimensionmgr').on('mousemove.dimensionmgr', function (e) {
            if (dragFlag === true) {
                var minWidthControl = parseInt($('#dimension-left').css('width'));
                var movePx = e.pageX - originalPageX;
                if (!((movePx > 0 && minWidthControl > 500) || (movePx < 0 && minWidthControl < 240))) {
                    $('#dimension-left').css('width', (originalWidth + movePx));
                    $('#dimension-right').css('margin-left', ($('#dimension-left').outerWidth(true) + $('#dimension-separater').outerWidth(true)));
                    dimension.resizeDimensionGrid();
                } else {
                    $(document).trigger('mouseup.dimensionmgr');
                }
            }
        });
        $(document).off('mouseup.dimensionmgr').on('mouseup.dimensionmgr', function (e) {
            if (dragFlag === true) {
                dragFlag = false;
                originalWidth = parseInt($('#dimension-left').css('width'));
                $(document).off("selectstart.dimensionmgr");
                $(document).off('mousemove.dimensionmgr');
                $(document).off('mouseup.dimensionmgr');
                // 记录cookie
                setCookie('kms.knwlmgr.separater.originalWidth', originalWidth);
            }
        });
    });
    /* 维度拖动分隔栏结束 */
    /* 有效期拖动分隔栏开始 */
    if (getCookie('kms.knwlmgrperiofvali.separater.originalWidth')) {
        $('#periofvali-left').css('width', getCookie('kms.knwlmgrperiofvali.separater.originalWidth'));
        $('#periofvali-right').css('margin-left', ($('#periofvali-left').outerWidth(true) + $('#periofvali-separater').outerWidth(true)));
    }
    var dragFlag1 = false;// 拖动标记,mousedown时可以拖动,mouseup时不可以拖动
    var originalPageX1 = 0;
    var originalWidth1 = parseInt($('#periofvali-left').css('width'));
    $('#periofvali-separater').off('mousedown').on('mousedown', function (e) {
        dragFlag1 = true;
        originalPageX1 = e.pageX;
        $(document).on("selectstart.periofvali", function () {
            return false;
        });
        $(document).off('mousemove.periofvali').on('mousemove.periofvali', function (e) {
            if (dragFlag1 === true) {
                var minWidthControl = parseInt($('#periofvali-left').css('width'));
                var movePx = e.pageX - originalPageX1;
                if (!((movePx > 0 && minWidthControl > 500) || (movePx < 0 && minWidthControl < 240))) {
                    $('#periofvali-left').css('width', (originalWidth1 + movePx));
                    $('#periofvali-right').css('margin-left', ($('#periofvali-left').outerWidth(true) + $('#periofvali-separater').outerWidth(true)));
                    validDate.resizeValidDateCardGrid();
                } else {
                    $(document).trigger('mouseup.periofvali');
                }
            }
        });
        $(document).off('mouseup.periofvali').on('mouseup.periofvali', function (e) {
            if (dragFlag1 === true) {
                dragFlag1 = false;
                originalWidth1 = parseInt($('#periofvali-left').css('width'));
                $(document).off("selectstart.periofvali");
                $(document).off('mousemove.periofvali');
                $(document).off('mouseup.periofvali');
                // 记录cookie
                setCookie('kms.knwlmgrperiofvali.separater.originalWidth', originalWidth1);
            }
        });
    });
    /* 有效期拖动分隔栏结束 */
    // 初始化tab
    tabs = awsui.tabs.init($("#tabs"), {
        height: 50,
        contentPanel: $("#tabs-content"),
        focusShowAfter: function (tab) {
            // 更改样式
            if (tab.index === 'nav-tab-dimension') {
                $('#tabs div[index=nav-tab-dimension]').removeClass('nav-tab-right-border');
                $('#tabs div[index=nav-tab-metaSchema]').removeClass('nav-tab-right-border');
                $('#tabs div[index=nav-tab-metaSchema]').addClass('nav-tab-left-border');
                $('#tabs div[index=nav-tab-periofvali]').addClass('nav-tab-left-border');
            } else if (tab.index === 'nav-tab-metaSchema') {
                $('#tabs div[index=nav-tab-dimension]').addClass('nav-tab-right-border');
                $('#tabs div[index=nav-tab-metaSchema]').removeClass('nav-tab-left-border');
                $('#tabs div[index=nav-tab-metaSchema]').removeClass('nav-tab-right-border');
                $('#tabs div[index=nav-tab-periofvali]').addClass('nav-tab-left-border');
            } else if (tab.index === 'nav-tab-periofvali') {
                $('#tabs div[index=nav-tab-dimension]').addClass('nav-tab-right-border');
                $('#tabs div[index=nav-tab-metaSchema]').addClass('nav-tab-right-border');
                $('#tabs div[index=nav-tab-periofvali]').removeClass('nav-tab-left-border');
            }
            if (tab.beforeTabIndex !== tab.index) {
                // 记录cookie-最后打开的tab
                if (getCookie('kms.knwlmgr.opendtab') !== tab.index) {
                    setCookie('kms.knwlmgr.opendtab', tab.index);
                }
                if (tab.beforeTabIndex === undefined) { // 页面初始化
                    if (tab.index === 'nav-tab-dimension') {
                        isDimensionInited = true;
                        dimension.initTree();
                    } else if (tab.index === 'nav-tab-metaSchema') {
                        isMetaInited = true;
                        schema.initMetaSchemaGrid();
                    } else if (tab.index === 'nav-tab-periofvali') {
                        isPeriofvaliInited = true;
                        validDate.initTree();
                        validDate.initValidDateCardGrid();
                    }
                } else {
                    if (tab.index === 'nav-tab-dimension') {
                        if (!isDimensionInited) {
                            dimension.initTree();
                        }
                        dimension.resizeDimensionGrid();
                    } else if (tab.index === 'nav-tab-metaSchema') {
                        if (!isMetaInited) {
                            schema.initMetaSchemaGrid();
                        }
                        schema.resizeSchemaGrid();
                    } else if (tab.index === 'nav-tab-periofvali') {
                        if (!isPeriofvaliInited) {
                            validDate.initTree();
                            validDate.initValidDateCardGrid();
                        }
                        validDate.resizeValidDateCardGrid();
                    }
                }
                return true;
            }
        }
    });
    if (hasDimensionPerm === true) {
        tabs.addTab({
            item: {
                title: "<span class='tab-icon tab-icon-dimension'></span><span style='font-size: 13px;float:left;'>&nbsp;维度</span>",
                index: "nav-tab-dimension"
            },
            close: false
        });
    }
    if (hasMetaPerm === true) {
        tabs.addTab({
            item: {
                title: "<span class='tab-icon tab-icon-meta'></span><span style='font-size: 13px;float:left;'>&nbsp;元数据</span>",
                index: "nav-tab-metaSchema"
            },
            close: false
        });
    }
    if (hasValidDatePerm === true) {
        tabs.addTab({
            item: {
                title: "<span class='tab-icon tab-icon-validdate'></span><span style='font-size: 13px;float:left;'>&nbsp;有效期</span>",
                index: "nav-tab-periofvali"
            },
            close: false
        });
    }
    tabs.focusTab('0000-0000-0000'); // 制造一个undefined的tab的beforeTabIndex,打开页面的时候使用
    var opendtab = getCookie('kms.knwlmgr.opendtab');
    if (opendtab !== 'fromUrlParam') {// 打开tab并非由url决定(父窗口动态打开tab)
        if (opendtab) { // 取上次打开的tab
            tabs.focusTab(opendtab);
        } else { // 第一次打开all
            tabs.focusTab('nav-tab-dimension');
        }
    }
    $('#tabs .awsui-tabs-container').width(300);
    $(window).resize(function () {
        if ($('#tab-dimension').is(':visible')) {
            dimension.resizeDimensionGrid();
        } else if ($('#tab-metaSchema').is(':visible')) {
            schema.resizeSchemaGrid();
        } else if ($('#tab-periofvali').is(':visible')) {
            validDate.resizeValidDateCardGrid();
        }
    });
    // 新建维度
    $("#addDimensionBtn").click(function () {
        dimension.addDimensionDialog();
    });
    // 知识管理员
    $("#knwlMgrACBtn").click(function () {
        dimension.knwlMgrAC();
    });
    $("#dimensionReportBtn").click(function () {
        dimension.dimensionReport();
    });
    // 删除维度
    $('#deleteDimensionBtn').click(function () {
        dimension.deleteDimension();
    });
	// 复制维度
	$('#copyDimensionBtn').click(function () {
		dimension.copyDimension();
	});
    // 刷新维度树
    // $("#refreshDemensionBtn").click(function() {
    // dimension.treeObj.refresh(setting.dataModel);
    // });
    $('#addSchemaBtn').click(function () {
        schema.addSchemaDialog();
    });
    $('#schemaShowtype').off('change.UIType').on('change.UIType', function () {
        schema.toggleAddAttrTR();
    });
    $('#schemaShowtypeUpdate').off('change.UIType').on('change.UIType', function () {
        schema.toggleUpdateAttrTR();
    });
});
var dimension = {
    dimensionGrid: undefined,
    resizeDimensionGrid: function () {
        dimension.dimensionGrid.width($('#tab-dimension').outerWidth(true) - $('#dimension-left').outerWidth(true) - 2);
        dimension.dimensionGrid.height($('#tabs-content').height() - $('#dimension-toolbar').outerHeight(true) - 2);
        dimension.dimensionGrid.awsGrid("refresh");
        if (dimension.totalRecords === 0) {
			$("#dimensionGrid .pq-cont").html('<div class="kms-no-record" style="line-height:120px !important">无维度</div>');
        } else {
            $("#dimensionGrid .pq-cont .kms-no-record").remove();
        }
    },
    totalRecords: 0,
    initDimensionGrid: function () {
        if (!dimension.dimensionGrid) {
            // 初始化维度列表(grid)
            var dimensionGridConfig = {
                width: $('#tab-dimension').outerWidth(true) - $('#dimension-left').outerWidth(true) - 2,
                height: $('#tabs-content').height() - $('#dimension-toolbar').outerHeight(true) - 2,
                flexWidth: false,
                flexHeight: false,
                wrap: false,
                columnBorders: false,
                nowrapTitle: false,
                topVisible: false,
                bottomVisible: false,
                editModel: {
                    clicksToEdit: 0
                },
                scrollModel: {
                    autoFit: false,
                    horizontal: true,
                    vertical: true
                },
                colModel: [{
                    title: "",
                    checkbox: true,
                    resizable: false,
                    align: "center",
                    width: 30
                }, {
                    title: "维度名称",
                    width: 200,
                    sortable: true,
                    dataType: "string",
                    dataIndx: "dimensionName",
                    resizable: true,
                    showText: false
                }, {
                    title: "是否启用",
                    sortable: true,
                    showText: false,
                    width: 100,
                    align: 'center',
                    dataIndx: "isEnabled",
                    render: function (ui) {
                        if (ui.rowData[ui.dataIndx] === 1) {
                            return '启用';
                        } else if (ui.rowData[ui.dataIndx] === 0) {
                            return '不启用';
                        }
                        return '';
                    }
                }, {
                    title: "允许发布知识",
                    sortable: false,
                    showText: false,
                    width: 100,
                    align: 'center',
                    dataIndx: "showtype",
                    render: function (ui) {
                        if (ui.rowData[ui.dataIndx] === 0) {//知识地图不允许发布知识
                            return '不允许';
                        } else if (ui.rowData[ui.dataIndx] === 1) {
                            return '允许';
                        } else if (ui.rowData[ui.dataIndx] === 2) {
                            return '不允许';
                        }
                        return '';
                    }
                }, {
                    title: "发布前审批",
                    sortable: true,
                    showText: false,
                    width: 80,
                    align: 'center',
                    dataIndx: "isExamine",
                    render: function (ui) {
                        if (ui.rowData['showType'] === 1) {// 流程显示，热点图不显示
                            if (ui.rowData[ui.dataIndx] === 1) {
                                return '需要';
                            } else if (ui.rowData[ui.dataIndx] === 0) {
                                return '不需要';
                            }
                        }
                        return '';
                    }
                }, {
                    title: "创建人",
                    width: 100,
                    dataIndx: "createUsername",
                    sortable: true
                }, {
                    title: "创建时间",
                    width: 120,
                    dataIndx: "createTime",
                    align: 'center',
                    sortable: true
                }, {
                    title: "操作",
                    width: 130,
                    align: 'left',
                    dataIndx: "",
                    sortable: false,
                    render: function (ui) {
                        var btnHtml = '';
                        btnHtml += "<span class='opt_icon edit' onclick='dimension.updateDimensionDialog(\"" + ui.rowIndxPage + "\");parent.stopPropagation(event);' title='编辑'></span>";
                        btnHtml += "<span class='opt_icon ac' onclick='dimension.dimensionAC(\"" + ui.rowIndxPage + "\");parent.stopPropagation(event);' title='授权'></span>";
                        btnHtml += "<span class='opt_icon acToDes' onclick='dimension.dimensionACToDes(\"" + ui.rowIndxPage + "\");parent.stopPropagation(event);' title='权限批量应用到后代维度'></span>";
                        btnHtml += "<span class='opt_icon report' onclick='dimension.dimensionReport(\"" + ui.rowIndxPage + "\");parent.stopPropagation(event);' title='策略报告'></span>";
                        if (ui.rowData['showType'] === 0) {
                            btnHtml += "<span class='opt_icon bindhotspot' onclick='dimension.bindHotspotDialog(\"" + ui.rowIndxPage + "\");parent.stopPropagation(event);'   title='设置知识地图'></span>";
                        }
                        return btnHtml;
                    }
                }],
                dataModel: {
                    location: "remote",
                    sorting: "local",
                    method: "POST",
                    getUrl: function () {
                        return {
                            url: "./jd",
                            data: {
                                sid: sid,
                                cmd: "com.actionsoft.apps.kms_dimension_list_json",
                                parentId: parentIdForList
                            }
                        };
                    },
                    getData: function (responseObject) {
                        dimension.totalRecords = responseObject.data.length;
                        return {
                            data: responseObject.data
                        };
                    }
                }
            };
            dimension.dimensionGrid = $("#dimensionGrid").awsGrid(dimensionGridConfig);
            dimension.dimensionGrid.on("awsgridrowselect", function (evt, ui) {
                if ($("#deleteDimensionBtn").is(":hidden")) {
                    $("#deleteDimensionBtn").show();
                }
				var length = dimension.dimensionGrid.awsGrid("getSelectRowIndx").length;
				if (length == 1) {
					$("#copyDimensionBtn").show();
				} else {
					$("#copyDimensionBtn").hide();
				}
            });
            dimension.dimensionGrid.on("awsgridrowunselect", function (evt, ui) {
                var length = dimension.dimensionGrid.awsGrid("getSelectRowIndx").length;
                if (length > 1) {
                    $("#deleteDimensionBtn").show();
                } else {
                    $("#deleteDimensionBtn").hide();
                }
				if (length == 2) {
					$("#copyDimensionBtn").show();
				} else {
					$("#copyDimensionBtn").hide();
				}
            });
            dimension.dimensionGrid.awsGrid({
                load: function (event, ui) {
                    if (dimension.totalRecords === 0) {
						$("#dimensionGrid .pq-cont").html('<div class="kms-no-record" style="line-height:120px !important">无维度</div>');
                    } else {
                        $("#dimensionGrid .pq-cont .kms-no-record").remove();
                    }
                }
            });
        } else {
            dimension.resizeDimensionGrid();
        }
    },
    treeObj: undefined,
    initTree: function () { // 初始化维度树(tree)
        if (!dimension.treeObj) {
            var treeDataUrl = "./w?sid=" + sid + "&cmd=com.actionsoft.apps.kms_dimension_tree_json";
            var setting = {
                sort: true,
                showLine: false,
                event: {
                    beforeExpand: dimension.getChildren,
                    onClick: dimension.treeClick,
                    beforeDrag: dimension.beforeDrag,
                    beforeDrop: dimension.beforeDrop,
                    onDrop: dimension.onDrop
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
            dimension.treeObj = awsui.tree.init($("#dimensionTree"), setting);
            // var firstLevelNodes = dimension.treeObj.getNodeIdsByPid('root');
            // if(firstLevelNodes.length === 0){
            // $("#dimensionTree").html('<div class="kms-no-record"
            // style="margin-top:3px;">无维度</div>');
            // }else{
            // 默认trigger根节点
            var rootNodeDom = dimension.treeObj.getNodeDomById('root');
            rootNodeDom.trigger('click');
            // }
        }
    },
    addDimensionDialog: function () {
        dimension.resetForm();
        // 删除维度名称批量创建的placehodler提示
        $('#dimensionName').attr({
            'placeholder': '用|分隔来批量创建维度',
            'title': '用|分隔来批量创建维度'
        });
        $("#dimensionDialog").dialog({
            width: 600,
            height: 452,
            title: "新建维度",
            buttons: [{
                text: '确定',
                cls: "blue",
                handler: function () {
                    dimension.addDimension();
                }
            }, {
                text: '取消',
                handler: function () {
                    $("#dimensionDialog").dialog("close");
                }
            }]
        });
    },
    initHotspotSelect: function () {
        if (isHotspotSelectInited === false) {
            awsui.ajax.request({
                url: "./jd",
                method: "POST",
				// loading: true,
                data: {
                    sid: sid,
                    cmd: "com.actionsoft.apps.kms_hotspot_def_list_json"
                },
                ok: function (responseObject) {
                    if (responseObject.result === 'ok') {
                        isHotspotSelectInited = true;
                        var hotspotJA = responseObject.data;
                        for (var i = 0; i < hotspotJA.length; i++) {
                            var hotspotJO = hotspotJA[i];
                            $("#hotspotName").append("<option value='" + hotspotJO.id + "'>" + hotspotJO.hotspotName + "</option>");
                        }
                        if (hotspotJA.length > 0) {
                            $("#hotspotName").customSelect(hotspotJA[0].id);
                        }
                    } else {
                        $.simpleAlert(responseObject.msg, "error");
                        return false;
                    }
                }
            });
        } else {
            var hotspotOptions = $("#hotspotName option");
            if (hotspotOptions.length > 0) {
                $("#hotspotName").customSelect(hotspotOptions[0].value);
            }
        }
    },
    // 展开节点
    getChildren: function (treeNode) {
        if (treeNode.id === 'root') { // 根节点展开无需请求网络
            return false;
        }
        var nodeDom = dimension.treeObj.getNodeDomById(treeNode.id);
        if (nodeDom.find("span:eq(1)[class=root-open]").length === 1) { // 闭合时无需请求网络
            return false;
        }
        if (nodeDom.siblings("ul").length === 1) { // 已经请求的网络的节点无需再次请求网络
            return false;
        }
        if (treeNode.open !== null) {
            dimension.treeObj.setting.dataModel.params.parentId = treeNode.id;
            // $('#dimensionTree').find("#tree_icon_" +
            // treeNode.id).addClass("treeLoading");
            var result = dimension.treeObj.getData(dimension.treeObj.setting.dataModel, treeNode.id);
            dimension.treeObj.buildChilren(result, treeNode);
            // $('#dimensionTree').find("span.treeLoading").removeClass("treeLoading");
        }
    },
    // 维度树单击事件
    treeClick: function (treeNode) {
        // 刷新列表
        parentIdForList = treeNode.id;
        if (!dimension.dimensionGrid) {
            dimension.initDimensionGrid();
        } else {
            $('#deleteDimensionBtn').hide();
            dimension.dimensionGrid.awsGrid("refreshDataAndView");
        }
        // 如果无权限,隐藏新建按钮
        if (treeNode.hasPerm === false) {
            $('#addDimensionBtn').hide();
        } else {
            $('#addDimensionBtn').show();
        }
    },
    // 维度树拖拽前事件
    beforeDrag: function (treeNode) {
        if (treeNode.id == 'root') {// 根节点不移动
            return false;
        }
        if (treeNode.hasPerm === false) {
            return false;
        }
        return true;
    },
    sourceParentNode: undefined,
    selectedNode: undefined,
    /**
     * 维度树拖拽后事件
     *
     * @param {}
     *            target 移到哪
     * @param {}
     *            source 移动谁
     * @param {}
     *            dropSort 是否排序(如果不排序dropSort的值就是undefined)
     * @return {Boolean}
     */
    beforeDrop: function (target, source, dropSort) {
        if (source.id === 'root') {
            return false;
        }
        // 不允许拖放到自己
        if (target.id === source.id) {
            $.simpleAlert("位置无效", "info");
            return false;
        }
        // 不允许拖放到自己的父
        if (dropSort === undefined && source.pid === target.id) {
            $.simpleAlert("位置无效", "info");
            return false;
        }
        // 无权限的不能拖动
        if (source.hasPerm === false || target.hasPerm === false) {
            $.simpleAlert("无权限", "info");
            return false;
        }
        var dropContext = '';
        if (dropSort === undefined) {// append
            dropContext = '确认将 [' + source.name + '] 移动到 [' + target.name + '] 的子维度吗？';
        } else if (dropSort === 'below') {// below
            dropContext = '确认将 [' + source.name + '] 移动到 [' + target.name + '] 的下个兄弟维度吗？';
        } else if (dropSort === 'above') {// above
            dropContext = '确认将 [' + source.name + '] 移动到 [' + target.name + '] 的上个兄弟维度吗？';
        } else {
            return false;
        }
        dimension.sourceParentNode = dimension.treeObj.getParentNodeById(source.id);
        dimension.selectedNode = dimension.treeObj.getSelectedNode();
        return confirm(dropContext);
    },
    // 导航树拖动后对树的保存
    onDrop: function (target, source, dropSort) {
        if (dropSort === undefined) {
            dropSort = 'append';
        }
        awsui.ajax.request({
            url: "./jd",
            method: "POST",
			// loading: true,
            data: {
                sid: sid,
                cmd: "com.actionsoft.apps.kms_move_dimension",
                sourceDimensionId: source.id,
                targetDimensionId: target.id,
                sort: dropSort
            },
            ok: function (responseObject) {
                if (responseObject.result === 'ok') {
                    // 刷新维度节点,并保持展开
                    if (dropSort === 'append') {
                        dimension.treeObj.setting.dataModel.params.parentId = dimension.sourceParentNode.id;
                        dimension.treeObj.refreshNode({
                            id: dimension.sourceParentNode.id,
                            dataModel: dimension.treeObj.setting.dataModel
                        });
                        dimension.treeObj.expandNode(dimension.treeObj.getNodeDomById(dimension.sourceParentNode.id), true);
                        dimension.treeObj.setting.dataModel.params.parentId = target.id;
                        dimension.treeObj.refreshNode({
                            id: target.id,
                            dataModel: dimension.treeObj.setting.dataModel
                        });
                        dimension.treeObj.expandNode(dimension.treeObj.getNodeDomById(target.id), true);
                    } else if (dropSort === 'above' || dropSort === 'below') {
                        var targetParentNode = dimension.treeObj.getParentNodeById(target.id);// target不可能是root,所以不用考虑parent不存在的情况
                        dimension.treeObj.setting.dataModel.params.parentId = dimension.sourceParentNode.id;
                        dimension.treeObj.refreshNode({
                            id: dimension.sourceParentNode.id,
                            dataModel: dimension.treeObj.setting.dataModel
                        });
                        dimension.treeObj.expandNode(dimension.treeObj.getNodeDomById(dimension.sourceParentNode.id), true);
                        dimension.treeObj.setting.dataModel.params.parentId = targetParentNode.id;
                        dimension.treeObj.refreshNode({
                            id: targetParentNode.id,
                            dataModel: dimension.treeObj.setting.dataModel
                        });
                        dimension.treeObj.expandNode(dimension.treeObj.getNodeDomById(targetParentNode.id), true);
                    }
                    var selectedNodeDom = dimension.treeObj.getNodeDomById(dimension.selectedNode.id);
                    selectedNodeDom.trigger('click');
                    $.simpleAlert("移动成功", "ok");
                } else {
                    $.simpleAlert(responseObject.msg, "error");
                }
            }
        });
    },
    // 初始化表单控件
    isExamineSB: undefined,
    isPublishKnwlSB: undefined,
    showtypeSB: undefined,
    isEnabledSB: undefined,
    resetForm: function (dimensionId) {
        dimension.initHotspotSelect();
        $("#dimensionId").parent("td").parent("tr").hide();
        $("#dimensionName").val("");
        if (dimension.isExamineSB === undefined) {
            dimension.isExamineSB = $("#isExamine").switchButton({
                ontext: "审批",
                offtext: "不审批",
                swheight: 25,
                change: function () {
                    if ($("#isExamine").prop("checked")) {
                        $('#examineUserTR').show();
                    } else {
                        $('#examineUserTR').hide();
                    }
                }
            });
        }
        dimension.isExamineSB.changeStatus(false);
        $("#isExamine").trigger("change");
        if (dimension.isPublishKnwlSB === undefined) {
            dimension.isPublishKnwlSB = $("#isPublishKnwl").switchButton({
                ontext: "允许",
                offtext: "不允许",
                swheight: 25,
                change: function () {
                    if ($("#isPublishKnwl").prop("checked")) {
                        $('#isExamineTR').show();
                        $("#isExamine").trigger("change");
                    } else {
                        $('#isExamineTR,#examineUserTR').hide();
                    }
                }
            });
        }
        dimension.isPublishKnwlSB.changeStatus(true);
        $("#isPublishKnwl").trigger("change");
        if (dimension.showtypeSB === undefined) {
            dimension.showtypeSB = $("#showtype").switchButton({
                ontext: "是",
                offtext: "否",
                swheight: 25,
                change: function () {
                    if ($("#showtype").prop("checked")) {
                        $("#hotspotNameTR").show();
                        $('#isExamineTR,#examineUserTR,#isPublishKnwlTR').hide();
                    } else {
                        $("#hotspotNameTR").hide();
                        $('#isExamineTR,#isPublishKnwlTR').show();
                        $("#isExamine,#isPublishKnwl").trigger("change");
                    }
                }
            });
        }
        dimension.showtypeSB.changeStatus(false);
        $("#showtype").trigger("change");
        if (dimension.isEnabledSB === undefined) {
            dimension.isEnabledSB = $("#isEnabled").switchButton({
                ontext: "启用",
                offtext: "不启用",
                swheight: 25
            });
        }
        dimension.isEnabledSB.changeStatus(true);
        $("#memo").val("");
        //审批人
        awsui.ajax.request({
            url: "./jd",
            method: "POST",
            loading: false,
            data: {
                sid: sid,
                cmd: "com.actionsoft.apps.kms_knwl_mgr_get_examine_user",
                dimensionId: dimensionId ? dimensionId : ""
            },
            ok: function (responseObject) {
                if (responseObject.result === 'ok') {
                    $('#examineUserSpan').text(responseObject.data.examineUsers);
                }
            }
        });
    },
    // 新建维度
    addDimension: function () {
        if (dimension.checkDimension()) {
            var dimensionNames = $("#dimensionName").val().split('|');
            awsui.ajax.request({
                url: "./jd",
                method: "POST",
				// loading: true,
                data: {
                    sid: sid,
                    cmd: "com.actionsoft.apps.kms_add_dimension",
                    dimensionNames: JSON.stringify(dimensionNames),
                    parentId: dimension.treeObj.getSelectedNode().id,
                    showtype: $("#showtype").prop("checked"),
                    isPublishKnwl: $("#isPublishKnwl").prop("checked"),
                    isExamine: $("#isExamine").prop("checked"),
                    memo: $("#memo").val(),
                    hotspotName: $("#hotspotName").val(),
                    isEnabled: $("#isEnabled").prop("checked")
                },
                ok: function (responseObject) {
                    if (responseObject.result === 'ok') {
                        // 关闭新建窗口
                        $("#dimensionDialog").dialog("close");
                        // 刷新维度树
                        dimension.treeObj.setting.dataModel.params.parentId = dimension.treeObj.getSelectedNode().id;
                        dimension.treeObj.refreshNode({
                            id: dimension.treeObj.getSelectedNode().id,
                            dataModel: dimension.treeObj.setting.dataModel
                        });
                        // 刷新列表
                        $("#deleteDimensionBtn").hide();
                        dimension.dimensionGrid.awsGrid("refreshDataAndView");
                        $.simpleAlert("创建成功", "ok");
                    }
                }
            });
        }
    },
    // 校验
    checkDimension: function () {
        var dimensionName = $("#dimensionName").val();
        if ($.trim(dimensionName) === '') {
            $.simpleAlert("[维度名称]不允许为空", "info");
            $("#dimensionName").focus();
            return false;
        }
        if ($("#dimensionName").attr('placeholder')) {// 创建
            var dimensionNames = dimensionName.split('|');
            for (var i = 0; i < dimensionNames.length; i++) {
                var tmpDimensionName = dimensionNames[i];
                if ($.trim(tmpDimensionName) === '') {
                    $.simpleAlert("[维度名称]不允许为空", "info");
                    $("#dimensionName").focus();
                    return false;
                }
                if ($.trim(tmpDimensionName).length > 128) {
                    $.simpleAlert('[维度名称]长度不能超过128个字符', 'info');
                    $("#dimensionName").focus();
                    return false;
                }
            }
        } else {// 修改
            if ($.trim(dimensionName).length > 128) {
                $.simpleAlert('[维度名称]长度不能超过128个字符', 'info');
                $("#dimensionName").focus();
                return false;
            }
        }
        if ($("#memo").val().length > 128) {
            $.simpleAlert('[描述]长度不能超过128个字符', 'info');
            return false;
        }
        if ($("#showtype").prop("checked") === true) {
            if ($("#hotspotName").val() == null || $("#hotspotName").val() === '') {
                $.simpleAlert("[知识地图]不允许为空", "info");
                $("#hotspotName").focus();
                return false;
            }
        }
        return true;
    },
    // 打开编辑维度对话框
    updateDimensionDialog: function (rowIndx) {
        var rowData = dimension.dimensionGrid.awsGrid("getRowData", rowIndx);
        // 初始化编辑表单
        dimension.resetForm(rowData.id);
        // 删除维度名称批量创建的placehodler和title提示
        $('#dimensionName').removeAttr('placeholder').removeAttr('title').removeAttr('title');
        $('#dimensionId').val(rowData.id);
        $("#dimensionId").parent("td").parent("tr").show();
        $("#dimensionName").val(rowData.dimensionName);
        if (rowData.isExamine === 1) {
            dimension.isExamineSB.changeStatus(true);
        } else if (rowData.isExamine === 0) {
            dimension.isExamineSB.changeStatus(false);
        } else {
            $.simpleAlert("数据错误[发布是否需要审批]", "error");
            return;
        }
        if (rowData.showtype === 2) {//不允许发布知识（仅作分类）
            dimension.isPublishKnwlSB.changeStatus(false);
            $("#isPublishKnwl").trigger("change");
        } else if (rowData.showtype === 1) {
            dimension.showtypeSB.changeStatus(false);
            $("#showtype").trigger("change");
        } else if (rowData.showtype === 0) {
            dimension.showtypeSB.changeStatus(true);
            $("#showtype").trigger("change");
        } else {
            $.simpleAlert("数据错误[绑定知识地图]", "error");
            return;
        }
        if (rowData.isEnabled === 1) {
            dimension.isEnabledSB.changeStatus(true);
        } else if (rowData.isEnabled === 0) {
            dimension.isEnabledSB.changeStatus(false);
        } else {
            $.simpleAlert("数据错误[是否启用]", "error");
            return;
        }
        $('#memo').val(rowData.memo);
        $("#dimensionDialog").dialog({
            width: 600,
            height: 502,
            title: "编辑维度",
            buttons: [(isKnwlMgr ? {
                    text: '部署',
                    cls: "green left",
                    handler: function () {
                        dimension.deployDimension(rowData.id, rowData.dimensionName);
                    }
                } : {
                    text: '',
                    cls: "none",
                    handler: function () {
                    }
                }), {
                text: '确定',
                cls: "blue",
                handler: function () {
                    dimension.updateDimension();
                }
            }, {
                text: '取消',
                handler: function () {
                    $("#dimensionDialog").dialog("close");
                }
            }]
        });
        if (rowData.showtype === 0) {
            // 选中知识地图
            setTimeout(function () {// 给页面以快速表现
                $("#hotspotName").customSelect(rowData.hotspotDefId);
            }, 100);
            setTimeout(function () {// 防止浏览器性能慢的时候dialog未加载出来
                $("#hotspotName").customSelect(rowData.hotspotDefId);
            }, 1000);
            setTimeout(function () {// 防止浏览器性能慢的时候dialog未加载出来
                $("#hotspotName").customSelect(rowData.hotspotDefId);
            }, 3000);
        }
    },
    // 编辑维度
    updateDimension: function () {
        if (dimension.checkDimension()) {
            awsui.ajax.request({
                url: "./jd",
                method: "POST",
				//loading: true,
                data: {
                    sid: sid,
                    cmd: "com.actionsoft.apps.kms_update_dimension",
                    id: $('#dimensionId').val(),
                    dimensionName: $.trim($("#dimensionName").val()),
                    showtype: $("#showtype").prop("checked"),
                    isPublishKnwl: $("#isPublishKnwl").prop("checked"),
                    isExamine: $("#isExamine").prop("checked"),
                    memo: $("#memo").val(),
                    hotspotName: $("#hotspotName").val(),
                    isEnabled: $("#isEnabled").prop("checked")
                },
                ok: function (responseObject) {
                    if (responseObject.result === 'ok') {
                        // 关闭修改窗口
                        $("#dimensionDialog").dialog("close");
                        // 刷新维度树
                        dimension.treeObj.setting.dataModel.params.parentId = dimension.treeObj.getSelectedNode().id;
                        dimension.treeObj.refreshNode({
                            id: dimension.treeObj.getSelectedNode().id,
                            dataModel: dimension.treeObj.setting.dataModel
                        });
                        // 刷新列表
                        $("#deleteDimensionBtn").hide();
                        dimension.dimensionGrid.awsGrid("refreshDataAndView");
                        $.simpleAlert("修改成功", "ok");
                    }
                }
            });
        }
    },
    // 部署维度
    deployDimension: function (dimensionId, functionName) {
        var raw = "./w?sid=@sid&cmd=com.actionsoft.apps.kms_dimension_grid_page_iframe&dimensionId=" + dimensionId;
        var url = './w?sid=' + sid + '&cmd=CLIENT_COMMON_NAVIGATION_DESIGN_DEPLOY_OPEN&url=' + encodeURIComponent(raw) + "&functionName=" + encodeURIComponent(functionName);
        deployFunction(url, true);
    },
    // 删除维度
    deleteDimension: function () {
        $.confirm({
            title: "删除维度",
            content: "该维度的子维度以及知识关联也将被删除!",
            onConfirm: function () {
                var selectedRows = dimension.dimensionGrid.awsGrid("getRows");
                if (selectedRows.length == 0) {
                    $.simpleAlert("请选中需要删除的维度", "info");
                    return false;
                }
                var ids;
                for (var i = 0; i < selectedRows.length; i++) {
                    var obj = selectedRows[i];
                    if (ids == undefined) {
                        ids = obj.id;
                    } else {
                        ids += "," + obj.id;
                    }
                }
                awsui.ajax.request({
                    url: "./jd",
                    method: "POST",
					//  loading: true,
                    data: {
                        sid: sid,
                        cmd: "com.actionsoft.apps.kms_delete_dimension",
                        ids: ids
                    },
                    ok: function (responseObject) {
                        if (responseObject.result == 'ok') {
                            // 刷新维度树
                            dimension.treeObj.setting.dataModel.params.parentId = dimension.treeObj.getSelectedNode().id;
                            dimension.treeObj.refreshNode({
                                id: dimension.treeObj.getSelectedNode().id,
                                dataModel: dimension.treeObj.setting.dataModel
                            });
                            // 刷新列表
                            $("#deleteDimensionBtn").hide();
                            dimension.dimensionGrid.awsGrid("refreshDataAndView");
                        }
                    }
                });
            },
            onCancel: function () {
            }
        });
    },
	// 复制维度
	copyDimension: function () {
		var selectedRows = dimension.dimensionGrid.awsGrid("getRows");
		if (selectedRows.length == 0) {
			$.simpleAlert("请选中需要复制的维度", "info");
			return false;
		}
		var ids;
		for (var i = 0; i < selectedRows.length; i++) {
			var obj = selectedRows[i];
			if (ids == undefined) {
				ids = obj.id;
			} else {
				ids += "," + obj.id;
			}
		}
		$("#dialog-copydimension").dialog({
			buttons: [
				{
					text: '确定', cls: "blue", handler: function () {
						if ($("#newDimensionName").val() == "") {
							$.simpleAlert("维度名称不能为空", "error");
							return false;
						}
						awsui.ajax.request({
							url: "./jd",
							method: "POST",
							//	loading: true,
							data: {
								sid: sid,
								cmd: "com.actionsoft.apps.kms_knwl_mgr_dimension_copy",
								newDimensionName: $("#newDimensionName").val(),
								currDimensionId: ids
							},
							ok: function (responseObject) {
								if (responseObject.result == 'ok') {
									$("#dialog-copydimension").dialog("close");
									// 刷新维度树
									dimension.treeObj.setting.dataModel.params.parentId = dimension.treeObj.getSelectedNode().id;
									dimension.treeObj.refreshNode({
										id: dimension.treeObj.getSelectedNode().id,
										dataModel: dimension.treeObj.setting.dataModel
									});
									// 刷新列表
									$("#deleteDimensionBtn").hide();
									$("#copyDimensionBtn").hide();
									dimension.dimensionGrid.awsGrid("refreshDataAndView");
								}
							}
						});
					}
				},
				{
					text: '取消', handler: function () {
						$("#dialog-copydimension").dialog("close");
					}
				}
			]
		});
	}
	,
	// 知识管理员
	knwlMgrAC: function () {
		var url = './w?sid=' + sid + '&cmd=CLIENT_COMMON_AC_ACTION_OPEN&resourceId=kms.knwlmgr.id&resourceType=kms.knwlmgr';
		FrmDialog.open({
			title: "授权KMS知识管理员",
			width: 750,
			height: 400,
			url: url,
			id: "knwlMgrAC",
			buttons: [{
				text: '添加',
				cls: "blue",
				handler: function () {
					FrmDialog.win().saveAC();
				}
			}, {
				text: '关闭',
				handler: function () {
					FrmDialog.close();
				}
			}]
		});
	}
	,
	// 维度权限
	dimensionAC: function (rowIndx) {
		var rowData = dimension.dimensionGrid.awsGrid("getRowData", rowIndx);
		var url = './w?sid=' + sid + '&cmd=CLIENT_COMMON_AC_ACTION_OPEN&resourceId=' + rowData.id + '&resourceType=kms.dimensionmgr';
		FrmDialog.open({
			title: "维度授权（子维度不继承）",
			width: 750,
			height: 400,
			url: url,
			id: "dimensionAC",
			buttons: [{
				text: '添加',
				cls: "blue",
				handler: function () {
					FrmDialog.win().saveAC();
				}
			}, {
				text: '关闭',
				handler: function () {
					FrmDialog.close();
				}
			}]
		});
	}
	,
	// 应用当前维度权限到后代
	dimensionACToDes: function (rowIndx) {
		$.confirm({
			title: "应用权限到后代维度",
			content: "确认应用权限到后代维度吗？<p><input checked=\"checked\" class='awsui-radio' type='radio' name='dimensionACToDecRadio' id='dimensionACToDecRadio0' value='append'/><label class='awsui-radio-label' for='dimensionACToDecRadio0'>追加</label>&nbsp;&nbsp;&nbsp;&nbsp;<input class='awsui-radio' type='radio' name='dimensionACToDecRadio' id='dimensionACToDecRadio1' value='override'/><label class='awsui-radio-label' for='dimensionACToDecRadio1'>覆盖</label></p>",
			onConfirm: function () {
				var rowData = dimension.dimensionGrid.awsGrid("getRowData", rowIndx);
				awsui.ajax.request({
					url: './jd',
					method: 'POST',
					//loading: true,
					dataType: 'json',
					data: {
						sid: sid,
						cmd: 'com.actionsoft.apps.kms_knwl_mgr_dimension_ac_to_des',
						dimensionId: rowData.id,
						style: $("input[name=dimensionACToDecRadio]:checked").val()
					},
					success: function (ro) {
						if (ro.result === 'ok') {
							$.simpleAlert('设置成功', 'ok');
						}
					}
				});
			},
			onCancel: function () {
			}
		});
		$('.confirm-window').check();
	}
	,
	dimensionReport: function (rowIndx) {
		var dimensionId = "";
		if (rowIndx !== undefined) {//维度
			var rowData = dimension.dimensionGrid.awsGrid("getRowData", rowIndx);
			dimensionId = rowData.id;
		} else {//根维度
		}
		window.open("./w?sid=" + sid + "&cmd=com.actionsoft.apps.kms_knwl_mgr_report&dimensionId=" + dimensionId);
	}
	,
	// 打开( 绑定维度在某个知识地图的shape上 ) 的dialog
	bindHotspotDialog: function (rowIndx) {
		$('#hotspotDiv').dialog({
			title: '设置知识地图',
			width: $(window).width() * 0.95,
			height: $(window).height() * 0.9,
			onClose: function () {
			}
		});
		var rowData = dimension.dimensionGrid.awsGrid("getRowData", rowIndx);
		$("#hotspotFrame").attr('src', encodeURI("./w?sid=" + sid + "&cmd=com.actionsoft.apps.kms_hotspot_binding&dimensionId=" + rowData.id));
	}
};
var schema = {
    schemaGrid: undefined,
    resizeSchemaGrid: function () {
        schema.schemaGrid.width($('#tab-metaSchema').outerWidth(true) - 2);
        schema.schemaGrid.height($('#tabs-content').height() - $('#meta-schema-toolbar').outerHeight(true) - 2);
        schema.schemaGrid.awsGrid("refresh");
        if (schema.totalRecords === 0) {
			$("#meta-schema-grid .pq-cont").html('<div class="kms-no-record" style="padding-top:80px">无元数据</div>');
        } else {
            $("#meta-schema-grid .pq-cont .kms-no-record").remove();
        }
    },
    totalRecords: 0,
    initMetaSchemaGrid: function () {
        if (!schema.schemaGrid) {
            // 计算每页展示多少条比较合适(5的倍数,不出现滚动条，且能尽量充满页面)
            // var gridHeight = $('#tabs-content').height() -
            // $('#meta-schema-toolbar').outerHeight(true) - 2;
            // var gridContentHeight = gridHeight - 25 - 27; // 25为grid的top
            // 27位grid的bottom
            // var gridCounts = Math.floor(Math.floor(gridContentHeight / 34) /
            // 5) * 5;
            var schemaGridConfig = {
                width: $('#tab-metaSchema').outerWidth(true) - 2,
                height: $('#tabs-content').height() - $('#meta-schema-toolbar').outerHeight(true) - 2,
                flexWidth: false,
                flexHeight: false,
                columnBorders: false,
                wrap: false,
                rowDrag: true,
                nowrapTitle: false,
                topVisible: false,
                editable: true,
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
                    width: 200,
                    sortable: true,
                    editable: false,
                    dataType: "string",
                    dataIndx: "schemaTitle",
                    resizable: true,
                    showText: false,
                    render: function (ui) {
                        return "<span name='schemaTitleSpan' style=\"color : #0000EE\" rowIndxPage='" + ui.rowIndxPage + "'>" + ui.rowData[ui.dataIndx] + "</span>";
                    }
                }, {
                    title: "展示类型",
                    width: 60,
                    editable: false,
                    sortable: true,
                    dataIndx: "schemaShowtype",
                    render: function (ui) {
                        var schemaShowtype = ui.rowData[ui.dataIndx];
                        if (schemaShowtype == 0) {
                            return "复选框";
                        } else if (schemaShowtype == 1) {
                            return "单选按钮";
                        } else if (schemaShowtype == 2) {
                            return "文本框";
                        } else {
                            return "数据错误[展示类型]";
                        }
                    }
                }, {
                    title: "必填",
                    sortable: true,
                    editable: false,
                    showText: false,
                    width: 40,
                    align: 'center',
                    dataIndx: "isNullable",
                    render: function (ui) {
                        var isNullableData = ui.rowData[ui.dataIndx];
                        if (isNullableData == 0) {
                            return "是";
                        } else if (isNullableData == 1) {
                            return "否";
                        } else {
                            return "数据错误[展示类型]";
                        }
                    }
                }, {
                    title: "参与检索",
                    sortable: true,
                    editable: false,
                    showText: false,
                    width: 60,
                    align: 'center',
                    dataIndx: "isSearch",
                    render: function (ui) {
                        var isSearchData = ui.rowData[ui.dataIndx];
                        if (isSearchData == 0) {
                            return "否";
                        } else if (isSearchData == 1) {
                            return "是";
                        } else {
                            return "数据错误[展示类型]";
                        }
                    }
                }, {
                    title: "创建人",
                    sortable: true,
                    editable: false,
                    showText: true,
                    width: 100,
                    align: 'center',
                    dataIndx: "createUsername"
                }, {
                    title: "创建时间",
                    sortable: true,
                    editable: false,
                    showText: true,
                    width: 120,
                    align: 'center',
                    dataIndx: "createTime"
                }, {
                    title: "操作",
                    width: 75,
                    align: 'center',
                    editable: false,
                    sortable: false,
                    dataIndx: "",
                    render: function (ui) {
                        var btnHtml = '';
                        btnHtml += "<span class='opt_icon edit' onclick='schema.updateSchemaDialog(\"" + ui.rowIndxPage + "\");parent.stopPropagation(event);' title='编辑'></span>";
                        btnHtml += "<span class='opt_icon ac' onclick='schema.metaSchemaAC(\"" + ui.rowIndxPage + "\");parent.stopPropagation(event);' title='授权'></span>";
                        return btnHtml;
                    }
                }],
                dataModel: {
                    location: "remote",
                    sorting: "remote",
                    paging: "remote",
                    method: "POST",
                    curPage: 1, // 当前页
                    rPP: parent.gridRowPP, // 每页个数
                    getUrl: function () {
                        return {
                            url: "./jd",
                            data: {
                                sid: sid,
                                cmd: "com.actionsoft.apps.kms_knwl_mgr_schema_list_json",
                                curPage: schema.schemaGrid == undefined ? 1 : (schema.schemaGrid.awsGrid("option").dataModel.curPage <= 0 ? 1 : schema.schemaGrid.awsGrid("option").dataModel.curPage),
                                rowsPerPage: schemaGridConfig.dataModel.rPP,
                                sortIndx: this.sortIndx,
                                sortDir: this.sortDir
                            }
                        };
                    },
                    getData: function (responseObject) {
                        schema.totalRecords = responseObject.data.totalRecords;
                        return {
                            curPage: responseObject.data.curPage,
                            totalRecords: responseObject.data.totalRecords,
                            data: responseObject.data.data
                        };
                    }
                }
            };
            schema.schemaGrid = $("#meta-schema-grid").awsGrid(schemaGridConfig);
            schema.schemaGrid.find(".pq-pager").awsGridPager("option", $.awsgrid.awsGridPager.regional["zh"]);
            schema.schemaGrid.on("awsgridrowselect", function (evt, ui) {
                $("#deleteSchemaBtn").show();
            });
            schema.schemaGrid.on("awsgridrowunselect", function (evt, ui) {
                var length = schema.schemaGrid.awsGrid("getSelectRowIndx").length;
                if (length > 1) {
                    $("#deleteSchemaBtn").show();
                } else {
                    $("#deleteSchemaBtn").hide();
                }
            });
            schema.schemaGrid.awsGrid({
                load: function (event, ui) {
                    if (schema.totalRecords === 0) {
						$("#meta-schema-grid .pq-cont").html('<div class="kms-no-record" style="padding-top:80px">无元数据</div>');
                    } else {
                        $("#meta-schema-grid .pq-cont .kms-no-record").remove();
                    }
                }
            });
            // 拖动
            schema.schemaGrid.awsGrid("option", "rowDragCallback", function (source, target) {
                if (source.id === target.id) {
                    return false;
                }
                if (schema.schemaGrid.awsGrid('option').dataModel.getUrl().data.sortIndx !== undefined) {// 人工排序后如果想拖动排序需要刷新并按照orderIndex排序
                    var confirmResult = confirm('您已经自定义了排序，如果想拖动排序，需要刷新页面以使之使用默认排序');
                    if (confirmResult) {
                        window.location.reload();
                    } else {
                        return false;
                    }
                }
                return true;
            });
            schema.schemaGrid.awsGrid("option", "rowDragSuccessCallback", function (source, target) {
                schema.saveOrderIndex(source.id, target.id);
            });
        } else {
            schema.resizeSchemaGrid();
        }
    },
    saveOrderIndex: function (sourceId, targetId) {
        awsui.ajax.request({
            url: './jd',
            method: 'POST',
			//loading: true,
            dataType: 'json',
            data: {
                sid: sid,
                cmd: 'com.actionsoft.apps.kms_knwl_mgr_meta_schema_order_index_save',
                sourceId: sourceId,
                targetId: targetId
            },
            success: function (r) {
                $.simpleAlert('移动成功', 'ok');
                $("#deleteSchemaBtn").hide();
                schema.schemaGrid.awsGrid('refreshDataAndView');
            }
        });
    },
    deleteSchema: function () {
        var selectedRows = schema.schemaGrid.awsGrid("getRows");
        if (selectedRows.length == 0) {
            $.simpleAlert("请选中需要删除的元数据", "info");
            return false;
        }
        $.confirm({
            title: "删除元数据",
            content: "确认删除元数据吗？",
            onConfirm: function () {
                var schemaIds;
                for (var i = 0; i < selectedRows.length; i++) {
                    var obj = selectedRows[i];
                    if (schemaIds == undefined) {
                        schemaIds = obj.id;
                    } else {
                        schemaIds += "," + obj.id;
                    }
                }
                awsui.ajax.request({
                    url: './jd',
                    method: 'POST',
					// loading: true,
                    dataType: 'json',
                    data: {
                        sid: sid,
                        cmd: 'com.actionsoft.apps.kms_knwl_mgr_delete_meta_schema',
                        schemaIds: schemaIds
                    },
                    success: function (r) {
                        $("#deleteSchemaBtn").hide();
                        schema.schemaGrid.awsGrid('refreshDataAndView');
                    }
                });
            },
            onCancel: function () {
            }
        });
    },
    addSchemaDialog: function () {
        $('#addSchemaDialog').dialog({
            width: 600,
            height: 510,
            title: "新建元数据",
            buttons: [{
                text: '确定',
                cls: "blue",
                handler: function () {
                    schema.addSchema();
                }
            }, {
                text: '取消',
                handler: function () {
                    $("#addSchemaDialog").dialog("close");
                }
            }]
        });
        schema.resetAddForm();
    },
    isNullableSB_add: undefined,
    isSearchSB_add: undefined,
    metaAttrGrid_add: undefined,
    resetAddForm: function () {
        $("#deleteMetaAttrBtn").hide();
        $('#schemaTitle').val('');
        $('#schemaShowtype').customSelect('0');
        $('#schemaShowtype').change();
        if (schema.isNullableSB_add == undefined) {
            schema.isNullableSB_add = $("#isNullable").switchButton({
                ontext: "是",
                offtext: "否",
                swheight: 25
            });
            $('#isNullable + span.switchery').attr('title', '发布知识时是否必填');
        }
        schema.isNullableSB_add.changeStatus(false);
        if (schema.isSearchSB_add == undefined) {
            schema.isSearchSB_add = $("#isSearch").switchButton({
                ontext: "显示",
                offtext: "不显示",
                swheight: 25
            });
            $('#isSearch + span.switchery').attr('title', '是否在条件检索中显示');
        }
        schema.isSearchSB_add.changeStatus(true);
        $('#schemaDesc').val('');
        if (schema.metaAttrGrid_add == undefined) { // 初始化Grid
            var metaAttrGridConfig = {
                width: 560,
                height: 170,
                flexWidth: false,
                flexHeight: false,
                columnBorders: false,
                roundCorners: true,
                wrap: false,
                editable: true,
                nowrapTitle: false,
                topVisible: false,
                bottomVisible: false,
                scrollModel: {
                    autoFit: true,
                    horizontal: true
                },
                colModel: [{
                    title: "",
                    checkbox: true,
                    resizable: false,
                    align: "center",
                    width: 30
                }, {
                    title: "名称",
                    width: 200,
                    sortable: false,
                    dataType: "string",
                    dataIndx: "attrTitle",
                    resizable: true,
                    showText: false,
                    editable: true,
                    editor: function (ui) {
                        var $cell = ui.$cell, data = ui.data, rowIndx = ui.rowIndxPage, colIndx = ui.colIndx;
                        var record = schema.metaAttrGrid_add.awsGrid("getRowData", rowIndx);
                        var dataCell = $.trim(data[rowIndx][colIndx]);
                        $("<input id='attrTitle' class='aws-grid-editor-default' type='text'>").appendTo($cell).val(dataCell);
                    },
                    getEditCellData: function (ui) {
                        var $cell = ui.$cell, data = ui.data, rowIndx = ui.rowIndxPage, colIndx = ui.colIndx;
                        var $cell = ui.$cell;
                        return $cell.children().val();
                    }
                }],
                dataModel: {
                    data: [],
                    location: "local",
                    sorting: "local"
                }
            };
            schema.metaAttrGrid_add = $("#metaAttrGrid_add").awsGrid(metaAttrGridConfig);
            // 退出编辑状态时的事件(修改显示)
            schema.metaAttrGrid_add.on("awsgridquiteditmode", function (evt, ui) {
                // 不按Esc 或者 Tab
                if (evt.keyCode != 27 && evt.keyCode != 9) {
                    // 保存当前正在编辑的单元格
                    schema.metaAttrGrid_add.awsGrid("saveEditCell");
                }
            });
            schema.metaAttrGrid_add.on("awsgridrowselect", function (evt, ui) {
                $("#deleteMetaAttrBtn").show();
            });
            schema.metaAttrGrid_add.on("awsgridrowunselect", function (evt, ui) {
                var length = schema.metaAttrGrid_add.awsGrid("getSelectRowIndx").length;
                if (length > 1) {
                    $("#deleteMetaAttrBtn").show();
                } else {
                    $("#deleteMetaAttrBtn").hide();
                }
            });
        } else {
            schema.metaAttrGrid_add.awsGrid("option", "dataModel").data = [];
            schema.metaAttrGrid_add.awsGrid('refreshDataAndView');
        }
    },
    addSchema: function () {
        schema.metaAttrGrid_add.awsGrid("quitEditMode");
        // 校验表单
        var schemaTitle = $.trim($('#schemaTitle').val());
        if (schemaTitle == '') {
            $.simpleAlert("元数据[名称]不允许为空", "info");
            return false;
        }
        if (schemaTitle.length > 36) {
            $.simpleAlert('元数据[名称]长度不能超过36个字符', 'info');
            return false;
        }
        if ($('#schemaDesc').val().length > 1000) {
            $.simpleAlert('元数据[描述]长度不能超过1000个字符', 'info');
            return false;
        }
        var editDatas = schema.metaAttrGrid_add.awsGrid("getEditData");
        var editDatas1 = [];
        if (editDatas) {
            for (var i = 0; i < editDatas.length; i++) {
                var editData = editDatas[i];
                if (editData.attrTitle == undefined || $.trim(editData.attrTitle) == '') {
                    $.simpleAlert("属性列表的[名称]不允许为空", "info");
                    return false;
                } else if ($.trim(editData.attrTitle).length > 80) {
                    $.simpleAlert('属性列表的[名称]长度不能超过80个字符', 'info');
                    return false;
                } else {
                    var editData1 = {
                        'attrTitle': $.trim(editData.attrTitle)
                    };
                    editDatas1[i] = editData1;
                }
            }
        }
        awsui.ajax.request({
            url: './jd',
            method: 'POST',
			// loading: true,
            dataType: 'json',
            data: {
                sid: sid,
                cmd: 'com.actionsoft.apps.kms_knwl_mgr_add_meta_schema',
                schemaTitle: schemaTitle,
                schemaShowtype: $('#schemaShowtype').val(),
                isNullable: $("#isNullable").prop("checked"),
                isSearch: $("#isSearch").prop("checked"),
                schemaDesc: $('#schemaDesc').val(),
                metaAttr: escape(JSON.stringify(editDatas1))
            },
            success: function (r) {
                $('#addSchemaDialog').dialog("close");
                $("#deleteSchemaBtn").hide();
                schema.schemaGrid.awsGrid('refreshDataAndView');
            }
        });
    },
    addMetaAttr: function () {
        schema.metaAttrGrid_add.awsGrid("addRow", {
            'attrTitle': ''
        }, 'bottom');
    },
    deleteMetaAttr: function () {
        var data = schema.metaAttrGrid_add.awsGrid("getRows");
        if (data.length < 1) {
            $.simpleAlert("请先选中行", "info");
            return;
        } else {
            schema.metaAttrGrid_add.awsGrid("deleteRows", data);
            $("#deleteMetaAttrBtn").hide();
        }
    },
    updateSchemaDialog: function (rowIndx) {
        var rowData = schema.schemaGrid.awsGrid("getRowData", rowIndx);
        schema.schemaIdUpdate = rowData.id;
        $('#updateSchemaDialog').dialog({
            width: 600,
            height: 510,
            title: "修改元数据",
            buttons: [{
                text: '确定',
                cls: "blue",
                handler: function () {
                    schema.updateSchema();
                }
            }, {
                text: '取消',
                handler: function () {
                    $("#updateSchemaDialog").dialog("close");
                }
            }],
            onClose: function () {
                // 清空修改的数据数组
                schema.editDatasUpdate = [];
            }
        });
        schema.resetUpdateForm(rowData);
    },
    isNullableSB_update: undefined,
    isSearchSB_update: undefined,
    metaAttrGrid_update: undefined,
    schemaIdUpdate: '',
    resetUpdateForm: function (rowData) {
        $("#deleteMetaAttrBtnUpdate").hide();
        $('#schemaTitleUpdate').val(rowData.schemaTitle);
        $('#schemaShowtypeUpdate').customSelect("" + rowData.schemaShowtype);
        $('#schemaShowtypeUpdate').change();
        if (schema.isNullableSB_update == undefined) {
            schema.isNullableSB_update = $("#isNullableUpdate").switchButton({
                ontext: "是",
                offtext: "否",
                swheight: 25
            });
            $('#isNullableUpdate + span.switchery').attr('title', '发布知识时是否必填');
        }
        if (rowData.isNullable == 1) {
            schema.isNullableSB_update.changeStatus(false);
        } else if (rowData.isNullable == 0) {
            schema.isNullableSB_update.changeStatus(true);
        }
        if (schema.isSearchSB_update == undefined) {
            schema.isSearchSB_update = $("#isSearchUpdate").switchButton({
                ontext: "显示",
                offtext: "不显示",
                swheight: 25
            });
            $('#isSearchUpdate + span.switchery').attr('title', '是否在条件检索中显示');
        }
        if (rowData.isSearch == 1) {
            schema.isSearchSB_update.changeStatus(true);
        } else if (rowData.isSearch == 0) {
            schema.isSearchSB_update.changeStatus(false);
        }
        $('#schemaDescUpdate').val(rowData.schemaDesc);
        var attrTotalRecords = 0;
        if (schema.metaAttrGrid_update == undefined) { // 初始化Grid
            var metaAttrGridConfig = {
                width: 560,
                height: 170,
                flexWidth: false,
                flexHeight: false,
                columnBorders: false,
                roundCorners: true,
                wrap: false,
                editable: true,
                nowrapTitle: false,
                topVisible: false,
                bottomVisible: false,
                scrollModel: {
                    autoFit: true,
                    horizontal: true
                },
                colModel: [{
                    title: "",
                    checkbox: true,
                    resizable: false,
                    align: "center",
                    width: 30
                }, {
                    title: "名称",
                    width: 200,
                    sortable: false,
                    dataType: "string",
                    dataIndx: "attrTitle",
                    resizable: true,
                    showText: false,
                    editable: true,
                    editor: function (ui) {
                        var $cell = ui.$cell, data = ui.data, rowIndx = ui.rowIndxPage, colIndx = ui.colIndx;
                        var record = schema.metaAttrGrid_update.awsGrid("getRowData", rowIndx);
                        var dataCell = $.trim(data[rowIndx][colIndx]);
                        $("<input id='attrTitle' class='aws-grid-editor-default' type='text'>").appendTo($cell).val(dataCell);
                    },
                    getEditCellData: function (ui) {
                        var $cell = ui.$cell, data = ui.data, rowIndx = ui.rowIndxPage, colIndx = ui.colIndx;
                        var $cell = ui.$cell;
                        return $cell.children().val();
                    }
                }, {
                    title: "创建人",
                    width: 100,
                    sortable: false,
                    dataType: "string",
                    dataIndx: "createUsername",
                    resizable: true,
                    showText: false,
                    editable: false
                }, {
                    title: "创建时间",
                    width: 150,
                    sortable: false,
                    dataType: "string",
                    dataIndx: "createTime",
                    resizable: true,
                    align: "center",
                    showText: false,
                    editable: false
                }],
                dataModel: {
                    location: "remote",
                    sorting: "remote",
                    method: "POST",
                    getUrl: function () {
                        return {
                            url: "./jd",
                            data: {
                                sid: sid,
                                cmd: "com.actionsoft.apps.kms_meta_attr_list_json",
                                schemaId: schema.schemaIdUpdate
                            }
                        };
                    },
                    getData: function (responseObject) {
                        attrTotalRecords = responseObject.data.length;
                        return {
                            data: responseObject.data
                        };
                    }
                }
            };
            schema.metaAttrGrid_update = $("#metaAttrGrid_update").awsGrid(metaAttrGridConfig);
            // 退出编辑状态时的事件(修改显示)
            schema.metaAttrGrid_update.on("awsgridquiteditmode", function (evt, ui) {
                // 不按Esc 或者 Tab
                if (evt.keyCode != 27 && evt.keyCode != 9) {
                    // 保存当前正在编辑的单元格
                    schema.metaAttrGrid_update.awsGrid("saveEditCell");
                }
            });
            schema.metaAttrGrid_update.on("awsgridrowselect", function (evt, ui) {
                $("#deleteMetaAttrBtnUpdate").show();
            });
            schema.metaAttrGrid_update.on("awsgridrowunselect", function (evt, ui) {
                var length = schema.metaAttrGrid_update.awsGrid("getSelectRowIndx").length;
                if (length > 1) {
                    $("#deleteMetaAttrBtnUpdate").show();
                } else {
                    $("#deleteMetaAttrBtnUpdate").hide();
                }
            });
            schema.metaAttrGrid_update.awsGrid({
                load: function (event, ui) {
                    if (attrTotalRecords === 0) {
                        $("#metaAttrGrid_update .pq-cont").html('<div class="kms-no-record">无属性</div>');
                    } else {
                        $("#metaAttrGrid_update .pq-cont .kms-no-record").remove();
                    }
                }
            });
        } else {
            schema.metaAttrGrid_update.awsGrid("option", "dataModel").data = [];
            schema.metaAttrGrid_update.awsGrid('refreshDataAndView');
        }
    },
    editDatasUpdate: [],
    updateSchema: function () {
        schema.metaAttrGrid_update.awsGrid("quitEditMode");
        // 校验表单
        var schemaTitle = $.trim($('#schemaTitleUpdate').val());
        if (schemaTitle == '') {
            $.simpleAlert("元数据[名称]不允许为空", "info", 2000);
            return false;
        }
        if (schemaTitle.length > 36) {
            $.simpleAlert('元数据[名称]长度不能超过36个字符', 'info');
            return false;
        }
        if ($('#schemaDesc').val().length > 1000) {
            $.simpleAlert('元数据[描述]长度不能超过1000个字符', 'info');
            return false;
        }
        var editDatas = schema.metaAttrGrid_update.awsGrid("getEditData");
        if (editDatas) {
            for (var i = 0; i < editDatas.length; i++) {
                var editData = editDatas[i];
                if (editData.attrTitle == undefined || $.trim(editData.attrTitle) == '') {
                    $.simpleAlert("属性列表[名称]不允许为空", "info");
                    return false;
                } else if ($.trim(editData.attrTitle).length > 80) {
                    $.simpleAlert('属性列表的[名称]长度不能超过80个字符', 'info');
                    return false;
                } else {
                    var editData1 = {
                        'attrTitle': $.trim(editData.attrTitle)
                    };
                    if (editData.id) {
                        editData1.id = editData.id;
                    }
                    schema.editDatasUpdate[schema.editDatasUpdate.length] = editData1;
                }
            }
        }
        awsui.ajax.request({
            url: './jd',
            method: 'POST',
			// loading: true,
            dataType: 'json',
            data: {
                sid: sid,
                cmd: 'com.actionsoft.apps.kms_knwl_mgr_update_meta_schema',
                schemaId: schema.schemaIdUpdate,
                schemaTitle: schemaTitle,
                schemaShowtype: $('#schemaShowtypeUpdate').val(),
                isNullable: $("#isNullableUpdate").prop("checked"),
                isSearch: $("#isSearchUpdate").prop("checked"),
                schemaDesc: $('#schemaDescUpdate').val(),
                metaAttr: escape(JSON.stringify(schema.editDatasUpdate))
            },
            success: function (r) {
                $('#updateSchemaDialog').dialog("close");
                $("#deleteSchemaBtn").hide();
                schema.schemaGrid.awsGrid('refreshDataAndView');
            }
        });
    },
    addMetaAttrUpdate: function () {
        $("#metaAttrGrid_update .kms-no-record").remove();
        schema.metaAttrGrid_update.awsGrid("addRow", {
            'attrTitle': ''
        }, 'bottom');
    },
    deleteMetaAttrUpdate: function () {
        var datas = schema.metaAttrGrid_update.awsGrid("getRows");
        if (datas.length < 1) {
            $.simpleAlert("请先选中行", "info");
            return;
        } else {
            schema.metaAttrGrid_update.awsGrid("deleteRows", datas, "local");
            // 将删除信息写入数组：编辑时，如果remove为true则删除
            for (var i = 0; i < datas.length; i++) {
                if (datas[i].id != undefined) { // {页面临时数据不用传入服务器删除
                    var editData1 = {
                        'id': datas[i].id,
                        'remove': true
                    };
                    schema.editDatasUpdate[schema.editDatasUpdate.length] = editData1;
                }
            }
            $("#deleteMetaAttrBtnUpdate").hide();
        }
    },
    metaSchemaAC: function (rowIndx) {
        var rowData = schema.schemaGrid.awsGrid("getRowData", rowIndx);
        var url = './w?sid=' + sid + '&cmd=CLIENT_COMMON_AC_ACTION_OPEN&resourceId=' + rowData.id + '&resourceType=kms.metaSchema';
        FrmDialog.open({
            title: "元数据授权",
            width: 750,
            height: 400,
            url: url,
            id: "dimensionAC",
            buttons: [{
                text: '添加',
                cls: "blue",
                handler: function () {
                    FrmDialog.win().saveAC();
                }
            }, {
                text: '关闭',
                handler: function () {
                    FrmDialog.close();
                }
            }]
        });
    },
    toggleAddAttrTR: function () {
        if ($('#schemaShowtype').val() === '2') {
            $('#addAttrTR').hide();
        } else {
            $('#addAttrTR').show();
        }
    },
    toggleUpdateAttrTR: function () {
        if ($('#schemaShowtypeUpdate').val() === '2') {
            $('#updateAttrTR').hide();
        } else {
            $('#updateAttrTR').show();
        }
    }
};
var validDate = {
    validDateCardGrid: undefined,
    resizeValidDateCardGrid: function () {
        validDate.validDateCardGrid.width($('#tab-periofvali').outerWidth(true) - $('#periofvali-left').outerWidth(true) - 2);
        validDate.validDateCardGrid.height($('#tabs-content').height() - $('#valid-date-card-toolbar').outerHeight(true) - 2);
        validDate.validDateCardGrid.awsGrid("refresh");
        if (validDate.totalRecords === 0) {
            $("#valid-date-card-grid .pq-cont").html('<div class="kms-no-km"></br><div class="title">&nbsp;没有知识</div></div>');
        } else {
            $("#valid-date-card-grid .pq-cont .kms-no-km").remove();
        }
    },
    totalRecords: 0,
    initValidDateCardGrid: function () {
        if (!validDate.validDateCardGrid) {
            // var gridHeight = $('#tabs-content').height() -
            // $('#valid-date-card-toolbar').outerHeight(true) - 2;
            // var gridContentHeight = gridHeight - 25 - 27; // 25为grid的top
            // 27位grid的bottom
            // var gridCounts = Math.floor(Math.floor(gridContentHeight / 34) /
            // 5) * 5;
            var validDateCardGridConfig = {
                width: $('#tab-periofvali').outerWidth(true) - $('#periofvali-left').outerWidth(true) - 2,
                height: $('#tabs-content').height() - $('#valid-date-card-toolbar').outerHeight(true) - 2,
                flexWidth: false,
                flexHeight: false,
                columnBorders: false,
                wrap: false,
                nowrapTitle: false,
                topVisible: false,
                editable: true,
                oddRowsHighlight: false,
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
                        if (getCharCodeLength(ui.rowData[ui.dataIndx]) > 46) {// 显示qtip
                            return "<span title=\"" + ui.rowData[ui.dataIndx] + "\"  style='cursor:pointer;color:#0000EE' onclick='parent.browseCard.browse(\"" + ui.rowData.cardId + "\",\"\",false,\"" + ui.rowData.dimensionId + "\");parent.stopPropagation(event);'>" + ui.rowData[ui.dataIndx] + "</button>";
                        } else {
                            return "<span style='cursor:pointer;color:#0000EE' onclick='parent.browseCard.browse(\"" + ui.rowData.id + "\",\"\",true,\"\");parent.stopPropagation(event);'>" + ui.rowData[ui.dataIndx] + "</button>";
                        }
                    }
                }, {
                    title: "知识类型",
                    // width : 200,
                    editable: true,
                    dataIndx: "cardType",
                    align: 'center',
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
                    title: "创建时间",
                    width: 120,
                    sortable: true,
                    dataType: "string",
                    dataIndx: "createTime",
                    resizable: true,
                    align: "center",
                    showText: false,
                    editable: false
                }, {
                    title: "有效期",
                    width: 120,
                    align: 'center',
                    editable: false,
                    dataIndx: "validDate"
                }, {
                    title: "阅读次数",
                    sortable: true,
                    width: 70,
                    editable: false,
                    align: 'center',
                    dataIndx: "readCount"
                }, {
                    title: "创建人",
                    sortable: true,
                    editable: false,
                    showText: false,
                    width: 100,
                    dataIndx: "createUsername"
                }, {
                    title: "操作",
                    width: 120,
                    align: 'left',
                    sortable: false,
                    editable: false,
                    dataIndx: "",
                    render: function (ui) {
                        var btnHtml = '';
                        btnHtml += "<span class='opt_icon cancelpublish' onclick='validDate.cancelPublishCard(" + ui.rowIndxPage + ",\"all\");parent.stopPropagation(event);' title='取消发布'></span>";
                        btnHtml += "<span class='opt_icon log' onclick='showLog(\"" + ui.rowData['id'] + "\",\"" + encodeURIComponent(ui.rowData['cardName']) + "\");parent.stopPropagation(event);' title='日志'></span>";
                        return btnHtml;
                    }
                }],
                dataModel: {
                    location: "remote",
                    sorting: "remote",
                    sortIndx: 'validDate',
                    sortDir: 'up',
                    paging: "remote",
                    method: "POST",
                    curPage: 1, // 当前页
                    rPP: parent.gridRowPP, // 每页个数
                    getUrl: function () {
                        var checkedValidNodes = validDate.treeObj.getCheckedNodes();
                        var checkedValidDimenionArr = [];
                        for (var i = 0; i < checkedValidNodes.length; i++) {
                            checkedValidDimenionArr[i] = checkedValidNodes[i].id;
                        }
                        return {
                            url: "./jd",
                            data: {
                                sid: sid,
                                cmd: "com.actionsoft.apps.kms_knwl_mgr_valid_date_card_list_json",
                                curPage: validDate.validDateCardGrid == undefined ? 1 : (validDate.validDateCardGrid.awsGrid("option").dataModel.curPage <= 0 ? 1 : validDate.validDateCardGrid.awsGrid("option").dataModel.curPage),
                                rowsPerPage: validDateCardGridConfig.dataModel.rPP,
                                dimensionIdArr: JSON.stringify(checkedValidDimenionArr),
                                validDate: JSON.stringify({
                                    'startValidDate': $('#startValidDate').val(),
                                    'endValidDate': $('#endValidDate').val()
                                }),
                                sortIndx: this.sortIndx,
                                sortDir: this.sortDir,
                            }
                        };
                    },
                    getData: function (responseObject) {
                        validDate.totalRecords = responseObject.data.totalRecords;
                        return {
                            curPage: responseObject.data.curPage,
                            totalRecords: responseObject.data.totalRecords,
                            data: responseObject.data.data
                        };
                    }
                }
            };
            validDate.validDateCardGrid = $("#valid-date-card-grid").awsGrid(validDateCardGridConfig);
            validDate.validDateCardGrid.find(".pq-pager").awsGridPager("option", $.awsgrid.awsGridPager.regional["zh"]);
            validDate.validDateCardGrid.awsGrid({
                refresh: function (event, ui) {
                    // 已过期的行用浅红色背景
                    if (!$("#valid-date-card-grid .aws-grid-header-table td[rowspan=1][colspan=1] input[type=checkbox]").prop('checked')) {
                        var dataArr = ui.data;
                        for (var i = 0; i < dataArr.length; i++) {
                            if (dataArr[i].validDate < today) {
                                $("#valid-date-card-grid table tr[pq-row-indx=" + i + "]").addClass('overdue').attr('overdue', 'true');
                            }
                        }
                    }
                    // hover时移除overdue样式
                    $("#valid-date-card-grid tr.aws-grid-row").off('mouseenter').on('mouseenter', function () {
                        $(this).removeClass('overdue');
                    });
                    // out时添加overdue样式
                    $("#valid-date-card-grid tr.aws-grid-row").off('mouseleave').on('mouseleave', function () {
                        if ($(this).attr('rowSelected') === 'true') {
                        } else {
                            if ($(this).attr('overdue')) {
                                $(this).addClass('overdue');
                            }
                        }
                    });
                }
            });
            validDate.validDateCardGrid.awsGrid({
                rowSelect: function (event, ui) {
                    if (ui.$tr.attr('overdue')) {
                        ui.$tr.removeClass('overdue').attr('rowSelected', 'true');
                    }
                }
            });
            validDate.validDateCardGrid.awsGrid({
                rowUnSelect: function (event, ui) {
                    if (ui.$tr.attr('overdue')) {
                        if (ui.$tr.attr('overdue')) {
                            ui.$tr.addClass('overdue').attr('rowSelected', 'false');
                            ;
                        }
                    }
                }
            });
            validDate.validDateCardGrid.on("awsgridrowselect", function (evt, ui) {
                $("#delayDateBtn,#delayDateInput").show();
                $('#delayDateInput').datepicker({
                    minDate: today
                });
            });
            validDate.validDateCardGrid.on("awsgridrowunselect", function (evt, ui) {
                var length = validDate.validDateCardGrid.awsGrid("getSelectedRow").length;
                if (length > 1) {
                    $("#delayDateBtn,#delayDateInput").show();
                } else {
                    $("#delayDateBtn,#delayDateInput").hide();
                }
            });
            validDate.validDateCardGrid.awsGrid({
                load: function (event, ui) {
                    if (validDate.totalRecords === 0) {
                        $("#valid-date-card-grid .pq-cont").html('<div class="kms-no-km"></br><div class="title">&nbsp;没有知识</div></div>');
                    } else {
                        $("#valid-date-card-grid .pq-cont .kms-no-km").remove();
                    }
                }
            });
        } else {
            validDate.resizeValidDateCardGrid();
        }
    },
    cancelPublishCard: function (rowIndx) {
        var rowData = validDate.validDateCardGrid.awsGrid("getRowData", rowIndx);
        awsui.ajax.request({
            url: "./jd",
            method: "POST",
			//loading: true,
            data: {
                sid: sid,
                cmd: "com.actionsoft.apps.kms_knwl_center_cancel_publishes_card_check",
                cardId: rowData.id
            },
            success: function (responseObject) {
                var publishModels = responseObject.data.publishModels;
                var confirmText = '该知识发布在维度';
                for (var i = 0; i < publishModels.length; i++) {
                    var publishModel = publishModels[i];
                    confirmText += '[' + publishModel.dimensionName + ']';
                }
                confirmText += '下，确认取消发布吗？';
                $.confirm({
                    title: "请确认",
                    content: confirmText,
                    onConfirm: function () {
                        awsui.ajax.request({
                            url: "./jd",
                            method: "POST",
							//loading: true,
                            data: {
                                sid: sid,
                                cmd: "com.actionsoft.apps.kms_knwl_center_cancel_publishes_card",
                                cardId: rowData.id
                            },
                            success: function (responseObject) {
                                $("#delayDateBtn,#delayDateInput").hide();
                                validDate.validDateCardGrid.awsGrid('refreshDataAndView');
                                $.simpleAlert("取消发布成功", "ok");
                            }
                        });
                    },
                    onCancel: function () {
                    }
                });
            }
        });
    },
    treeObj: undefined,
    validDateTreeData: undefined,
    initTree: function () { // 初始化维度树和各种组件
        var setting;
        $('#delayDateInput').datepicker();
        $('#delayDateBtn').off('click').on('click', function () {
            validDate.delayDate();
        });
        $('#checkValidateBtn').off('click').on('click', function () {
            $("#delayDateBtn,#delayDateInput").hide();
            validDate.validDateCardGrid.awsGrid('refreshDataAndView');
        });
        // 选中级联子节点
        var checkInheritSB = $("#checkInheritSB").switchButton({
            swheight: 25,
            change: function () {
                validDate.treeObj.destroy();
                setting.checkInherit = this.checked;
                validDate.treeObj = awsui.tree.init($("#validateTree"), setting);
                var rootNodes = validDate.treeObj.getRootNode();
                if (rootNodes.length === 0) {
					$('#validateTree').html('<div class="kms-no-record" style="margin-top:3px;line-height:120px !important">无维度</div>');
                }
                // 记录cookie
                setCookie('kms.knwlmgr.validate.checkInheritSB', this.checked);
            }
        });// 级联是否级联子节点
        var checkInheritCookie = getCookie('kms.knwlmgr.validate.checkInheritSB');
        if (checkInheritCookie == "false") {
            checkInheritSB.changeStatus(false);
        } else {
            checkInheritSB.changeStatus(true);
        }
        if (!validDate.treeObj) {
            // var treeDataUrl = "./w?sid=" + sid +
            // "&cmd=com.actionsoft.apps.kms_dimension_validdate_tree_json";
            // var remoteDataModel = {
            // url : treeDataUrl,
            // method : "POST",
            // dataType : "json",
            // params : {
            // parentId : ''
            // }
            // }
            awsui.ajax.request({
                url: "./jd",
                method: "POST",
				//loading: true,
                async: false,
                data: {
                    sid: sid,
                    cmd: "com.actionsoft.apps.kms_dimension_validdate_tree_all_json"
                },
                success: function (responseObject) {
                    validDate.validDateTreeData = responseObject;
                    setting = {
                        sort: true,
                        showLine: false,
                        checkbox: true,
                        checkInherit: $('#checkInheritSB')[0].checked,
                        event: {
                            // beforeExpand : validDate.getChildren
                            onClick: validDate.onTreeClick
                        },
                        dataModel: {
                            data: validDate.validDateTreeData
                        },
                        animate: true,
                    };
                    validDate.treeObj = awsui.tree.init($("#validateTree"), setting);
                    var rootNodes = validDate.treeObj.getRootNode();
                    if (rootNodes.length === 0) {
						$('#validateTree').html('<div class="kms-no-record" style="margin-top:3px;line-height:120px !important">无维度</div>');
                    }
                }
            });
        }
    },
    getChildren: function (treeNode) {
        if (treeNode.id === 'root') { // 根节点展开无需请求网络
            return false;
        }
        var nodeDom = validDate.treeObj.getNodeDomById(treeNode.id);
        if (nodeDom.find("span:eq(1)[class=root-open]").length === 1) { // 闭合时无需请求网络
            return false;
        }
        if (nodeDom.siblings("ul").length === 1) { // 已经请求的网络的节点无需再次请求网络
            return false;
        }
        if (treeNode.open !== null) {
            validDate.treeObj.setting.dataModel.params.parentId = treeNode.id;
            var result = validDate.treeObj.getData(validDate.treeObj.setting.dataModel, treeNode.id);
            validDate.treeObj.buildChilren(result, treeNode);
        }
    },
    onTreeClick: function (node) {
        // 如果有checkbox 自动选中/取消选中
        var nodeDom = validDate.treeObj.getNodeDomById(node.id);
        nodeDom.find('input[type=checkbox]').click();
    },
    delayDate: function () {
        if ($('#delayDateInput').val() == '') {
            $.simpleAlert("请选择延期日期", "info");
            return false;
        }
        var selectedRows = validDate.validDateCardGrid.awsGrid("getRows");
        if (selectedRows.length < 1) {
            $.simpleAlert("请选中需要延期的知识", "info");
            return false;
        }
        $.confirm({
            title: "请确认",
            content: "确认延期至 " + $('#delayDateInput').val() + " 吗？",
            onConfirm: function () {
                var cardIdArr = [];
                for (var i = 0; i < selectedRows.length; i++) {
                    cardIdArr[i] = selectedRows[i].id;
                }
                awsui.ajax.request({
                    url: "./jd",
                    method: "POST",
					// loading: true,
                    data: {
                        sid: sid,
                        cmd: "com.actionsoft.apps.kms_delay_validdate",
                        cardIdArr: JSON.stringify(cardIdArr),
                        validDate: $('#delayDateInput').val()
                    },
                    ok: function (responseObject) {
                        if (responseObject.result === 'ok') {
                            $.simpleAlert("延期成功", "ok");
                            // 刷新列表
                            $("#delayDateBtn,#delayDateInput").hide();
                            validDate.validDateCardGrid.awsGrid("refreshDataAndView");
                        } else {
                            $.simpleAlert(responseObject.msg, "error");
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