/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   FormTable.js                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: anonymous <anonymous@student.42.fr>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2016/10/22 22:20:32 by Hakubox           #+#    #+#             */
/*   Updated: 2016/11/02 15:30:43 by anonymous        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/**
 工具函数
 * @type {Object}
 */
Tool = {
    //绑定
    Bind: function (obj, type, handler) {
        var node = typeof obj == "string" ? $(obj) : obj;
        if (node.addEventListener) {
            node.addEventListener(type, handler, false);
        } else if (node.attachEvent) {
            node.attachEvent('on' + type, handler);
        } else {
            node['on' + type] = handler;
        }
    },
    getColumnName: function (num) {
        if (num <= 25) {
            return String.fromCharCode(65 + num);
        } else {
            return String.fromCharCode(parseInt(64 + num / 26)) + String.fromCharCode(parseInt(65 + num % 26));
        }
    }
}

var Enum = {
    //单元格数据类型
    CellDataType: {
        None: 0,
        String: 1,
        Number: 2,
        Image: 3
    }
}

//单元格类
function FormTableCell(x, y, datatype) {
    this.X = x;
    this.Y = y;
    if (!datatype) this.DataType = 0;
}
//表格类
function FormTable(element) {
    var me = this;
    //定位元素
    me.Element = {
        Main: document.querySelector(element), //表格内容
        Content: document.querySelector(element + " .bar-chart-content"), //表格内容（包含行列
        Header: document.querySelector(element + " .bar-chart-header"), //上方列表头
        SideBar: document.querySelector(element + " .bar-chart-sidebar"), //左方行表头
        TopLeftCell: document.querySelector(element + " .bar-chart-lefttopcell"), //左上角的固定块
        Data: document.querySelector(element + " .bar-chart-data"), //表格内容区
        Horizontal: document.querySelector(element + " .bar-chart-scrollbar.horizontal"), //横向滚动条
        HorizontalRail: document.querySelector(element + " .bar-chart-scrollbar.horizontal .scrollbar-rail"), //横向滚动条轨道
        HorizontalBar: document.querySelector(element + " .bar-chart-scrollbar.horizontal .scrollbar-dragger"), //横向滚动条滑块
        Vertical: document.querySelector(element + " .bar-chart-scrollbar.vertical"), //纵向滚动条
        VerticalRail: document.querySelector(element + " .bar-chart-scrollbar.vertical .scrollbar-rail"), //纵向滚动条轨道
        VerticalBar: document.querySelector(element + " .bar-chart-scrollbar.vertical .scrollbar-dragger"), //纵向滚动条滑块
        VerticalBtnUp: document.querySelector(element + " .bar-chart-scrollbar.vertical .btn-prev"), //向上按钮
        VerticalBtnDown: document.querySelector(element + " .bar-chart-scrollbar.vertical .btn-next"), //向上按钮
        VerticalBtnLeft: document.querySelector(element + " .bar-chart-scrollbar.horizontal .btn-prev"), //向左按钮
        VerticalBtnRight: document.querySelector(element + " .bar-chart-scrollbar.horizontal .btn-next") //向右按钮
    };
    //表格数据
    me.Data = [];
    //单元格
    me.Cells = [];
    //行数据
    me.Rows = [];
    //列数据
    me.Columns = [];
    var _currentRow = 1;
    var _currentColumn = 1;
    //配置文件
    me.Config = {
        Cell: {
            AutoSize: true
        }
    };
    //活动区
    me.Region = {
        //页面行数（通过网页大小改变来重新赋值）
        PageRowCount: 0,
        //页面列数（通过网页大小改变来重新赋值）
        PageColumnCount: 0,
        //窗口高度
        WindowHeight: me.Element.Main.clientHeight - 22,
        //窗口宽度
        WindowWidth: me.Element.Main.clientWidth - 50,
        //高度
        Height: 0,
        //宽度
        Width: 0,
        //最大行数
        get RowCount() {
            return me.Data.length > me.Region.PageRowCount ? me.Data.length : me.Region.PageRowCount;
        },
        //最大列数
        get ColumnCount() {
            return me.Data[0].length > me.Region.PageColumnCount ? me.Data[0].length : me.Region.PageColumnCount;
        },
        //当前页面所在行
        get CurrentRow() {
            return _currentRow || 0;
        },
        set CurrentRow(value) {
            if (value < _currentRow) me.RemoveBlankRow();
            if (value <= 0) value = 0;
            else if (value >= me.Region.RowCount - me.Region.PageRowCount - 1) { value = me.Region.RowCount - me.Region.PageRowCount - 1;
                console.log(me.Region.RowCount, me.Region.PageRowCount);
            }
            _currentRow = parseInt(value);
            me.Element.VerticalBar.style.height = me.Region.VerticalRailLength * ((me.Region.PageRowCount + 1) / me.Region.RowCount) + "px";
            me.Element.VerticalBar.style.top = 16 + me.Region.VerticalRailLength * (_currentRow / me.Region.RowCount) + "px";
            me.RowRefreshEvent();
            me.RefreshEvent();
        },
        //当前页面所在列
        get CurrentColumn() {
            return _currentColumn || 0;
        },
        set CurrentColumn(value) {
            if (value < _currentColumn) me.RemoveBlankColumn();
            if (value <= 0) value = 0;
            else if (value >= me.Region.ColumnCount - me.Region.PageColumnCount - 1) { value = me.Region.ColumnCount - me.Region.PageColumnCount - 1;
                console.log(me.Region.ColumnCount, me.Region.PageColumnCount);
            }
            _currentColumn = parseInt(value);
            me.Element.HorizontalBar.style.width = me.Region.HorizontalRailLength * ((me.Region.PageColumnCount + 1) / me.Region.ColumnCount) + "px";
            me.Element.HorizontalBar.style.left = 16 + me.Region.HorizontalRailLength * (_currentColumn / me.Region.ColumnCount) + "px";
            me.ColumnRefreshEvent();
            me.RefreshEvent();
        },
        //横向滚动条滑块长度
        HorizontalRailLength: me.Element.HorizontalRail.clientWidth,
        //纵向滚动条滑块长度
        VerticalRailLength: me.Element.VerticalRail.clientHeight
    };
    //自动滚动功能
    me.Timer = {
        _isStart: false,
        set IsStart(value) {
            if (value) {
                var elementClassList = me.Element.Main.className.split(" ");
                if (elementClassList.indexOf("autoscroll") < 0) elementClassList.push("autoscroll");
                me.Element.Main.className = elementClassList.join(" ");
                me.Timer.Event = setInterval(function () {
                    if (me.Region.CurrentRow < me.Region.RowCount) me.Region.CurrentRow += me.Timer.ScrollLineNumber;
                    else me.Region.CurrentRow = 0;
                }, me.Timer.Time);
                this._isStart = true;
            } else {
                var elementClassList = me.Element.Main.className.split(" ");
                if (elementClassList.indexOf("autoscroll") >= 0) elementClassList.splice(elementClassList.indexOf("autoscroll"), 1);
                me.Element.Main.className = elementClassList.join(" ");
                if (me.Timer.Event) clearInterval(me.Timer.Event);
                this._isStart = false;
            }
        },
        ScrollLineNumber: 1,
        Time: 10000,
        Event: null
    }

    var _mouseTopDownScroll = false;
    var _isMouseDown = false;
    var _initMouseLocation = {
        x: 0,
        y: 0
    };
    var _oldLocation = 0;



    /**
     * 事件
     */

    //点击向上箭头
    Tool.Bind(this.Element.VerticalBtnUp, 'click', function (event) {
        me.Region.CurrentRow--;
    });
    //点击向下箭头
    Tool.Bind(this.Element.VerticalBtnDown, 'click', function (event) {
        me.Region.CurrentRow++;
    });
    //点击向左箭头
    Tool.Bind(this.Element.VerticalBtnLeft, 'click', function (event) {
        me.Region.CurrentColumn--;
    });
    //点击向右箭头
    Tool.Bind(this.Element.VerticalBtnRight, 'click', function (event) {
        me.Region.CurrentColumn++;
    });
    //点击纵向滚动条滑块（用于拖拽）
    Tool.Bind(this.Element.VerticalBar, 'mousedown', function (event) {
        _initMouseLocation = {
            x: event.clientX,
            y: event.clientY
        };
        _isMouseDown = true;
        _mouseTopDownScroll = true;
    });
    //点击纵向滚动条轨道（用于快速翻页）
    Tool.Bind(this.Element.VerticalRail, 'mousedown', function (event) {
        if (event.offsetY > parseInt(me.Element.VerticalBar.style.height) + parseInt(me.Element.HorizontalBar.style.top)) {
            me.Region.CurrentRow += me.Region.WindowHeight;
        } else if (event.offsetY < me.Region.CurrentRow) {
            me.Region.CurrentRow -= me.Region.WindowHeight;
        }
    });
    //点击横向滚动条滑块（用于拖拽）
    Tool.Bind(this.Element.HorizontalBar, 'mousedown', function (event) {
        _initMouseLocation = {
            x: event.clientX,
            y: event.clientY
        };
        _isMouseDown = true;
        _mouseTopDownScroll = false;
    });
    //点击横向滚动条轨道（用于快速翻页）
    Tool.Bind(this.Element.HorizontalRail, 'mousedown', function (event) {
        if (event.offsetX > parseInt(me.Element.HorizontalBar.style.width) + parseInt(me.Element.HorizontalBar.style.left)) {
            me.Region.CurrentColumn += me.Region.WindowWidth;
        } else if (event.offsetY < me.Region.CurrentColumn) {
            me.Region.CurrentColumn -= me.Region.WindowWidth;
        }
    });
    //放开滚动条
    Tool.Bind(document, 'mouseup', function (event) {
        _initMouseLocation = {
            x: 0,
            y: 0
        };
        _isMouseDown = false;
    });
    //拖拽滚动条
    Tool.Bind(document, 'mousemove', function (event) {
        if (_isMouseDown) {
            if (_mouseTopDownScroll) {
                var result = (event.clientY - _initMouseLocation.y) * ((me.Region.RowCount + me.Region.PageRowCount) / me.Region.WindowHeight);
                me.Region.CurrentRow += result;
                if (_oldLocation != me.Region.CurrentRow) _initMouseLocation.y = event.clientY;
                _oldLocation = me.Region.CurrentRow;
            } else {
                var result = (event.clientX - _initMouseLocation.x) * ((me.Region.ColumnCount + me.Region.PageColumnCount) / me.Region.WindowWidth);
                me.Region.CurrentColumn += result;
                if (_oldLocation != me.Region.CurrentColumn) _initMouseLocation.x = event.clientX;
                _oldLocation = me.Region.CurrentColumn;
            }
        }
    });
    //键盘上下左右
    Tool.Bind(document, 'keydown', function (event) {
        switch (event.keyCode) {
            case 33:
                me.Region.CurrentRow = 0;
                break;
            case 34:
                me.Region.CurrentRow = me.Rows.length - me.Region.PageRowCount;
                break;
            case 37:
                me.Region.CurrentColumn -= 1;
                break;
            case 38:
                me.RemoveBlankRow();
                me.Region.CurrentRow -= 1;
                break;
            case 39:
                if(me.Config.Cell.AutoSize && me.Region.CurrentColumn + me.Region.PageColumnCount >= me.Region.ColumnCount - 1) me.AddBlankColumn();
                me.Region.CurrentColumn += 1;
                break;
            case 40:
                if(me.Config.Cell.AutoSize && me.Region.CurrentRow + me.Region.PageRowCount >= me.Region.RowCount - 1) me.AddBlankRow();
                me.Region.CurrentRow += 1;
                break;
            default:
        }
    });
    //鼠标滚轮滚动事件
    Tool.Bind(me.Element.Main, 'mousewheel', function (event) {
        var e = event || window.event;
        if (e.wheelDeltaY == undefined && e.wheelDeltaX == undefined) {
            me.Region.CurrentRow -= (e.wheelDelta ? e.wheelDelta : e.detail) > 0 ? 3 : -3;
        } else {
            if (e.wheelDeltaY != 0) {
                me.Region.CurrentRow -= (e.wheelDelta ? e.wheelDelta : e.detail) > 0 ? 3 : -3;
            } else if (e.wheelDeltaX != 0) {
                me.Region.CurrentColumn -= (e.wheelDelta ? e.wheelDelta : e.detail) > 0 ? 3 : -3;
            }
        }
        if (document.all) window.event.returnValue = false;
        else event.preventDefault();
    });

    function InitEvents() {
        var cells = document.querySelectorAll(element + " .data-cell-content");
        //双击单元格（开始编辑）
        for (var i = 0; i < cells.length; i++) {
            Tool.Bind(cells[i], 'dblclick', function (event) {
                event.target.setAttribute("contenteditable", "plaintext-only");
            });
            Tool.Bind(cells[i], 'blur', function (event) {
                if(event.target.getAttribute("contenteditable") != null) {
                    event.target.removeAttribute("contenteditable");
                    
                }
            });
            Tool.Bind(cells[i], 'propertychange', function (event) {
                if(event.target.getAttribute("contenteditable") != null) {
                    
                }
            });
            Tool.Bind(cells[i], 'keydown', function (event) {
                if(event.target.getAttribute("contenteditable") != null) {
                }
            });
        }
    }
    

    /**
     * 方法
     */

    //初始化数据
    me.Init = function (data) {
        me.Region.PageRowCount = Math.round(me.Region.WindowHeight / 22) - (!!data.rows && data.rows.length > 0 ? 0 : 1);
        me.Region.PageColumnCount = Math.round(me.Region.WindowWidth / 50) - (!!data.columns && data.columns.length > 0 ? 0 : 1);
        //配置初始化
        if(data.Options.Cell.AutoSize != null) me.Config.Cell.AutoSize = data.Options.Cell.AutoSize;
        var maxWidth = me.Region.PageColumnCount > data.data[0].length ? me.Region.PageColumnCount : data.data[0].length;
        var maxHeight = me.Region.PageRowCount > data.data.length ? me.Region.PageRowCount : data.data.length;
        //填充单元格数据
        for (var i = 0; i <= maxHeight; i++) {
            me.Data[i] = [];
            if (me.Config.Cell.AutoSize) me.Rows[i] = {index: i, text: "" + (i+1)};
            else me.Rows[i] = data.rows[i];
            for (var o = 0; o <= maxWidth; o++) {
                //填充列表头数据
                if (i == 0) {
                    if (me.Config.Cell.AutoSize) me.Columns[o] = { index: o, text: Tool.getColumnName(o) };
                    else me.Columns[o] = data.columns[o];
                }
                me.Data[i][o] = { value: (data.data && data.data[i] && data.data[i][o]) || "", type: "aaa" };
            }
        }
        //填充行表头单元格
        var element_data = "";
        me.Cells = [];
        for (var i = 0; i <= me.Region.PageRowCount; i++) {
            me.Cells[i] = [];
            for (var o = 0; o < me.Region.PageColumnCount; o++) {
                me.Cells[i][o] = {};
            }
        }

        me.Element.Header.style.width = "100%";
        me.Element.Data.style.width = "100%";
        me.Element.Data.innerHTML = element_data;

        me.Region.CurrentRow = 0;
        me.Region.CurrentColumn = 0;

        InitEvents();
    };
    //表格刷新（移动或缩放）
    me.RefreshEvent = function () {
        var element_data = "";
        for (var i = me.Region.CurrentRow; i <= me.Region.CurrentRow + me.Region.PageRowCount && i < me.Rows.length || i - me.Region.CurrentRow <= me.Region.PageRowCount; i++) {
            element_data += '<div class="data-row">';
            for (var o = me.Region.CurrentColumn; o <= me.Region.CurrentColumn + me.Region.PageColumnCount && o < me.Columns.length || o - me.Region.CurrentColumn <= me.Region.PageColumnCount; o++) {
                me.Cells[i] = { element: "" };
                element_data += '<div class="data-cell">';
                try {
                    element_data += '<div class="data-cell-content" x="' + i + '" y="' + o + '">' + (!me.Data[i][o] ? "" : me.Data[i][o].value) + '</div>';
                } catch (a) {
                    debugger;
                }
                element_data += '</div>';
            }
            element_data += '</div>';
        }
        me.Element.Data.innerHTML = element_data;
    };
    //行表头刷新
    me.RowRefreshEvent = function () {
        var element_sidebar = "";
        if(me.Config.Cell.AutoSize) {
            for (var i = me.Region.CurrentRow; i <= me.Region.CurrentRow + me.Region.PageRowCount; i++) {
                element_sidebar += '<div class="sidebar-row program">' + (i+1) + '<div class="shade"></div></div>';
            }
        } else {
            for (var i = me.Region.CurrentRow; i <= me.Region.CurrentRow + me.Region.PageRowCount; i++) {
                element_sidebar += '<div class="sidebar-row program">' + (me.Rows[i] ? me.Rows[i].text : '') + '<div class="shade"></div></div>';
            }
        }
        me.Element.SideBar.innerHTML = element_sidebar;
    };
    //列表头刷新
    me.ColumnRefreshEvent = function () {
        var element_column = "";
        if(me.Config.Cell.AutoSize) {
            for (var i = me.Region.CurrentColumn; i < me.Region.CurrentColumn + me.Region.PageColumnCount; i++) {
                element_column += '<div class="header-row-cell month">' + Tool.getColumnName(i) + '<div class="shade"></div></div>';
            }
        } else {
            for (var i = me.Region.CurrentColumn; i < me.Region.CurrentColumn + me.Region.PageColumnCount; i++) {
                element_column += '<div class="header-row-cell month">' + (me.Columns[i] ? me.Columns[i].text : '·') + '<div class="shade"></div></div>';
            }
        }
        document.querySelectorAll(element + " .bar-chart-header > .header-row")[0].innerHTML = element_column;
    };
    //自动滚屏
    me.AutoScroll = function (checked, time, linenumber) {
        if (checked === undefined) checked = true;
        if (time !== undefined) me.Timer.Time = time;
        if (linenumber !== undefined) me.Timer.ScrollLineNumber = linenumber;
        me.Timer.IsStart = checked;
    };
    //新增行
    me.AddBlankRow = function () {
        var arr = [];
        for (var o = me.Region.ColumnCount - 1; o >= 0; o--) {
            arr[o] = "";
        }
        me.Data.push(arr);
    };
    //新增列
    me.AddBlankColumn = function () {
        var maxColumn = me.Region.ColumnCount;
        for (var i = 0; i < me.Region.RowCount; i++) {
            me.Data[i][maxColumn] = "";
        }
    };
    //判断下方所有行是否有空行，有则直接移除空行
    me.RemoveBlankRow = function () {
        var isBlank = true;
        for (var i = me.Region.RowCount - 1; i >= me.Region.CurrentRow + me.Region.PageRowCount; i--) {
            isBlank = true;
            for (var o = me.Region.ColumnCount - 1; o >= 0; o--) {
                if(!!me.Data[i][o] || me.Data[i][o] === 0) {
                    isBlank = false;
                    return;
                }
            }
            if(isBlank) {
                me.Data.splice(i, 1);
            }
        }
    };
    //判断右侧所有行是否有空列，有则直接移除空列
    me.RemoveBlankColumn = function () {
        var isBlank = true;
        for (var i = me.Region.ColumnCount - 1; i >= me.Region.CurrentColumn + me.Region.PageColumnCount; i--) {
            for (var o = me.Region.RowCount - 1; o >= 0; o--) {
                if(!!me.Data[o][i] || me.Data[o][i] === 0) {
                    isBlank = false;
                    return;
                }
            }
            if(isBlank) {
                for (var o = me.Region.RowCount - 1; o >= 0; o--) {
                    me.Data[o].splice(i, 1);
                }
            }
        }
    };
}
