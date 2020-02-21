/**
 * 浏览知识-jQuery插件
 *
 *
 * @author wangshibao
 */
(function ($) {
    try {
        // todo临时注释掉ie8的quicktip，有bug32933
        if (!$.support.leadingWhitespace) {// 判断IE8
            $(document).off('mouseover.over');
        }
    } catch (e) {
    }
    $.fn.browsecard = function (options) {
        var settings = $.extend({
            isFavoriteAppActive: false,
            isOnlinedocAppActive: false,
            isNetworkAppActive: false,
            canPreviewType: canPreviewType,
            isPage: false,// 是否是独立的页面
            isBorrow: false,// isBorrow参数重构以后暂时无用，原来用来标记是否是借阅的，现在如果传入boId就认为是借阅的
            browserPreview: []
        }, options);
        var tabId = this.attr('id');
        var cardId;
        /**
         * 浏览知识
         *
         * @param rowIndx
         * @param tabId
         * @returns
         */
        this.browse = function (cardIdArg, boId, isEdit, dimensionId, rowIndxPage, tabIndx) {
            //esc关闭
            $(document).off("keydown.browsekms").on("keydown.browsekms", {
                'tabId': tabId
            }, function (e) {
                if (e.keyCode == 27) {
                    closeBrowseCardDialog(e);
                }
            });
            //侵入式写法，不赞成使用，破坏browse组件的独立性。为临时方案。
            try {
                $($('iframe[indx=search]')[0].contentWindow.document).off("keydown.browsekms").on("keydown.browsekms", {
                    'tabId': tabId
                }, function (e) {
                    if (e.keyCode == 27) {
                        closeBrowseCardDialog(e);
                    }
                });
            } catch (e) {
            }
            try {
                $($('iframe[indx=center]')[0].contentWindow.document).off("keydown.browsekms").on("keydown.browsekms", {
                    'tabId': tabId
                }, function (e) {
                    if (e.keyCode == 27) {
                        closeBrowseCardDialog(e);
                    }
                });
            } catch (e) {
            }
            $('#' + tabId).hide();
            if (isEdit === null || isEdit === undefined) {
                isEdit = false;
            }
            if (dimensionId === null || dimensionId === undefined) {
                dimensionId = '';
            }
            if (rowIndxPage === null || rowIndxPage === undefined) {
                rowIndxPage = -1;
            }
            if (tabIndx === null || tabIndx === undefined) {
                tabIndx = '';
            }
            cardId = cardIdArg;
            $('#sid').val(sid);
            // 绑定提交评论按钮事件
            $('#' + tabId + ' button[name=reportCommentBtn]').off('click').on('click', {
                'tabId': tabId,
                'cardId': cardId
            }, reportSubmit);
            $('#' + tabId + ' textarea[name=commentContent]').off('focus').on('focus', function () {
                $(this).height(40);
            });
            $('#' + tabId + ' textarea[name=commentContent]').off('blur').on('blur', function () {
                $(this).height(17);
            });
            // 绑定打包下载的按钮事件
            $('#' + tabId + ' button[name=packageFiles]').off('click').on('click', {
                'cardId': cardId
            }, packageFiles);
            // 阅读邀请的按钮事件
            $('#' + tabId + ' span[name=browseInvitation]').off('click').on('click', {
                'cardId': cardId
            }, browseInvitationDialog);
            // 绑定收藏/取消收藏的按钮事件
            $('#' + tabId + ' span[name=collectCard]').off('click').on('click', {
                'cardId': cardId
            }, collectCard);
            // 绑定反馈按钮事件
            $('#' + tabId + ' span[name=reportCard]').off('click').on('click', {
                'cardId': cardId,
                'dimensionId': dimensionId
            }, reportCardDialog);
            // 绑定反馈popbox的提交事件
            $('#reportButton').off('click').on('click', {
                'cardId': cardId
            }, reportCard);
            // 绑定刷新知识按钮事件
            $('#' + tabId + ' button[name=reloadCard]').off('click').on('click', {
                tabObj: this,
                args: arguments
            }, reloadCard);
            $('#' + tabId + ' div[name=comment-toogle]').off('click').on('click', function () {
                if ($('#' + tabId + ' div[name=submitCommentDiv]').is(':hidden')) {
                    $('#' + tabId + ' div[name=submitCommentDiv]').css('right', '-700px').show().animate({
                        right: 0
                    }, "slow", function () {
                        $('#' + tabId + ' div[name=comment-toogle]').removeClass('add-comment-wrap').addClass('close-comment-wrap');
                    });
                } else {
                    $('#' + tabId + ' div[name=submitCommentDiv]').animate({
                        right: -700
                    }, "slow", function () {
                        $('#' + tabId + ' div[name=submitCommentDiv]').hide();
                        $('#' + tabId + ' div[name=comment-toogle]').removeClass('close-comment-wrap').addClass('add-comment-wrap');
                    });
                }
            });
            $('#' + tabId + ' div[name=fileAndCommentDiv]').off('scroll').on('scroll', function () {
                $('#' + tabId + ' div[name=comment-toogle]').css('bottom', -$(this).scrollTop() + 5);
                $('#' + tabId + ' div[name=submitCommentDiv]').css('bottom', -$(this).scrollTop());
            });
            // 请求浏览所需的数据
            awsui.ajax.request({
                url: "./jd",
                method: "POST",
				// loading: true,
                data: {
                    sid: sid,
                    cmd: "com.actionsoft.apps.kms_knwl_center_browse_card_info_json",
                    cardId: cardId,
                    isBorrow: settings.isBorrow,
                    boId: boId,
                    isEdit: isEdit,
                    dimensionId: dimensionId
                },
                ok: function (responseObject) {
					var isSupportSideBarVision = responseObject.data.isSupportSideBarVision;
					if (isSupportSideBarVision >= 0) {
						$("#browseCardDialog").removeClass("browse-card-dialog");
						$(".browse-card-title").remove();
						$.openSidebar({
							title: "",
							closeText: "收起",
							width: "700",
							isMode: false,
							duration: "slow",
							topZone: "hide",
							containerId: tabId
						});
					} else {
						$('#' + tabId).show();
						$("div[name='fileAndCommentDiv']").css("top", 343);
					}
                    // 显示面板
					if (settings.isPage === false) {
                        $('#' + tabId).animate({
                            right: 0
                        }, "slow", function () {
                        });
                        $('#wrapper').css('width', '700px');
                        $('#' + tabId).css('width', '700px');
                    } else {
                        $('#' + tabId).css({
                            right: 'auto',
                            bottom: 'auto',
                            top: 'auto',
                            height: '100%'
                        });
                        $('#' + tabId + ' span[name=closeBrowseDialogSpan]').hide();
                        $('#wrapper').css('width', '100%');
                    }
                    $(window).off('resize').on('resize', function () {
                        if ($('#wrapper').length !== 0) {
                            //文件名列的宽度
                            $('#' + tabId + ' div[name=fileAndCommentDiv] table tr:first td:eq(1)').css('width', $('#wrapper').width() - 35 - 15 - 100 - 80 - 130 - 70);
                            $('#' + tabId + ' div[name=fileAndCommentDiv] #attachColTR td:eq(1)').css('width', $('#wrapper').width() - 35 - 15 - 100 - 80 - 130 - 70);
                        } else {
                            //文件名列的宽度
                            $('#' + tabId + ' div[name=fileAndCommentDiv] table tr:first td:eq(1)').css('width', $('#' + tabId).width() - 35 - 15 - 100 - 80 - 130 - 70);
                            $('#' + tabId + ' div[name=fileAndCommentDiv] #attachColTR td:eq(1)').css('width', $('#' + tabId).width() - 35 - 15 - 100 - 80 - 130 - 70);
                        }
                    });
                    $('#' + tabId).resize();
                    $('#' + tabId + ' div.browse-card-title span.title').text(responseObject.data.cardName);
                    // 如果不允许评论,则关闭评论区域(优先处理评论区 防止浏览器处理慢的时候影响用户体验)
                    var isComment = responseObject.data.isComment;
                    if (isComment === 1) {
                        $('#' + tabId + ' div[name=commentDiv]').show();
                        $('#' + tabId + ' div[name=comment-toogle]').show();
                        // 评论内容
                        $('#' + tabId + ' div[name=commentDiv]').empty();
                        var comments = responseObject.data.comments;
                        if (comments.length === 0) {
                        } else {
                            for (var i = 0; i < comments.length; i++) {
                                var comment = comments[i];
                                var commentItem = '<div class="comment-item"><div style="float: left;"><img class="radius30 user-img" src="' + comment.commentUserPhoto + '"></div><div class="content"><div class="content-user">' + comment.commentUsername + ' </div><div class="content-time">' + comment.commentTime + '</div><div class="content-content">' + comment.commentContent + '</div></div></div>';
                                $('#' + tabId + ' div[name=commentDiv]').append(commentItem);
                            }
                        }
                    } else {
                        $('#' + tabId + ' div[name=commentDiv]').hide();
                        $('#' + tabId + ' div[name=comment-toogle]').hide();
                    }
                    var isRate = responseObject.data.isRate;
                    if (isRate === 1) {
                        $('#' + tabId + ' div[name=doRateWrap],#' + tabId + ' div[name=ratingWrap]').show();
                    } else {
                        $('#' + tabId + ' div[name=doRateWrap],#' + tabId + ' div[name=ratingWrap]').hide();
                    }
                    // 是否能编辑知识
                    var canEdit = responseObject.data.canEdit;
                    if (!canEdit) {
                        $('#' + tabId + ' button[name=editCard]').hide();
                    } else {
                        $('#' + tabId + ' button[name=editCard]').show().off('click').on('click', function () {
                            editCardDialog(responseObject.data.card, tabId);
                            return false;
                        });
                    }
                    // 编号,作者
                    $('#' + tabId + ' img[name=cardCreateUserPhoto]').attr('src', responseObject.data.createUserPhoto);
                    $('#' + tabId + ' span[name=cardCreateUsername]').text(responseObject.data.createUsername);
                    $('#' + tabId + ' span[name=cardCreateDept]').text(responseObject.data.createUserDept);
                    // $('#' + tabId + '
                    // span[name=cardIdNo]').text(cardId);
                    // 评分组件
                    var rateId = responseObject.data.rateId;
                    var rateLevel = responseObject.data.rateLevel;
                    $('#' + tabId + ' div[name=rateDiv]').raty({
                        score: rateLevel,
                        cancel: false,
                        cancelPlace: 'right',
                        cancelHint: '取消评分',
                        noRatedMsg: '',
                        hints: ['', '', '', '', ''],
                        cancelOff: '../apps/com.actionsoft.apps.kms/raty/img/cancel-off.png',
                        cancelOn: '../apps/com.actionsoft.apps.kms/raty/img/cancel-on.png',
                        size: 16,
                        starOff: '../apps/com.actionsoft.apps.kms/raty/img/star-off.png',
                        starOn: '../apps/com.actionsoft.apps.kms/raty/img/star-on.png',
                        click: function (score, evt) {
                            if (rateLevel === score) { // 取消评分
                                $('#' + tabId + ' div[name=rateDiv]').raty('cancel', true);
                                return false;
                            }
                            // 评分
                            awsui.ajax.request({
                                url: "./jd",
                                method: "POST",
								//  loading: true,
                                data: {
                                    sid: sid,
                                    cmd: "com.actionsoft.apps.kms_knwl_center_rate_card",
                                    rateId: rateId,
                                    cardId: cardId,
                                    rateLevel: score
                                },
                                success: function (responseObject) {
                                    rateId = responseObject.data.newRateId;
                                    rateLevel = score;
                                    //刷新知识tab
                                    $('#browseCardDialog button[name=reloadCard]').click();
                                }
                            });
                        }
                    });
                    // 评分信息
                    var rates = responseObject.data.rates;
                    if ((rates['1'] + rates['2'] + rates['3'] + rates['4'] + rates['5']) != 0) {
                        // 平均值
                        var totalScore = rates['1'] * 1 + rates['2'] * 2 + rates['3'] * 3 + rates['4'] * 4 + rates['5'] * 5;
                        var avgScore = (totalScore / (rates['1'] + rates['2'] + rates['3'] + rates['4'] + rates['5'])).toFixed(1);
                        $('#' + tabId + ' strong[name=avgScore]').text(avgScore);
                        $('#' + tabId + ' div[name=avgRate]').raty({
                            readOnly: true,
                            noRatedMsg: '',
                            score: avgScore,
                            hints: ['', '', '', '', ''],
                            size: 16,
                            starOff: '../apps/com.actionsoft.apps.kms/raty/img/star-off.png',
                            starHalf: '../apps/com.actionsoft.apps.kms/raty/img/star-half.png',
                            starOn: '../apps/com.actionsoft.apps.kms/raty/img/star-on.png'
                        });
                        // 评分人数
                        var rateUserCounts = rates['1'] + rates['2'] + rates['3'] + rates['4'] + rates['5'];
                        $('#' + tabId + ' span[name=rateUserCounts]').text(rateUserCounts);
                        // 某星评分比例
                        $('#' + tabId + ' span[name=fiveStar]').text(((rates['5'] / rateUserCounts) * 100).toFixed(1) + '%');
                        $('#' + tabId + ' span[name=fourStar]').text(((rates['4'] / rateUserCounts) * 100).toFixed(1) + '%');
                        $('#' + tabId + ' span[name=threeStar]').text(((rates['3'] / rateUserCounts) * 100).toFixed(1) + '%');
                        $('#' + tabId + ' span[name=twoStar]').text(((rates['2'] / rateUserCounts) * 100).toFixed(1) + '%');
                        $('#' + tabId + ' span[name=oneStar]').text(((rates['1'] / rateUserCounts) * 100).toFixed(1) + '%');
                        $('#' + tabId + ' div[name=fiveStarBar]').width(((rates['5'] / rateUserCounts) * 100 * 1.5).toFixed(1));
                        $('#' + tabId + ' div[name=fourStarBar]').width(((rates['4'] / rateUserCounts) * 100 * 1.5).toFixed(1));
                        $('#' + tabId + ' div[name=threeStarBar]').width(((rates['3'] / rateUserCounts) * 100 * 1.5).toFixed(1));
                        $('#' + tabId + ' div[name=twoStarBar]').width(((rates['2'] / rateUserCounts) * 100 * 1.5).toFixed(1));
                        $('#' + tabId + ' div[name=oneStarBar]').width(((rates['1'] / rateUserCounts) * 100 * 1.5).toFixed(1));
						$('#' + tabId + ' .rating_wrap').css("top", "0px");
                        $('#' + tabId + ' div[name=percentDiv]').show();
                    } else {
                        $('#' + tabId + ' strong[name=avgScore]').text(0);
                        $('#' + tabId + ' div[name=avgRate]').raty({
                            readOnly: true,
                            noRatedMsg: '',
                            score: 0,
                            hints: ['', '', '', '', ''],
                            size: 16,
                            starOff: '../apps/com.actionsoft.apps.kms/raty/img/star-off.png',
                            starHalf: '../apps/com.actionsoft.apps.kms/raty/img/star-half.png',
                            starOn: '../apps/com.actionsoft.apps.kms/raty/img/star-on.png'
                        });
                        $('#' + tabId + ' span[name=rateUserCounts]').text(0);
						$('#' + tabId + ' .rating_wrap').css("top", "40px");
                        $('#' + tabId + ' div[name=percentDiv]').hide();
                    }
					if (responseObject.data.onlineLevel === 0 || responseObject.data.onlineLevel == 2) {
                        $('#' + tabId + ' button[name=packageFiles]').hide();
                    } else if (responseObject.data.onlineLevel != 0) {
                        $('#' + tabId + ' button[name=packageFiles]').show();
                    }
					var cardContext = responseObject.data.cardContext;
					if (cardContext == "") {
						$("#cardContext-readOnly").hide();
						if (isSupportSideBarVision >= 0) {
							$("div[name='fileAndCommentDiv']").css("top", 203);
						} else {
							$("div[name='fileAndCommentDiv']").css("top", 233);
						}
					} else {
						$("#cardContext-readOnly").show();
						if (isSupportSideBarVision >= 0) {
							$("div[name='fileAndCommentDiv']").css("top", 320);
						} else {
							$("div[name='fileAndCommentDiv']").css("top", 353);
						}
					}
					$("#cardContext-readOnly").html(cardContext);
					// $("[name='cardContext-readOnly']").html(cardContext);
                    // 文件列表
                    $('#' + tabId + ' table[name=attachTable] tr[id!=attachColTR]').remove();
                    var files = responseObject.data.files;
                    if (files.length === 0) {
                        $('#' + tabId + ' table[name=attachTable]>tbody').append('<tr><td colspan="10" style="text-align: center;"><div class="kms-no-file">无文件</div></td></tr>');
                    } else {
                        for (var i = 0; i < files.length; i++) {
                            var file = files[i];
                            var tr = "<tr>";
                            tr += "<td style='text-align:center;height: 28px;'>" + (i + 1) + "</td>";
                            if (file.fileState == 2) {
                                tr += "<td><div class='file_icon file-type-" + file.fileSuffixIcon + "'></div><div class='browse_file_name' title='" + file.fileNameNoVersion + "'><a href='javascript:' onclick='browserPreviewFun(\"" + tabId + "\",\"" + file.id + "\",\"" + encodeURIComponent(file.fileNameNoVersion) + "\",0,\"" + file.createUserPhoto + "\",\"" + file.createUser + "\");return false;'>" + file.fileNameNoVersion + "</a></div><div class='file_version'>" + file.fileVersion + "</div></td>";
                                tr += "<td><span class='file_download' style='display:none;'></span></td>";
                            } else {
                                var fileType = file.fileNameNoVersion.lastIndexOf(".") > -1 ? file.fileNameNoVersion.substring(file.fileNameNoVersion.lastIndexOf(".") + 1, file.fileNameNoVersion.length) : "";
                                if ($.inArray(fileType, settings.browserPreview) != -1) {// 浏览器直接预览，不使用onlinedoc
									if (responseObject.data.onlineLevel === 0 || responseObject.data.onlineLevel == 2) {
										tr += "<td><div class='file_icon file-type-" + file.fileSuffixIcon + "'></div><div class='browse_file_name' title='" + file.fileNameNoVersion + "'><a href='javascript:' onclick='browserPreviewFun(\"" + tabId + "\",\"" + file.id + "\",\"" + encodeURIComponent(file.fileNameNoVersion) + "\",0,\"" + file.createUserPhoto + "\",\"" + file.createUser + "\");return false;'>" + file.fileNameNoVersion + "</a></div><div class='file_version'>" + file.fileVersion + "</div></td>";
										tr += "<td><span class='file_download' style='display:none;'></span></td>";
                                    } else if (responseObject.data.onlineLevel != 0) {
										tr += "<td><div class='file_icon file-type-" + file.fileSuffixIcon + "'></div><div class='browse_file_name' title='" + file.fileNameNoVersion + "'><a href='javascript:' onclick='browserPreviewFun(\"" + tabId + "\",\"" + file.id + "\",\"" + encodeURIComponent(file.fileNameNoVersion) + "\",1,\"" + file.createUserPhoto + "\",\"" + file.createUser + "\");return false;'>" + file.fileNameNoVersion + "</a></div><div class='file_version'>" + file.fileVersion + "</div></td>";
										tr += "<td><span class='file_download' onclick='downloadFile(this);return false;' aFileId='" + file.id + "'></span></td>";
                                    }
                                } else {
                                    if (settings.isOnlinedocAppActive) {
										if (responseObject.data.onlineLevel === 0 || responseObject.data.onlineLevel == 2) {
											tr += "<td><div class='file_icon file-type-" + file.fileSuffixIcon + "'></div><div class='browse_file_name' title='" + file.fileNameNoVersion + "'><a href='javascript:' onclick='showFullScreenPanel(\"" + tabId + "\",\"" + settings.canPreviewType + "\",\"" + file.id + "\",\"" + encodeURIComponent(file.fileNameNoVersion) + "\",\"" + encodeURIComponent(file.fileName) + "\",\"0\",0,\"" + file.createUserPhoto + "\",\"" + file.createUser + "\","+responseObject.data.onlineLevel+");return false;'>" + file.fileNameNoVersion
												+ "</a></div><div class='file_version'>" + file.fileVersion + "</div></td>";
                                            tr += "<td><span class='file_download' style='display:none;'></span></td>";
										} else if (responseObject.data.onlineLevel === 1) {
											tr += "<td><div class='file_icon file-type-" + file.fileSuffixIcon + "'></div><div class='browse_file_name' title='" + file.fileNameNoVersion + "'><a href='javascript:' onclick='showFullScreenPanel(\"" + tabId + "\",\"" + settings.canPreviewType + "\",\"" + file.id + "\",\"" + encodeURIComponent(file.fileNameNoVersion) + "\",\"" + encodeURIComponent(file.fileName) + "\",\"0\",1,\"" + file.createUserPhoto + "\",\"" + file.createUser + "\","+responseObject.data.onlineLevel+");return false;'>" + file.fileNameNoVersion
												+ "</a></div><div class='file_version'>" + file.fileVersion + "</div></td>";
                                            tr += "<td><span class='file_download' onclick='downloadFile(this);return false;' aFileId='" + file.id + "'></span></td>";
                                        }
                                    } else {
										if (responseObject.data.onlineLevel === 0 || responseObject.data.onlineLevel == 2) {
                                            tr += "<td><div class='file_icon file-type-" + file.fileSuffixIcon + "'></div><div class='browse_file_name' title='" + file.fileNameNoVersion + "'>" + file.fileNameNoVersion + "</div><div class='file_version'>" + file.fileVersion + "</div></td>";
                                        } else if (responseObject.data.onlineLevel != 0) {
                                            tr += "<td><div class='file_icon file-type-" + file.fileSuffixIcon + "'></div><div style='cursor:pointer;color:#0000EE;' class='browse_file_name' title='" + file.fileNameNoVersion + "' onclick='downloadFile(this);return false;' aFileId='" + file.id + "'>" + file.fileNameNoVersion + "</div><div class='file_version'>" + file.fileVersion + "</div></td>";
                                        }
                                        tr += "<td><span class='file_download' style='display:none;'></span></td>";
                                    }
                                }
                            }
                            tr += "<td class='browse_createuser'>" + file.createUsername + "</td><td>" + AWSFile.formatSize(file.fileSize) + "</td><td style='text-align: center;'>" + file.createTime + "</td><td style='text-align: center;'>" + file.downloadCount + "</td></tr>";
                            $('#' + tabId + ' table[name=attachTable]>tbody').append(tr);
                        }
                    }
                    // 收藏信息
                    if (responseObject.data.isFavoriteAppActive === false) { // 我的收藏应用不是可用状态
                        $('#' + tabId + ' span[name=collectCard]').hide();
                    }
                    var isCollected = responseObject.data.isCollected; // 是否被我收藏
                    if (isCollected === true) {
                        $('#' + tabId + ' span[name=collectCard] span.collectionword').text('取消收藏');
                        $('#' + tabId + ' span[name=collectCard]').width('82px');
                    } else {
                        $('#' + tabId + ' span[name=collectCard] span.collectionword').text('收藏');
                        $('#' + tabId + ' span[name=collectCard]').width('56px');
                    }
                    $('#' + tabId + ' span[name=collectCard] span.collectionword').text($('#' + tabId + ' span[name=collectCard] span.collectionword').text());
                },
                err: function () {
                    $('#' + tabId).css('right', -$('#' + tabId).width() + 'px');
                }
            });
        }
        /**
         * 关闭浏览dialog
         *
         * @param event
         * @returns
         */
        function closeBrowseCardDialog(event) {
            //取消esc监听
            $(document).off("keydown.browsekms");
            try {
                $($('iframe[indx=search]')[0].contentWindow.document).off("keydown.browsekms");
            } catch (e) {
            }
            try {
                $($('iframe[indx=center]')[0].contentWindow.document).off("keydown.browsekms");
            } catch (e) {
            }
            var tabId = event.data.tabId;
            $('#' + tabId).animate({
                right: -$('#' + tabId).width() + 'px'
            }, "normal", function () {
                $('#' + tabId).hide();
            });
        }

        /**
         * 评论知识
         *
         * @param tabId
         * @returns
         */
        function reportSubmit(event) {
            var tabId = event.data.tabId;
            var cardId = event.data.cardId;
            var commentContent = $('#' + tabId + ' textarea[name=commentContent]').val();
            if ($.trim(commentContent) == '') {
                $.simpleAlert("评论内容不允许为空", "info");
                return false;
            }
            if (commentContent.length > 1000) {
                $.simpleAlert('评论内容长度不能超过1000个字符', 'info');
                return false;
            }
            awsui.ajax.request({
                url: "./jd",
                method: "POST",
				// loading: true,
                data: {
                    sid: sid,
                    cmd: "com.actionsoft.apps.kms_knwl_center_comment_insert",
                    cardId: cardId,
                    commentContent: commentContent
                },
                success: function (responseObject) {
                    var comment = responseObject.data.comment;
                    if (responseObject.result == 'ok') {
                        // 增加到列表
                        var commentItem = '<div class="comment-item"><div style="float: left;"><img class="radius30 user-img" src="' + comment.commentUserPhoto + '"></div><div class="content"><div class="content-user">' + comment.commentUsername + ' </div><div class="content-time">' + comment.commentTime + '</div><div class="content-content">' + comment.commentContent + '</div></div></div>';
                        $('#' + tabId + ' div[name=commentDiv]').prepend(commentItem);
                        // $('#' + tabId + ' div[name=commentDiv]').animate({
                        // scrollTop : 0
                        // }, 500);
                        // 清除评论textarea
                        $('#' + tabId + ' textarea[name=commentContent]').val('');
                    }
                }
            });
        }

        /**
         * 打包下载
         *
         * @param event
         * @returns
         */
        function packageFiles(event) {
            var cardId = event.data.cardId;
            awsui.ajax.request({
                url: "./jd",
                method: "POST",
                alert: false,
				// loading: true,
                data: {
                    sid: sid,
                    cmd: "com.actionsoft.apps.kms_knwl_center_package_files",
                    cardId: cardId
                },
                success: function (responseObject) {
                    if (responseObject.result === 'ok') { // 返回下载url
                        $(document.body).append("<a id='packageFilesHref' style='display:none;' href='" + responseObject.msg + "'>tmp</a>");
                        $('#packageFilesHref')[0].click();
                        $('#packageFilesHref').remove();
                    } else {
                        $.simpleAlert(responseObject.msg, "error");
                    }
                }
            });
        }

        /**
         * 阅读邀请
         */
        function browseInvitationDialog(event) {
            var cardId = event.data.cardId;
            renderSelectShareForm(cardId);
            $("#select-share-dlg").dialog({
                title: "文件分享",
                model: true,
                draggable: true,
                width: 388,
                height: 232,
                buttons: [{
                    text: "关闭",
                    handler: function () {
                        $("#select-share-dlg").dialog("close");
                    }
                }]
            });
            $("#select-share-dlg .dlg-content").css("margin", "0px");
            $("#select-share-dlg .dlg-content").css("border", "none");
            $("#select-share-dlg .dlg-title").css("display", "none");
            $("#select-share-dlg .dialog-button-wrap").css("float", "right").css("width", "100px");
            return false;
        }

        function renderSelectShareForm(cardId) {
            $("#select-share-dlg-content").empty();
            var navTabStr = "";
            navTabStr += '<div id="easy-outer-nav" class="easy-outer-nav">';
            navTabStr += '         <ul id="easy-tab-nav"  class="easy-tab-nav">';
            navTabStr += '            <li class="current"><span class="sharetopeople-nav-icon"></span><span  class="nav-title-text">分享给同事</span></li>';
            if (isNetworkAppActive === true) {
                navTabStr += '            <li><span class="sharetonetwork-nav-icon"></span><span  class="nav-title-text">分享到工作网络</span></li>';
            }
            // navTabStr += ' <li><span class="linkshare-nav-icon"></span><span
            // class="nav-title-text">链接分享</span></li>';
            navTabStr += '         </ul> ';
            navTabStr += '         <div id="easy-content-nav" class="easy-content-nav">';
            navTabStr += '	         <div style="display:block;" class="nav-config-panel" id="shareToUserPanel">分享给同事</div> ';
            if (isNetworkAppActive === true) {
                navTabStr += '		     <div class="nav-config-panel" id="memberInfo">分享到工作网络</div>';
            }
            // navTabStr += ' <div class="nav-config-panel"
            // id="fileInfo">链接共享</div>';
            navTabStr += '       </div>';
            navTabStr += ' </div>';
            $("#select-share-dlg-content").append(navTabStr);
            easyTabInit("easy-tab-nav", "easy-content-nav");
            // 分享给同事
            $("#shareToUserPanel").empty();
            var contentstr1 = "";
			contentstr1 += "<h3 style='height:40px;font-weight: normal'><input placeholder='按照组织、用户、角色选择分享人' readonly='true' id='shareAddressInput' style='width:350px;font-size: 14px;cursor:pointer;' type='text'  class='txt'></h3>";
            contentstr1 += "<span id='sharefiletopeopleac'  style='padding:5px 20px;' class='button blue'>确认分享</span>";
            contentstr1 += "<div id='ac-panel' class='ac-panel'></div>";
            $("#shareToUserPanel").append(contentstr1);
			$('#shareAddressInput').address({maxRowNumber: 2});
            $("#sharefiletopeopleac").off('click').on('click', function () {
                sendBrowseInvitation(cardId);
            });
            // 分享到工作网络
            $("#memberInfo").empty();
            var contentstr1 = "";
            contentstr1 += "<h3 style='height:40px;line-height:40px;'><font>选择要分享到的工作网络或者小组</font></h3>";
            contentstr1 += "";
            contentstr1 += "<span class='button blue' style='padding:5px 20px;'  id='selectnetworkbtn'>选择工作网络</span>";
            contentstr1 += "";
            $("#memberInfo").append(contentstr1);
            $("#selectnetworkbtn").off('click').on('click', function () {
                shareToNetWork(cardId);
            });
            // 链接共享
            // $("#fileInfo").empty();
            // var contentstr1 = "";
            // contentstr1 += "<h3
            // style='height:40px;line-height:40px;'><font>创建文件外部访问链接</font></h3>";
            // contentstr1 += "";
            // contentstr1 += "<span class='button blue' style='padding:8px
            // 30px;' id='createshareurl'>创建链接</span>";
            // contentstr1 += "<span id='sharereturninfo'></span>";
            // $("#fileInfo").append(contentstr1);
            // $("#createshareurl").click(function() {
            // createLinkShare(fileId);
            // });
        }

        function easyTabInit(tabid, contentid) {
            var oLi = document.getElementById(tabid).getElementsByTagName("li");
            // var oUl =
            // document.getElementById(contentid).getElementsByTagName("div");
            var oUl = $("#" + contentid).children("div");
            var oDiv = document.getElementById(tabid).getElementsByTagName("div");
            for (var i = 0; i < oLi.length; i++) {
                oLi[i].index = i;
                oLi[i].onclick = function () {
                    for (var n = 0; n < oLi.length; n++)
                        oLi[n].className = "";
                    this.className = "current";
                    for (var n = 0; n < oUl.length; n++)
                        oUl[n].style.display = "none";
                    oUl[this.index].style.display = "block";
                    for (var n = 0; n < oDiv.length; n++) {
                        if (this.className == "current") {
                            oDiv[n].style.display = "none";
                            oDiv[this.index].style.display = "block";
                        }
                    }
                };
            }
        }

        function sendBrowseInvitation(cardId) {
            if ($.trim($('#shareAddressInput').val()) === '') {
                $.simpleAlert('请选择要分享的人', "info");
                return false;
            }
            awsui.ajax.request({
                url: "./jd",
                method: "POST",
                alert: false,
				//  loading: true,
                data: {
                    sid: sid,
                    cmd: "com.actionsoft.apps.kms_knwl_center_send_browse_invitation",
                    cardId: cardId,
                    targetUsers: encodeURIComponent($.trim($('#shareAddressInput').val()))
                },
                success: function (responseObject) {
                    if (responseObject.result === 'ok') {
                        $.simpleAlert(responseObject.msg, "ok");
                        setTimeout(function () {
                            $('#shareAddressInput').val('');
                            $("#select-share-dlg").dialog("close");
                        }, 1500);
                    } else {
                        $.simpleAlert(responseObject.msg, responseObject.result);
                    }
                }
            });
        }

        function shareToNetWork(cardId) {
            // 选择工作网络弹出框
            var url = encodeURI("./w?sid=" + sid + "&cmd=com.actionsoft.apps.kms_knwl_center_get_network_page");
            var dlg = FrmDialog.open({
                width: 500,
                height: 400,
                title: "分享到工作网络",
                url: url,
                id: "selectnetworkdlgid",
                buttons: [{
                    text: '确定',
                    cls: "blue",
                    handler: function () {
                        var childwin = dlg.win();
                        var selectNode = childwin.selectedNode;
                        if (selectNode != undefined) {
                            var selectedId = childwin.selectedNode.id;
                            var selectedNodeType = childwin.selectedNode.nodetype;
                            if (selectedNodeType != "1") {
                                saveStream(cardId, "", selectedId);
                            } else {
                                saveStream(cardId, selectedId, "");
                            }
                            dlg.close();
                        } else {
                            $.simpleAlert('请选择一个工作网络或者小组', 'info');
                        }
                    }
                }, {
                    text: '关闭',
                    handler: function () {
                        dlg.close();
                    }
                }],
                data: {}
            });
        }

        // 保存信息流
        function saveStream(cardId, teamId, networkId) {
            $.confirm({
                title: "请确认",
                content: "确认分享到工作网络吗？",
                onConfirm: function () {
                    var params = {
                        cardId: cardId,
                        teamId: teamId,
                        networkId: networkId
                    };
                    var url = './jd?sid=' + sid + '&cmd=com.actionsoft.apps.kms_knwl_center_shareto_network';
                    awsui.ajax.post(url, params, function (responseObject) {
                        if (responseObject['result'] == 'ok') {
                            $.simpleAlert('分享成功', 'ok', 1500, {
                                model: true
                            });
                            setTimeout(function () {
                                $('#shareAddressInput').val('');
                                $("#select-share-dlg").dialog("close");
                            }, 1500);
                        } else {
                            $.simpleAlert(responseObject['msg'], responseObject['result']);
                        }
                    }, 'json');
                },
                onCancel: function () {
                }
            });
        }

        /**
         * 收藏知识/取消收藏知识
         *
         * @param event
         * @returns
         */
        function collectCard(event) {
            var cardId = event.data.cardId;
            awsui.ajax.request({
                url: "./jd",
                method: "POST",
                alert: false,
				// loading: true,
                data: {
                    sid: sid,
                    cmd: "com.actionsoft.apps.kms_knwl_center_collect_card",
                    cardId: cardId
                },
                success: function (responseObject) {
                    if (responseObject.result === 'ok') { // 收藏成功
                        $('#' + tabId + ' span[name=collectCard] span.collectionword').text('取消收藏');
                        $('#' + tabId + ' span[name=collectCard]').width('82px');
                    } else if (responseObject.result === 'warning') { // 取消收藏成功
                        $('#' + tabId + ' span[name=collectCard] span.collectionword').text('收藏');
                        $('#' + tabId + ' span[name=collectCard]').width('56px');
                    }
                    $.simpleAlert(responseObject.msg, "ok");
                }
            });
        }

        var reportCardId;
        var reportDimensionId;

        /**
         * 打开反馈知识对话框
         *
         * @param event
         * @returns
         */
        function reportCardDialog(event) {
            $('#reportTextarea').val(''); // 清空内容
            reportCardId = event.data.cardId;
            reportDimensionId = event.data.dimensionId;
            $('#reportCardPopbox').popbox({
                target: event.target,
                height: 178,
                width: 250
            });
        }

        /**
         * 反馈知识
         *
         * @param event
         * @returns
         */
        function reportCard() {
            var reportTextareaVal = $('#reportTextarea').val();
            if ($.trim(reportTextareaVal) == '') {
                $.simpleAlert("反馈内容不允许为空", "info");
                return false;
            }
            if (reportTextareaVal.length > 1000) {
                $.simpleAlert('反馈内容长度不能超过1000个字符', 'info');
                return false;
            }
            awsui.ajax.request({
                url: "./jd",
                method: "POST",
                alert: false,
				//  loading: true,
                data: {
                    sid: sid,
                    cmd: "com.actionsoft.apps.kms_knwl_center_report_card",
                    cardId: reportCardId,
                    dimensionId: reportDimensionId,
                    reportContent: encodeURIComponent(reportTextareaVal)
                },
                success: function (responseObject) {
                    if (responseObject.result === 'ok') {
                        $.simpleAlert("谢谢您的反馈", "ok");
                        $('#reportCardPopbox').popbox("close");
                    } else {
                        $.simpleAlert(responseObject.msg, responseObject.result);
                    }
                }
            });
        }

        function reloadCard(event) {
            var args = event.data.args;
            var tabObj = event.data.tabObj;
            tabObj.browse(args[0], args[1], args[2], args[3], args[4], args[5]);
        }

        return this.each(function () {
            // 评分组件
            if ($('#ratyScript').length === 0) {
                $('head').append('<script id="ratyScript" type="text/javascript" src="../apps/com.actionsoft.apps.kms/raty/jquery.raty.min.js"></script>');
            }
            // 将com.actionsoft.apps.kms.browsecard.htm填充this
            var reportFlag = $('#reportCardPopbox').length > 0;
            $(this).addClass('browse-card-dialog');
            $(this).load('../apps/com.actionsoft.apps.kms/js/com.actionsoft.apps.kms.browsecard.htm ' + (reportFlag ? '#browseCardDialog > *' : '#browseCardDialog > *,#reportCardPopbox,#select-share-dlg'), {}, function () {
				if (window.label1) {
					$("label[for='rdoSL0']").html(label1);
				}
				if (window.label2) {
					$("label[for='rdoSL1']").html(label2);
				}
				if (window.label3) {
					$("label[for='rdoSL2']").html(label3);
				}
				if (window.hasOnlineLevel) {
					if (hasOnlineLevel == "1") {
						$(".onlineLevelTr").show();
					} else {
						$(".onlineLevelTr").hide();
					}
				}
                if (!reportFlag) {
                    $('#reportCardPopbox').appendTo(document.body);
                    $('#select-share-dlg').appendTo(document.body);
                }
                // 个人照片
                $('#' + tabId + ' img[name=mePhoto]').attr('src', settings.mePhoto);
                // 收藏按钮
                if (settings.isFavoriteAppActive) {
                    $('#' + tabId + ' span[name=collectCard]').show();
                }
                // 绑定关闭浏览dialog按钮事件
                $('#' + tabId + ' span[name=closeBrowseDialogSpan]').off('click').on('click', {
                    'tabId': tabId
                }, closeBrowseCardDialog);
                // esc关闭dialog
                // $(document).off("keydown.kms").on("keydown.kms", function(e)
                // {
                // if (e.keyCode == 27) {
                // $('#' + tabId + ' span[name=closeBrowseDialogSpan]').click();
                // }
                // });
            });
        });
    };
})(jQuery);
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
 *
 * @param fileId
 * @param fileName
 * @param fileType
 * @param canPreviewFlag
 * @param canDownloadFlag
 * @returns
 */
