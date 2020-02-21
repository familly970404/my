/*
 * 该代码已经作废，仅被压缩使用在aws.userinput.js，livesearch.js中，该js没有被直接引用的地方，留作备份以便混淆用
 * 
 * jQuery verson 1.10.2
 * AWS UI Combobox
 * author chengy
 * 2013年10月23日19:13:42
 * 
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function($, undefined) {

	// used to prevent race conditions with remote data sources
	var requestIndex = 0;

	$.widget("awsui.combobox_old", {
		version : "1.10.3",
		defaultElement : "<input>",
		options : {
			renderTo : null,
			target : null,
			autoFocus : true,
			hiddenName : null,
			delay : 300,
			minLength : 0,
			trigger : true,
			triggerClass : "awsui-combobox-trigger",
			triggerOpenClass : "awsui-combobox-trigger-open",
			source : null,
			disabled : false,
			editable : true,
			multiple : false,
			multipleCheck : "awsui-combobox-item-check",
			multipleUnCheck : "awsui-combobox-item-uncheck",
			seperator : ",",
			valueField : "value",
			displayField : "label",

			// callbacks
			change : null,
			close : null,
			focus : null,
			open : null,
			response : null,
			search : null,
			select : null
		},

		pending : 0,

		_initTrigger : function() {
			if (this.options.trigger !== false) {
				var input = this.element, self = this;
				this.wrapper = this.element.wrap("<span class='awsui-combobox-wrap'></span>").parent();
				this.trigger = $('<a href="javaScript:void"  class="' + this.options.triggerClass + '"> </a>').appendTo(this.wrapper).click(function() {
					self._triggerClick();
				});
				var tw = this.trigger.outerWidth(true);
				input.css({
					// 21是trigger padding，4是ux对齐的右内边距
					width : input.width() - tw + 4
				});
				// 防止内容遮盖
				input.css({
					'padding-right' : tw
				});
				if (this.options.triggerOpenClass != null) {
					var self = this;
					this.element.on("comboboxopen", function() {
						if (self.trigger != null) {
							self.trigger.addClass(self.options.triggerOpenClass);
						}
					});
				}
			}
		},
		widget : function() {
			return this.wrapper || this.element;
		},
		// menu impl start-------------------------------------------------------------------
		_isExpanded : function() {
			return this.list.is(":visible");
		},
		_scrollIntoView : function(item) {
			var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight;
			if (this.list.outerHeight() < this.list.prop("scrollHeight")) {
				borderTop = parseFloat($.css(this.list[0], "borderTopWidth")) || 0;
				paddingTop = parseFloat($.css(this.list[0], "paddingTop")) || 0;
				offset = item.offset().top - this.list.offset().top - borderTop - paddingTop;
				scroll = this.list.scrollTop();
				elementHeight = this.list.height();
				itemHeight = item.height();

				if (offset < 0) {
					this.list.scrollTop(scroll + offset);
				} else if (offset + itemHeight > elementHeight) {
					this.list.scrollTop(scroll + offset - elementHeight + itemHeight);
				}
			}

		},
		_initList : function() {
			var t = this.element;
			this.list = $("<ul id='" + t.attr("id") + "_menu" + "'>").addClass("awsui-menu").appendTo(this.__renderTo());
			if (this.options.triggerOpenClass != null) {
				var self = this;
				this.list.on("close", function() {
					if (self.trigger != null) {
						self.trigger.removeClass(self.options.triggerOpenClass);
					}
				});
			}

			this._on(this.element, {
				keyup : function(event) {
					if (this.element.prop("readOnly")) {
						return;
					}
					var keyCode = $.ui.keyCode;
					switch (event.keyCode) {
					case keyCode.UP:
						// 1.未打开执行搜索；2.如果已经选中第一个返回；3.选择最后一个或者当前的上一个
						//						if (!this._isExpanded()) {
						//							this.search(null, event);
						//							if (this.options.autoFocus) {
						//								this._menuselect($("li:last", this.list));
						//							}
						//						} else {
						//							if ($("li:first", this.list)[0] === $("li.active", this.list)[0]) {
						//								return;
						//							}
						//							if ($("li.active", this.list).length == 0) {
						//								this._menuselect($("li:last", this.list));
						//							} else {
						//								this._menuselect($("li.active", this.list).prev());
						//							}
						//						}
						break;
					case keyCode.DOWN:
						// 1.未打开执行搜索；2.如果已经选中最后一个返回；3.选择第一个或者当前的下一个
						//						if (!this._isExpanded()) {
						//							this.search(null, event);
						//							this._menuselect($("li:first", this.list));
						//						} else {
						//							if ($("li:last", this.list)[0] === $("li.active", this.list)[0]) {
						//								return;
						//							}
						//							if ($("li.active", this.list).length == 0) {
						//								this._menuselect($("li:first", this.list));
						//							} else {
						//								this._menuselect($("li.active", this.list).next());
						//							}
						//						}
						break;
					case keyCode.ENTER:
					case keyCode.NUMPAD_ENTER:
						//					var active=$("li.active",this.list);
						//					if(this._isExpanded() && active.length==1){
						//						event.preventDefault();
						//						var item=active.data("awsui-combobox-item");
						//						this._select(active, item);
						//					}
						if (this.element.val() != '') {
							var itemData = {
								iconCls : "awsui-combobox-item-check",
								label : $.trim(this.element.val()),
								text : $.trim(this.element.val()),
								value : $.trim(this.element.val())
							};
							//如果不存在的话则添加
							//							if (this.options.value) {
							//								var valueArr = this.options.value.split(this.options.seperator);
							//								if (valueArr.length < 10) {
							//									if ($.inArray(this.element.val(), valueArr) == -1) {
							//										this._addItemValue(itemData);
							//									}
							//								}
							//							} else {
							//								this._addItemValue(itemData);
							//							}
							//如果不存在的话则添加
							var valueSpans = $('#usersuper span[class=awsui-supertext-item]');
							if (valueSpans.length < 10) {
								var isExistValue = false;
								for (var i = 0; i < valueSpans.length; i++) {
									var thisValue = $.trim(this.element.val());
									if (thisValue == $(valueSpans[i]).text()) {
										isExistValue = true;
										break;
									}
								}
								if (!isExistValue) {
									this._addItemValue(itemData);
								}
							}
							this.element.val('');
						}
						break;
					case keyCode.ESCAPE:
						//						if (this._isExpanded()) {
						//							this.close(event);
						//							event.preventDefault();
						//						}
						break;
					default:
						// search timeout should be triggered before the input value is changed
						//						clearTimeout(this.searching);
						//						this.searching = this._delay(function() {
						//							// only search if the value has changed
						//							if (this.lastQuery !== this._value()) {
						//								this.selectedItem = null;
						//								this.search(null, event);
						//							}
						//						}, this.options.delay);
						break;
					}
				}
			});
		},
		_menuselect : function(item) {
			$("li.active", this.list).removeClass("active");
			item.addClass("active");
			this._scrollIntoView(item);
		},
		/**
		 * 根据搜索结果重新初始化下拉列表
		 * 
		 * @param items
		 *            数据源
		 * 
		 */
		_reList : function(items) {
			var self = this;
			var f = function(event) {
				self._select($(this), event.data);
			};
			var value = this._value();
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				item.text = item[this.options.displayField];
				if (this.options.multiple) {
					item.iconCls = this.options.multipleUnCheck;
					if (this._isChecked(item[this.options.valueField])) {
						item.iconCls = this.options.multipleCheck;
					}
				}
				item.method = f;
			}
			var t = this.options.target != null ? this.options.target : this.element;
			this.list.menu({
				target : t,
				items : items
			});
			if (this.options.autoFocus) {
				this._menuselect($("li:first", this.list));
			}
		},
		// menu impl end-------------------------------------------------------------------

		_initState : function() {
			if (this.options.editable === false) {
				this._setOption("editable", false);
			}
			if (this.options.disabled === true) {
				this.disable();
			}
		},

		_initSize : function() {
			var ul = this.list;
			if (this.options.listHeight != null) {
				ul.css({
					'max-height' : this.options.listHeight,
					'overflow-y' : 'auto',
					'overflow-x' : 'hidden'
				});
			}

			if (this.options.width != null) {
				this.element.css({
					width : width
				});
			}
			var width = this.options.target != null ? this.options.target.outerWidth() : this.element.outerWidth();
			var tw = this.options.listWidth != null ? this.options.listWidth : width;
			ul.outerWidth(tw);
		},
		_create : function() {
			this.element.addClass("awsui-combobox-input").attr("autocomplete", "off");
			if (this.options.hiddenName != null) {
				this.hiddenField = $("<input type='hidden' id='" + this.options.hiddenName + "' name='" + this.options.hiddenName + "'>").insertBefore(
						this.element);
				if (this.element.attr("name") == this.options.hiddenName) {
					this.element.removeAttr("name");
				}
			}
			this._initTrigger();
			this._initList();
			this._initSize();
			this._initSource();
			this._initData();
			this._initState();

			// turning off autocomplete prevents the browser from remembering the
			// value when navigating through history, so we re-enable autocomplete
			// if the page is unloaded before the widget is destroyed. #7790
			this._on(this.window, {
				beforeunload : function() {
					this.element.removeAttr("autocomplete");
				}
			});
		},
		_initData : function() {
			if (this.options.value == null) {
				if (this.options.initData != null && $.isArray(this.options.initData)) {
					var self = this;
					$.each(this.options.initData, function(index, item) {
						self._addItemValue(self._normItem(item));
					});
				}
			}
		},
		_destroy : function() {
			clearTimeout(this.searching);
			this.element.removeClass("awsui-combobox-input").removeAttr("autocomplete");
			this.list.element.remove();
			if (this.trigger) {
				this.trigger.remove();
			}
			if (this.hiddenField) {
				this.hiddenField.remove();
			}
		},

		_setOption : function(key, value) {
			this._super(key, value);
			if (key === "source") {
				this._initSource();
			}
			if (key === "appendTo") {
				this.list.appendTo(this.__renderTo());
			}

			if (key === "editable") {
				this.element.prop('readOnly', !value);
				if (value === false) {
					var self = this;
					this.element.on("mousedown", function(e) {
						// 防止menu隐藏
						if (!self._isExpanded()) {
							e.stopPropagation();
							self._triggerClick();
						}
					});
				}
			}

			if (key === "disabled") {
				this.element.prop('disabled', value);
				if (value && this.xhr) {
					this.xhr.abort();
				}
			}
		},
		_triggerClick : function() {
			this.element.focus();
			// Close if already visible
			if (this._isExpanded()) {
				return;
			}

			// Pass empty string as value to search for, displaying all results
			this.search("", null);
		},
		_select : function(item, data) {
			var self = this;
			var rr = this._trigger("select", null, {
				item : item,
				data : data,
				value : data[self.options.valueField],
				oldVal : this._value()
			});
			if (rr !== false) {
				if (this.options.multiple === true) {
					var v = this._value();
					var nowCheck = item.find(".icon").hasClass(this.options.multipleCheck);
					if (nowCheck) {
						this._deleteItemValue(data);
						item.find(".icon").removeClass(this.options.multipleCheck).addClass(this.options.multipleUnCheck);
					} else {
						this._addItemValue(data);
						item.find(".icon").removeClass(this.options.multipleUnCheck).addClass(this.options.multipleCheck);
					}
				} else {
					this._addItemValue(data);
				}

				this._trigger("selected", null, {
					item : item,
					data : data,
					value : self._value()
				});
			}
			if (this.options.multiple !== true) {
				this._close();
			}
		},
		_addItemValue : function(data) {
			var v = data[this.options.valueField];
			var label = data[this.options.displayField];
			if (this.options.multiple === true) {
				label = this._value().length > 0 ? this._value() + this.options.seperator + data[this.options.displayField] : data[this.options.displayField];
				v = this.option("value") != null && this.option("value").length > 0 ? this.option("value") + this.options.seperator
						+ data[this.options.valueField] : data[this.options.valueField];
			}
			this._setvalue(v);
			this._value(label);
		},
		_deleteItemValue : function(data) {
			var vts = this.value().split(this.options.seperator);
			var lts = this._value().split(this.options.seperator);
			for (var i = 0; i < vts.length; i++) {
				if (vts[i] == data[this.options.valueField]) {
					vts.splice(i, 1);
					lts.splice(i, 1);
				}
			}
			this._setvalue(vts.join(this.options.seperator));
			this._value(lts.join(this.options.seperator));
		},
		_setvalue : function(v) {
			this.option("value", v);
			if (this.hiddenField) {
				this.hiddenField.val(v);
			}
		},
		value : function() {
			return this.option("value") == null ? "" : this.option("value");
		},
		_initSource : function() {
			var array, url, that = this;
			if ($.isArray(this.options.source)) {
				array = this.options.source;
				this.source = function(request, response) {
					response(that._filter(array, request.term));
				};
			} else if (typeof this.options.source === "string") {
				url = this.options.source;
				this.source = function(request, response) {
					if (that.xhr) {
						that.xhr.abort();
					}
					that.xhr = $.ajax({
						url : url,
						dataType : "json",
						data : request,
						success : function(data) {
							if ($.isArray(data)) {
								response(data);
							} else {
							}
						},
						error : function() {
							response([]);
						}
					});
				};
			} else {
				this.source = this.options.source;
			}
		},

		search : function(value, event) {
			value = value != null ? value : this._value();

			// always save the actual value, not the one passed as an argument
			this.lastQuery = this._value();

			if (value.length < this.options.minLength) {
				return this.close(event);
			}

			var q = {
				term : value
			};
			if (this._trigger("search", event, q) === false) {
				return;
			}

			this.pending++;
			this.element.addClass("ui-autocomplete-loading");
			this.cancelSearch = false;

			this.source(q, this._query());
		},

		_query : function() {
			var that = this, index = ++requestIndex;

			return function(content) {
				if (index === requestIndex) {
					that._process(content);
				}

				that.pending--;
				if (!that.pending) {
					that.element.removeClass("ui-autocomplete-loading");
				}
			};
		},
		_isChecked : function(v) {
			var value = this.value();
			return value != "" && (this.options.seperator + value + this.options.seperator).indexOf(this.options.seperator + v + this.options.seperator) != -1;
		},
		_process : function(content) {
			if (content) {
				content = this._normalize(content);
			}
			this._trigger("response", null, {
				content : content
			});
			if (!this.options.disabled && content && content.length && !this.cancelSearch) {
				this._reList(content);
				this._trigger("open");
			} else {
				// use ._close() instead of .close() so we don't cancel future searches
				this._close();
			}
		},

		close : function(event) {
			this.cancelSearch = true;
			this._close(event);
		},

		_close : function(event) {
			this.list.menu("close");
		},
		_normItem : function(item) {
			if (typeof item === "string") {
				return {
					label : item,
					value : item
				};
			}
			return $.extend({
				label : item[this.options.displayField] || item[this.options.valueField],
				value : item[this.options.valueField] || item[this.options.displayField]
			}, item);
		},
		_normalize : function(items) {
			if (items == null && items == "") {
				items = [];
			}
			// assume all items have the right format when the first item is complete
			if (items.length && items[0][this.options.displayField] && items[0][this.options.valueField]) {
				return items;
			}
			return $.map(items, this._normItem);
		},

		_value : function() {
			var nodeName = this.element[0].nodeName.toLowerCase(), isTextarea = nodeName === "textarea", isInput = nodeName === "input";
			var valueMethod = this.element[isTextarea || isInput ? "val" : "text"];
			return valueMethod.apply(this.element, arguments);
		},
		_escapeRegex : function(value) {
			return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
		},
		_filter : function(array, term) {
			var matcher = new RegExp(this._escapeRegex(term), "i");
			var self = this;
			return $.grep(array, function(value) {
				return matcher.test(value[self.options.displayField] || value[self.options.valueField] || value);
			});
		},

		/**
		 * Menu渲染位置
		 * 
		 */
		__renderTo : function() {
			var element = this.options.appendTo;
			if (element) {
				element = element.jquery || element.nodeType ? $(element) : this.document.find(element).eq(0);
			}
			if (!element) {
				element = this.element.closest(".ui-front");
			}
			if (!element.length) {
				element = this.document[0].body;
			}
			return element;
		}
	});

}(jQuery));

