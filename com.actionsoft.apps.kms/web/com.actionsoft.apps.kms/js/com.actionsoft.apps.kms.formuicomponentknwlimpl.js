function initKnwlUI(selectId) {
    if ($('#isMobile').val() === 'true') {
        return;
    }
    var $select = $("#" + selectId + "");
    $select.select2({
        placeholder: "请输入知识名称检索...",
        ajax: {
            url: "./jd",
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return {
                    sid: $('#sid').val(),
                    cmd: 'com.actionsoft.apps.kms_knwl_attr_search_dosearch',
                    curPage: params.page || 1,
                    rowsPerPage: 10,
                    searchDimensionIds: JSON.stringify([]),
                    schemaMetaData: encodeURIComponent(JSON.stringify({'01': [], '2': []})),
                    cardName: params.term,
                    publishTime: JSON.stringify({"startPublishTime": "", "endPublishTime": ""}),
                    publishUser: '',
                    tags: encodeURIComponent(JSON.stringify([])),
                    sortIndx: 'publishTime',
                    sortDir: 'down'
                };
            },
            processResults: function (data, params) {
                params.page = data.data.curPage || 1;
                return {
                    results: data.data.data,
                    pagination: {
                        more: (params.page * 10) < data.data.totalRecords
                    }
                };
            },
            cache: true
        },
        escapeMarkup: function (markup) {
            return markup;
        },
        minimumInputLength: 0,
        templateResult: function (repo) {
            var markup = repo.cardName + "&nbsp;&nbsp;(" + repo.publishUsername + "&nbsp;&nbsp;发布于&nbsp;&nbsp;" + repo.publishTime + ")";
            return markup;
        },
        templateSelection: function (repo) {
            return repo.cardName || repo.text;
        },
        allowClear: true
    });
    var optionArr = eval(selectId + 'Value');
    for (var i = 0; i < optionArr.length; i++) {
        var option = optionArr[i];
        var $option = $('<option selected>' + option.cardName + '</option>').val(option.id);
        $select.append($option);
    }
    $select.trigger('change');
}