function showFullScreenPanel(tabId, canPreviewType, fileId, fileName, fileNameVersion, canPreviewFlag, canDownloadFlag, createUserPhoto, createUser,onlineLevel) {
    if (canPreviewFlag != undefined && canPreviewFlag == '0') { // 文件允许预览
    } else { // 文件不允许预览
        if (canDownloadFlag == 1) {
            downloadFile(fileId);
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
        if (canDownloadFlag == 1) {
            downloadFile(fileId);
        } else {
            $.simpleAlert('该文件不支持预览和下载', "info");
        }
        return false;
    }
    $('#' + tabId + ' div[name=fullscreenWrap]').show();
    $("body").css("overflow", "hidden");
	$(".fstoolbar").hide();
    // 将文件标题显示
    $(".toolbar-title").empty();
	// $(".toolbar-title").append(fileName);
    $(".toolbar-photo img").attr('src', createUserPhoto);
    $(".toolbar-photo img").attr('userId', createUser);
    var isCopy = 1;
	if (onlineLevel == 0) {
		isCopy = 0;
	} else if (onlineLevel == 1 || onlineLevel == 2) {
		isCopy = 1;
	}
    previewMyFile(tabId, fileId, canDownloadFlag,isCopy);
    if (canDownloadFlag === 0) {
        $('#' + tabId + ' div[name=fsdownloadbtn]').hide();
    } else if (canDownloadFlag == 1) {
        $('#' + tabId + ' div[name=fsdownloadbtn]').show();
    } else {
    }
    $('#' + tabId + ' div[name=fsdownloadbtn]').attr('aFileId', fileId);
    $('#' + tabId + ' div[name=fsclosebtn]').click(function () {
        closeFsPanel(tabId);
    });
}

function previewMyFile(tabId, fileId, canDownloadFlag,isCopy) {
    $('#' + tabId + ' div[name=previewpanel]').empty();
//    $.simpleAlert("文件正在加载，请稍侯...", "loading");
    awsui.ajax.request({
        url: "./jd",
        method: "POST",
        data: {
            fileId: fileId,
            sid: sid,
            cmd: 'com.actionsoft.apps.kms_knwl_center_preview_file',
            isDownload: canDownloadFlag == 1,
			isCopy:isCopy == 1
        },
        ok: function (responseObject) {
            if (responseObject['result'] == 'ok') {
                // $.simpleAlert("close");
                var url = responseObject["data"]['url'];
                $('#' + tabId + ' div[name=previewpanel]').empty();
                $('#' + tabId + ' div[name=previewpanel]').append("<iframe frameBorder='0' class='previewfrm' name='previewfrm' id='previewfrm'  allowfullscreen='true' allowtransparency='true'></iframe>");
                $('#' + tabId + ' *[name=previewfrm]').attr("src", url);
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
        },
        err: function () {
            $('#window-mask').hide();
            $('#' + tabId + ' div[name=fsclosebtn]').click();
        }
    });
}

//关闭预览
function closePreviewFile() {
    var back = $("#previewfrm").contents().find("#filepre_back");
    back.click(function () {
        // $('div[name=previewpanel]').hide();//页面关闭销毁转换请求
        $("div[name=fullscreenWrap]").hide();
    });
}
/**
 * 浏览器预览
 *
 * @returns
 */
function browserPreviewFun(tabId, fileId, fileName, canDownloadFlag, createUserPhoto, createUser) {
    fileName = decodeURIComponent(fileName);
    $('#' + tabId + ' div[name=fullscreenWrap]').show();
    $("body").css("overflow", "hidden");
	$(".fstoolbar").show();
    // 将文件标题显示
    $(".toolbar-title").empty();
	//$(".toolbar-title").append(fileName);
    $(".toolbar-photo img").attr('src', createUserPhoto);
    $(".toolbar-photo img").attr('userId', createUser);
    $('#' + tabId + ' div[name=previewpanel]').empty();
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
                $('#' + tabId + ' div[name=previewpanel]').empty();
                $('#' + tabId + ' div[name=previewpanel]').append("<iframe frameBorder='0' class='previewfrm' id='previewfrm' name='previewfrm'  allowfullscreen='true' allowtransparency='true'></iframe>");
                if (responseObject.data.isImg === true) {
                    $('#' + tabId + ' *[name=previewfrm]').attr("src", './w?sid=' + sid + '&cmd=com.actionsoft.apps.kms_knwl_browser_preview_image&fileId=' + fileId);
                } else {
                    $('#' + tabId + ' *[name=previewfrm]').attr("src", responseObject.data.url);
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
            $('#' + tabId + ' div[name=fsclosebtn]').click();
        }
    });
    if (canDownloadFlag === 0) {
        $('#' + tabId + ' div[name=fsdownloadbtn]').hide();
    } else if (canDownloadFlag == 1) {
        $('#' + tabId + ' div[name=fsdownloadbtn]').show();
    } else {
    }
    $('#' + tabId + ' div[name=fsdownloadbtn]').attr('aFileId', fileId);
    $('#' + tabId + ' div[name=fsclosebtn]').click(function () {
        closeFsPanel(tabId);
    });
}
/**
 * 关闭预览
 *
 * @returns
 */