/*!
 * 
 * AWS UI UserInput主函数
 * jQuery verson 1.10.2
 * 
 */
(function($) {
	$.widget("awsui.userinputkms", $.awsui.combobox_old, {
		options : {
			trigger : false
		},
		_initData : function() {
			//div上添加overflow防止换行后问题 hel
			this.box = $("<div style='overflow:auto;'></div>").prependTo(this.options.superbox);
			$.awsui.combobox_old.prototype._initData.call(this);
			if (this.options.disabled) {
				this.box.find(".close").hide();
			}
		},
		_setOption : function(key, value) {
			this._super(key, value);
			if (this.box && key === "disabled") {
				this.box.find(".close")[value ? "hide" : "show"]();
				this.options.superbox[value ? "addClass" : "removeClass"]("disable");
			}
		},
		_addItemValue : function(data) {
			var notfindClass = "";
			if (data.notfind) {
				notfindClass = "notfind";
			}
			var html = $(
					"<span class='awsui-supertext-items " + notfindClass + "'><span class='awsui-supertext-item'>" + data[this.options.displayField]
							+ "</span><span class='forms-icon down close'></span></span>").appendTo(this.box);
			html.data("awsui-supertext-items-data", data);
			var self = this;
			html.find(".close").on("click", function() {
				$(this).parent().fadeOut(function() {
					self.__r($(this));
				});
			});
			self._setvalue(self._getvalue());
			self._trigger("add", null, {
				label : data[this.options.displayField],
				v : data.value
			});
			// 选择item后，重新设置menu位置
			// by wsz of 2015-01-27
			var _input = this.element;
			var _menu = $('#' + _input.attr('id') + '_menu');
			_menu.css({
				left : this.options.target.offset().left,
				top : this.options.target.offset().top + this.options.target.outerHeight(true)
			});
			if (this.options.callback != null) {
				this.options.callback();
			}
		},
		__r : function(jq) {
			var d = jq.data("awsui-supertext-items-data");
			jq.remove();
			this._setvalue(this._getvalue());
			this._trigger("del", null, {
				label : d[this.options.displayField],
				v : d.value
			});
		},
		_deleteItemValue : function(data) {
			var self = this;
			$.each(this.box.find(".awsui-supertext-items"), function() {
				if (data.value == $(this).data("awsui-supertext-items-data")[self.options.valueField]) {
					$(this).fadeOut(function() {
						self.__r($(this));
					});
				}
			});
			// 选择item后，重新设置menu位置
			// by wsz of 2015-01-27
			var _input = this.element;
			var _menu = $('#' + _input.attr('id') + '_menu');
			_menu.css({
				left : this.options.target.offset().left,
				top : this.options.target.offset().top + this.options.target.outerHeight(true)
			});
		},
		_isChecked : function(v) {
			var c = false;
			var self = this;
			$.each(this.box.find(".awsui-supertext-items"), function() {
				if (v == $(this).data("awsui-supertext-items-data")[self.options.valueField]) {
					c = true;
					return false;
				}
			});
			return c;
		},
		_getvalue : function() {
			var v = "";
			var self = this;
			$.each(this.box.find(".awsui-supertext-items"), function() {
				if (v != "") {
					v += self.options.seperator;
				}
				v += $(this).data("awsui-supertext-items-data")[self.options.valueField];
			});
			return v;
		},
		_destroy : function() {
			$.awsui.combobox_old.prototype._destroy.call(this);
			this.box.remove();
		}
	});
})(jQuery);