function closeFsPanel(tabId) {
    $('#' + tabId + ' div[name=fullscreenWrap]').hide();
}
/**
 * 打开编辑知识对话框
 */
var isCommentSB;
var isRateSB;
var cardUUID;
var isFileUpdated = false;//是否上传或删除了知识，如果有则刷新知识tab
function showEditor() {
	$("#cardEditTd").show();
	$("#cardEditNoContent").hide();
}
function editCardDialog(card, tabId) {

    // 表单数据使用已经查询的Grid数据,文件列表请求数据库
    cardUUID = card.cardId;
    $('#cardName').val(card.cardName);
    $('#validDate').val(card.validDate);
	//$('#cardContext').val(card.cardContext);
	if (window.cardContentUM) {
		cardContentUM.destroy();
	}
	if (card.cardContext == "") {
		$("#cardEditTd").hide();
		$("#cardEditNoContent").show();
	} else {
		$("#cardEditTd").show();
		$("#cardEditNoContent").hide();
	}
	$("#cardEditTd").html("<script type='text/plain' id='cardEditInfo' name='cardEditInfo'  style='height:170px;white-space: normal;width:98%' >" + card.cardContext + "</script>");
	var toolbar = window.advancedToolbar;
	toolbar.autoHeightEnabled = false;
	UE.Editor.prototype.placeholder = function (justPlainText) {
		var _editor = this;
		_editor.addListener("focus", function () {
			/*var localHtml = _editor.getContent();
			if ($.trim(localHtml) === $.trim("<p>" + justPlainText + "</p>")) {
				_editor.setContent(" ");
			}*/
		});
		_editor.addListener("blur", function () {
			var localHtml = _editor.getContent();
			if (!localHtml) {
				$("#cardEditTd").hide();
				$("#cardEditNoContent").show();
				//_editor.setContent(justPlainText);
			}
		});
		_editor.ready(function () {
			_editor.fireEvent("blur");
		});
	};
	cardContentUM = UE.getEditor("cardEditInfo", toolbar);
	cardContentUM.placeholder("");
	AddBtnFunc(cardContentUM, "cardEditInfo", "", false, false, false);
    $('input[name=radioxOL],input[name=radioxSL]').check();
    $("#validDate").datepicker({
        minDate: today
    });
    //$("#rdoOL" + card.onlineLevel).check("option", "checked", true);
	var rdoOLOption = {
		width : 250,
		data:[
			{text : "常规",
				children : [
					{id: "1", text: "转换PDF格式在线阅读，允许下载"},
					{id: "2", text: "转换PDF格式在线阅读，禁止下载"}
				]},
			{text : "安全",
				children : [
					{id:"0",text:"转换图片格式在线阅读，禁止下载（首次转换时间较长,客户端阅读快）"}
				]}
		]
	};
	if ($("#rdoOL").attr("data-select2-id") != "rdoOL") {
		$("#rdoOL").select2(rdoOLOption);
	}
	$("#rdoOL").val(card.onlineLevel).trigger("change");
    $("#rdoSL" + card.securityLevel).check("option", "checked", true);
    if (!isCommentSB) {
        isCommentSB = $("#isCommentSB").switchButton({
			swheight: 25,
			swwidth: 100,
			ontext: "允许评论",
			offtext: "禁止评论"
        });
    }
    isCommentSB.changeStatus(card.isComment === 1);
    if (!isRateSB) {
        isRateSB = $("#isRateSB").switchButton({
			swheight: 25,
			swwidth: 100,
			ontext: "允许打分",
			offtext: "禁止打分"
        });
    }
    isRateSB.changeStatus(card.isRate === 1);
    awsui.ajax.request({
        url: "./jd",
        method: "POST",
		//loading: true,
        data: {
            sid: sid,
            cmd: "com.actionsoft.apps.kms_knwl_center_file_list_json",
            cardId: cardUUID
        },
        ok: function (responseObject) {
            var fileJA = responseObject.data;
            if (fileJA.length === 0) {
                $('#fileTable').append('<tr><td colspan="10" style="text-align: center;"><div class="kms-no-file">无文件</div></td></tr>');
            } else {
                if (typeof browserPreview == 'string') {
                    browserPreview = $.grep(browserPreview.split(','), function (n, i) {// 浏览器直接预览，不调用onlinedoc
                        return n != '';
                    });
                }
                for (var i = 0; i < fileJA.length; i++) {
                    var file = fileJA[i];
                    var tr = "<tr id='" + file.id + "TR'>";
                    tr += "<td style='text-align:center;'>" + (i + 1) + "</td>";
                    if (file.fileState == 2) {
                        tr += "<td><div class='file_icon file-type-" + file.fileSuffixIcon + "'></div><div class='browse_file_name' title='" + file.fileName + "'><a href='javascript:' onclick='browserPreviewFun(\"" + tabId + "\",\"" + file.id + "\",\"" + encodeURIComponent(file.fileName) + "\",0,\"" + file.createUserPhoto + "\",\"" + file.createUser + "\");return false;'>" + file.fileName + "</a></div></td>";
                    } else {
                        var fileType = file.fileName.lastIndexOf(".") > -1 ? file.fileName.substring(file.fileName.lastIndexOf(".") + 1, file.fileName.length) : "";
                        if ($.inArray(fileType, browserPreview) != -1) {// 浏览器直接预览，不使用onlinedoc
                            tr += "<td><div class='file_icon file-type-" + file.fileSuffixIcon + "'></div><div class='browse_file_name' title='" + file.fileName + "'><a href='javascript:' onclick='browserPreviewFun(\"" + tabId + "\",\"" + file.id + "\",\"" + encodeURIComponent(file.fileName) + "\",1,\"" + file.createUserPhoto + "\",\"" + file.createUser + "\");return false;'>" + file.fileName + "</a></div></td>";
                        } else {
                            if (isOnlinedocAppActive) {
                                tr += "<td><div class='file_icon file-type-" + file.fileSuffixIcon + "'></div><div class='browse_file_name' title='" + file.fileName + "'><a href='javascript:' onclick='showFullScreenPanel(\"" + tabId + "\",\"" + canPreviewType + "\",\"" + file.id + "\",\"" + encodeURIComponent(file.fileName) + "\",\"" + encodeURIComponent(file.fileName) + "\",\"0\",\"1\",\"" + file.createUserPhoto + "\",\"" + file.createUser + "\")'>" + file.fileName + "</a></div></td>";
                            } else {
                                tr += "<td><div class='file_icon file-type-" + file.fileSuffixIcon + "'></div><div class='browse_file_name' title='" + file.fileName + "'>" + file.fileName + "</div></td>";
                            }
                        }
                    }
                    var deleteBtn = '<a href="javascript:" onclick="deleteFile(\'' + file.id + '\');return false;"><span class="icon_delete_file"></span></a>';
                    tr += "<td>";
                    if (file.fileState == 2) {
                    } else {
                        tr += "<a class='file_download' target='_blank' href='" + file.fileDownloadURL + "'></a>";
                    }
                    tr += "</td><td>" + file.fileVer + "</td><td class='browse_createuser'>" + file.createUsername + "</td><td>" + AWSFile.formatSize(file.fileSize) + "</td><td style='text-align: center;'>" + file.createTime + "</td><td style='text-align: center;'>" + deleteBtn + "</td></tr>";
                    $('#fileTable').append(tr);
                }
            }
        }
    });
    $('#knwlDocDialog').dialog({
        title: '编辑知识',
		width: 1000,
		height: 538,
        onClose: function () {
            // 清空表单和文件列表
            $('#cardName').val('');
            $('#validDate').val('');
            //$("#rdoOL1").check("option", "checked", true);
            $("#rdoOL").val("").trigger("change");
           // $("#rdoSL0").check("option", "checked", true);
            isCommentSB.changeStatus(true);
            isRateSB.changeStatus(true);
            $('#fileTable tr[id!=colTR]').remove();
			if (window.cardContentUM) {
				cardContentUM.destroy();
			}
			$("#cardEditTd").hide();
			$("#cardEditNoContent").show();
			$("#cardEditTd").html("<script type='text/plain' id='cardEditInfo' name='cardEditInfo' style='height:170px;white-space: normal;width:98%' ></script>");
			var toolbar = window.advancedToolbar;
			toolbar.autoHeightEnabled = false;
			UE.Editor.prototype.placeholder = function (justPlainText) {
				var _editor = this;
				_editor.addListener("focus", function () {
					/*var localHtml = _editor.getContent();
					if ($.trim(localHtml) === $.trim("<p>" + justPlainText + "</p>")) {
						_editor.setContent(" ");
					}*/
				});
				_editor.addListener("blur", function () {
					var localHtml = _editor.getContent();
					if (!localHtml) {
						$("#cardEditTd").hide();
						$("#cardEditNoContent").show();
						//_editor.setContent(justPlainText);
					}
				});
				_editor.ready(function () {
					_editor.fireEvent("blur");
				});
			};
			cardContentUM = UE.getEditor("cardEditInfo", toolbar);
			cardContentUM.placeholder("");
			AddBtnFunc(cardContentUM, "cardEditInfo", "", false, false, false);
        }
    });
    $('#knwlDocOkBtn').off('click').on('click', editKnwl);
    $('#knwlDocNoBtn').off('click').on('click', closeKnwlDialog);
    $('#knwlDocDialog .dlg-close').off('click.knwlDoc').on('click.knwlDoc', closeKnwlDialog);
    $('#window-mask').css('z-index', 1);
    // 上传文档
    $("#uploadDoc").upfile({
        sid: sid,
        appId: "com.actionsoft.apps.kms",
        groupValue: card.createUser,
        fileValue: cardUUID,
        numLimit: 0,
        sizeLimit: maxFileSize * 1024 * 1024,
        filesToFilter: [["*", "*"]],
        repositoryName: "-doc-",
        done: function (e, data) {
            isFileUpdated = true;
            // 增加一行
            if (data['result']['data']['result'] == 'ok') {
                $('#fileTable div.kms-no-file').parent().parent().remove();
                var fileName = decodeURIComponent(data['files'][0]['name']);
                var fileDownloadURL = data['result']['data']['data']['attrs']['fileDownloadURL'];
                var fileSize = data['result']['files']['size'];
                var fileVer = data['result']['data']['data']['attrs']['fileVer'];
                var createTime = data['result']['data']['data']['attrs']['createTime'];
                var fileSuffixIcon = data['result']['data']['data']['attrs']['fileSuffixIcon'];
                var createUsername = data['result']['data']['data']['attrs']['createUsername'];
                var fileId = data['result']['data']['data']['attrs']['fileId'];
                var fileCreateUserPhoto = data['result']['data']['data']['attrs']['fileCreateUserPhoto'];
                var fileCreateUser = data['result']['data']['data']['attrs']['fileCreateUser'];
                var tr = "<tr id='" + fileId + "TR'>";
                tr += "<td style='text-align:center;'>" + ($('#fileTable tr[id!=colTR]').length + 1) + "</td>";
                if (typeof browserPreview == 'string') {
                    browserPreview = $.grep(browserPreview.split(','), function (n, i) {// 浏览器直接预览，不调用onlinedoc
                        return n != '';
                    });
                }
                var fileType = fileName.lastIndexOf(".") > -1 ? fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length) : "";
                if ($.inArray(fileType, browserPreview) != -1) {// 浏览器直接预览，不使用onlinedoc
                    tr += "<td><div class='file_icon file-type-" + fileSuffixIcon + "'></div><div class='browse_file_name' title='" + fileName + "'><a href='javascript:' onclick='browserPreviewFun(\"" + tabId + "\",\"" + fileId + "\",\"" + encodeURIComponent(fileName) + "\",1,\"" + fileCreateUserPhoto + "\",\"" + fileCreateUser + "\");return false;'>" + fileName + "</a></div></td>";
                } else {
                    if (isOnlinedocAppActive) {
                        tr += "<td><div class='file_icon file-type-" + fileSuffixIcon + "'></div><div class='browse_file_name' title='" + fileName + "'><a href='javascript:' onclick='showFullScreenPanel(\"" + tabId + "\",\"" + canPreviewType + "\",\"" + fileId + "\",\"" + encodeURIComponent(fileName) + "\",\"" + encodeURIComponent(fileName) + "\",\"0\",\"1\"),\"" + fileCreateUserPhoto + "\",\"" + fileCreateUser + "\"'>" + fileName + "</a></div></td>";
                    } else {
                        tr += "<td><div class='file_icon file-type-" + fileSuffixIcon + "'></div><div class='browse_file_name' title='" + fileName + "'>" + fileName + "</div></td>";
                    }
                }
                var deleteBtn = '<a href="javascript:" onclick="deleteFile(\'' + fileId + '\');return false;"><span class="icon_delete_file"></span></a>';
                tr += "<td><a class='file_download' target='_blank' href='" + fileDownloadURL + "' ></a></td><td>" + fileVer + "</td><td class='browse_createuser'>" + createUsername + "</td><td>" + AWSFile.formatSize(fileSize) + "</td><td style='text-align: center;'>" + createTime + "</td><td style='text-align: center;'>" + deleteBtn + "</td></tr>";
                $('#fileTable').append(tr);
                $('#fileDiv').scrollTop($('#fileDiv').prop("scrollHeight")); // 滚动到最底端
            }
        },
        add: function (e, data) {
            var flag = true;
            // 判断大小
            var sizeLimit = maxFileSize * 1024 * 1024;
            if (data.originalFiles.length > 0) {
                $.each(data.originalFiles, function (index, file) {
                    if (file.size > 0) {
                        if (sizeLimit != 0 && sizeLimit < file.size) {
                            flag = false;
                            var _sizeLimitStr = AWSFile.formatSize(sizeLimit);
                            _sizeLimitStr = _sizeLimitStr.replace(".00", "");
                            $.simpleAlert(文件大小不允许超过 + _sizeLimitStr, "info");
                            return false;
                        }
                    } else {
                        flag = false;
                        $.simpleAlert(空文件不能上传, "info");
                        return false;
                    }
                });
            }
            // 判断后缀
            if (flag) {
                if (data.originalFiles.length > 0) {
                    $.each(data.originalFiles, function (index, file) {
                        var dotIndex = file.name.lastIndexOf(".");
                        var fileType = file.name.substring(dotIndex + 1, file.name.length);
                        var blackFileArr = blackFileList.split('@`@');
                        if ($.inArray(fileType, blackFileArr) !== -1) {
                            flag = false;
                            $.simpleAlert('后缀为' + fileType + '的文件不允许上传', "info");
                            return false;
                        }
                    });
                }
            }
            return flag;
        },
        complete: function (e, data) {
        }
    });
}
function editKnwl() {
    var cardName = $.trim($('#cardName').val());
    if (cardName == '') {
        $.simpleAlert('[知识名称]不允许为空', 'info');
        return false;
    } else {
        cardName = $('#cardName').val();
    }
    if (cardName.length > 2000) {
        $.simpleAlert('[知识名称]长度不能超过2000个字符', 'info');
        return false;
    }
    var onlineLevel = 0;
    /*if ($("#rdoOL0").prop("checked")) {
        onlineLevel = 0;
    } else if ($("#rdoOL1").prop("checked")) {
        onlineLevel = 1;
    } else if ($("#rdoOL2").prop("checked")) {
        onlineLevel = 2;
    }*/
	onlineLevel = $("#rdoOL").val();
	if (onlineLevel == '') {
		$.simpleAlert('[格式转换]不允许为空', 'info');
		return false;
	}
    var securityLevel = 0;
    if ($("#rdoSL0").prop("checked")) {
        securityLevel = 0;
    } else if ($("#rdoSL1").prop("checked")) {
        securityLevel = 1;
    } else if ($("#rdoSL2").prop("checked")) {
        securityLevel = 2;
    }
    awsui.ajax.request({
        url: "./jd",
        method: "POST",
		// loading: true,
        data: {
            sid: sid,
            cmd: "com.actionsoft.apps.kms_knwl_center_update_card",
            cardId: cardUUID,
            cardName: cardName,
            validDate: $('#validDate').val(),
            onlineLevel: onlineLevel,
            securityLevel: securityLevel,
            cardType: 0,
            isComment: $("#isCommentSB")[0].checked,
            isRate: $("#isRateSB")[0].checked,
			cardContext: UE.getEditor("cardEditInfo").getContent()
        },
        ok: function (responseObject) {
            try {
                $('#knwlDocDialog').dialog('close');
                //刷新知识tab
                $('#browseCardDialog button[name=reloadCard]').click();
            } catch (e) {
            }
        }
    });
    return false;
}
function closeKnwlDialog(event) {
    try {
        $('#knwlDocDialog').dialog('close');
        //如果改变了文件（上传或删除），刷新tab
        if (isFileUpdated) {
            $('#browseCardDialog button[name=reloadCard]').click();
            isFileUpdated = false;
        }
    } catch (e) {
    }
    return false;
}
function deleteFile(fileId) {
    $.confirm({
        title: "请确认",
        content: "确定要删除该文件吗？",
        onConfirm: function () {
            awsui.ajax.request({
                url: "./jd",
                method: "POST",
				// loading: true,
                data: {
                    sid: sid,
                    cmd: "com.actionsoft.apps.kms_knwl_center_delete_file",
                    cardId: cardUUID,
                    fileId: fileId
                },
                ok: function (responseObject) {
                    isFileUpdated = true;
                    $('#' + fileId + 'TR').remove();
                    // 重新计算序号
                    $('#fileTable tr[id!=colTR]').each(function (i) {
                        $(this).find('td:first').text(i + 1);
                    });
                }
            });
        }
    });
}
