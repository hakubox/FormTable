var program = [{
    name: "项目A",
    data: [{
        date: {
            year: 2016,
            month: 1,
            day: 3
        },
        text: "SCR",
        style: "yellow",
        url: "http://www.baidu.com"
    }, {
        date: {
            year: 2016,
            month: 1,
            day: 8
        },
        text: "SCR",
        style: "red",
        url: "http://www.hao123.com"
    }, {
        date: {
            year: 2016,
            month: 1,
            day: 8
        },
        text: "SC,SCR",
        style: "green"
    }, ]
}, {
    name: "项目B"
}, {
    name: "项目C1"
}, {
    name: "项目C2"
}, {
    name: "项目C3"
}, {
    name: "项目C4"
}, {
    name: "项目C5"
}, {
    name: "项目C6"
}, {
    name: "项目C7"
}, {
    name: "项目C8"
}, {
    name: "项目C9"
}, {
    name: "项目C10"
}, {
    name: "项目C11"
}, {
    name: "项目C12"
}, {
    name: "项目C13"
}, {
    name: "项目C14"
}, {
    name: "项目C15"
}, {
    name: "项目C16"
}, {
    name: "项目C17"
}, {
    name: "项目C18"
}, {
    name: "项目C19"
}, {
    name: "项目C20"
}, {
    name: "项目C"
}, {
    name: "项目C"
}, {
    name: "项目C"
}, {
    name: "项目C"
}, {
    name: "项目C"
}, {
    name: "项目C"
}, {
    name: "项目C"
}, {
    name: "项目C"
}, {
    name: "项目C"
}, {
    name: "项目C"
}, {
    name: "项目C"
}, {
    name: "项目C"
}];
/**
 * 工具函数
 * @type {Object}
 */
Tool = {
        //绑定
        Bind: function(obj, type, handler) {
            var node = typeof obj == "string" ? $(obj) : obj;
            if (node.addEventListener) {
                node.addEventListener(type, handler, false);
            } else if (node.attachEvent) {
                node.attachEvent('on' + type, handler);
            } else {
                node['on' + type] = handler;
            }
        }
    }
//看板类
function BarChart(element, startDate, endDate) {
    var me = this;
    this.Element = document.querySelector(element);
    this.ContentElement = document.querySelector(element + " .bar-chart-content");
    this.HeaderElement = document.querySelector(element + " .bar-chart-header");
    this.SideBarElement = document.querySelector(element + " .bar-chart-sidebar");
    this.TopLeftCellElement = document.querySelector(element + " .bar-chart-lefttopcell");
    this.DataElement = document.querySelector(element + " .bar-chart-data");
    /**
     * 横向滚动条
     */
    this.HorizontalElement = document.querySelector(element + " .bar-chart-scrollbar.horizontal");
    //横向滚动条轨道
    this.HorizontalElementRail = document.querySelector(element + " .bar-chart-scrollbar.horizontal .scrollbar-rail");
    //横向滚动条滑块
    this.HorizontalElementBar = document.querySelector(element + " .bar-chart-scrollbar.horizontal .scrollbar-dragger");
    //纵向滚动条
    this.VerticalElement = document.querySelector(element + " .bar-chart-scrollbar.vertical");
    //纵向滚动条轨道
    this.VerticalElementRail = document.querySelector(element + " .bar-chart-scrollbar.vertical .scrollbar-rail");
    //纵向滚动条滑块
    this.VerticalElementBar = document.querySelector(element + " .bar-chart-scrollbar.vertical .scrollbar-dragger");
    //向上按钮
    this.VerticalElementBtnUp = document.querySelector(element + " .bar-chart-scrollbar.vertical .btn-prev");
    //向上按钮
    this.VerticalElementBtnDown = document.querySelector(element + " .bar-chart-scrollbar.vertical .btn-next");
    //向左按钮
    this.VerticalElementBtnLeft = document.querySelector(element + " .bar-chart-scrollbar.horizontal .btn-prev");
    //向右按钮
    this.VerticalElementBtnRight = document.querySelector(element + " .bar-chart-scrollbar.horizontal .btn-next");
    this.ProgramCount = 0;
    this.DayCount = 0;
    //活动区
    this.Region = {
        //窗口高度
        WindowHeight: me.Element.clientHeight - 44,
        //窗口宽度
        WindowWidth: me.Element.clientWidth - 150,
        //高度
        Height: 0,
        //宽度
        Width: 0,
        //距离上方距离
        _top: 0,
        get Top() {
            return this._top || 0;
        },
        set Top(value) {
            if (value > me.ProgramCount * 22 - me.Region.WindowHeight) value = me.ProgramCount * 22 - me.Region.WindowHeight;
            else if (value <= 0) value = 0;
            me.ContentElement.scrollTop = value;
            me.HeaderElement.style.top = value + "px";
            me.TopLeftCellElement.style.top = value + "px";
            this._top = value;
            me.VerticalElementBar.style.height = me.Region.VerticalRailLength * (me.Region.WindowHeight / me.Region.Height) + "px";
            me.VerticalElementBar.style.top = 16 + me.Region.VerticalRailLength * (value / me.Region.Height) + "px";
        },
        //距离左方距离
        _left: 0,
        get Left() {
            return this._left || 0;
        },
        set Left(value) {
            if (value > me.DayCount * 50 - me.Region.WindowWidth) value = me.DayCount * 50 - me.Region.WindowWidth;
            else if (value <= 0) value = 0;
            me.ContentElement.scrollLeft = value;
            me.SideBarElement.style.left = value + "px";
            me.TopLeftCellElement.style.left = value + "px";
            this._left = value;
            me.HorizontalElementBar.style.width = me.Region.HorizontalRailLength * (me.Region.WindowWidth / me.Region.Width) + "px";
            me.HorizontalElementBar.style.left = 16 + me.Region.HorizontalRailLength * (value / me.Region.Width) + "px";
        },
        //横向滚动条滑块长度
        HorizontalRailLength: me.HorizontalElementRail.clientWidth,
        //纵向滚动条滑块长度
        VerticalRailLength: me.VerticalElementRail.clientHeight
    };
    //滚动对象
    this.Timer = {
        _isStart: false,
        set IsStart(value) {
            if (value) {
                var elementClassList = me.Element.className.split(" ");
                if (elementClassList.indexOf("autoscroll") < 0) elementClassList.push("autoscroll");
                me.Element.className = elementClassList.join(" ");
                me.Timer.Event = setInterval(function() {
                    if (me.Region.Top < me.ProgramCount * 22 - me.Region.WindowHeight) me.Region.Top += me.Timer.ScrollLineNumber * 22;
                    else me.Region.Top = 0;
                }, me.Timer.Time);
                this._isStart = true;
            } else {
                var elementClassList = me.Element.className.split(" ");
                if (elementClassList.indexOf("autoscroll") >= 0) elementClassList.splice(elementClassList.indexOf("autoscroll"), 1);
                me.Element.className = elementClassList.join(" ");
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

    //点击向上箭头
    Tool.Bind(this.VerticalElementBtnUp, 'click', function(event) {
        me.Region.Top -= 22;
    });
    //点击向下箭头
    Tool.Bind(this.VerticalElementBtnDown, 'click', function(event) {
        me.Region.Top += +22;
    });
    //点击向左箭头
    Tool.Bind(this.VerticalElementBtnLeft, 'click', function(event) {
        me.Region.Left -= 50;
    });
    //点击向右箭头
    Tool.Bind(this.VerticalElementBtnRight, 'click', function(event) {
        me.Region.Left += 50;
    });
    //点击纵向滚动条滑块（用于拖拽）
    Tool.Bind(this.VerticalElementBar, 'mousedown', function(event) {
        _initMouseLocation = {
            x: event.clientX,
            y: event.clientY
        };
        _isMouseDown = true;
        _mouseTopDownScroll = true;
    });
    //点击纵向滚动条轨道（用于快速翻页）
    Tool.Bind(this.VerticalElementRail, 'mousedown', function(event) {
        if (event.offsetY > parseInt(me.VerticalElementBar.style.height) + parseInt(me.HorizontalElementBar.style.top)) {
            me.Region.Top += me.Region.WindowHeight;
        } else if (event.offsetY < me.Region.Top) {
            me.Region.Top -= me.Region.WindowHeight;
        }
    });
    //点击横向滚动条滑块（用于拖拽）
    Tool.Bind(this.HorizontalElementBar, 'mousedown', function(event) {
        _initMouseLocation = {
            x: event.clientX,
            y: event.clientY
        };
        _isMouseDown = true;
        _mouseTopDownScroll = false;
    });
    //点击横向滚动条轨道（用于快速翻页）
    Tool.Bind(this.HorizontalElementRail, 'mousedown', function(event) {
        if (event.offsetX > parseInt(me.HorizontalElementBar.style.width) + parseInt(me.HorizontalElementBar.style.left)) {
            me.Region.Left += me.Region.WindowWidth;
        } else if (event.offsetY < me.Region.Left) {
            me.Region.Left -= me.Region.WindowWidth;
        }
    });
    //放开滚动条
    Tool.Bind(document, 'mouseup', function(event) {
        _initMouseLocation = {
            x: 0,
            y: 0
        };
        _isMouseDown = false;
    });
    //拖拽滚动条
    Tool.Bind(document, 'mousemove', function(event) {
        if (_isMouseDown) {
            if (_mouseTopDownScroll) {
                var result = (event.clientY - _initMouseLocation.y);
                if (result > 0) me.Region.Top += result % 22 < 11 ? result - result % 22 : result - result % 22 + 22;
                else me.Region.Top += result % 22 > -11 ? result - result % 22 : result - result % 22 - 22;
                if (_oldLocation != me.Region.Top) _initMouseLocation.y = event.clientY;
                _oldLocation = me.Region.Top;
            } else {
                var result = (event.clientX - _initMouseLocation.x) * ((me.Region.Width - me.Region.HorizontalRailLength) / me.Region.WindowWidth);
                if (result > 0) me.Region.Left += result % 50 < 25 ? result - result % 50 : result - result % 50 + 50;
                else me.Region.Left += result % 50 > -25 ? result - result % 50 : result - result % 50 - 50;
                if (_oldLocation != me.Region.Left) _initMouseLocation.x = event.clientX;
                _oldLocation = me.Region.Left;
            }
        }
    });
    //键盘上下左右
    Tool.Bind(document, 'keydown', function(event) {
        console.log(event);
        switch (event.keyCode) {
            case 33:
                me.Region.Top = 0;
                break;
            case 34:
                me.Region.Top = me.ProgramCount * 22 - me.Region.WindowHeight + 44;
                break;
            case 37:
                me.Region.Left -= 50;
                break;
            case 38:
                me.Region.Top -= 22;
                break;
            case 39:
                me.Region.Left += 50;
                break;
            case 40:
                me.Region.Top += 22;
                break;
            default:
        }
    });
    //鼠标滚轮滚动事件
    Tool.Bind(me.Element, 'mousewheel', function(event) {
        var e = event || window.event;
        if (e.wheelDeltaY == undefined && e.wheelDeltaX == undefined) {
            me.Region.Top = me.ContentElement.scrollTop - (e.wheelDelta ? e.wheelDelta : e.detail * 22) / 40 * 22;
        } else {
            if (e.wheelDeltaY != 0) {
                me.Region.Top = me.ContentElement.scrollTop - (e.wheelDelta ? e.wheelDeltaY : e.detail * 22) / 40 * 22;
            } else if (e.wheelDeltaX != 0) {
                me.Region.Left = me.ContentElement.scrollLeft - (e.wheelDelta ? e.wheelDeltaX : e.detail * 22) / 80 * 50;
            }
        }
        if (document.all) window.event.returnValue = false;
        else event.preventDefault();
    });
    //初始化数据
    this.Init = function(data, startDate, endDate) {
            if (!startDate) startDate = new Date();
            if (!endDate) endDate = new Date().setMonth(new Date().getMonth() + 1);
            me.DayCount = 0;
            me.ProgramCount = program.length;
            me.Region.Height = me.ProgramCount * 22;
            var element_month = "";
            var element_day = "";
            var datelist = [];
            //填充日期
            console.log(startDate, startDate.getFullYear())
            for (var i = startDate.getFullYear(); i <= endDate.getFullYear(); i++) {
                for (var o = i == startDate.getFullYear() ? startDate.getMonth() : 0; o <= endDate.getMonth() && i == endDate.getFullYear() || o <= 11 && i < endDate.getFullYear(); o++) {
                    var monthday = 0;
                    if (o == startDate.getMonth() && i == startDate.getFullYear()) monthday = ((new Date(i, o, 0).getDate() - startDate.getDate() + 1) * 50);
                    else if (o == endDate.getMonth() && i == endDate.getFullYear()) monthday = (endDate.getDate() * 50);
                    else monthday = (new Date(i, o, 0).getDate() * 50);
                    element_month += '<div style="width:' + monthday + 'px;" class="header-row-cell year">' + i + '-' + (Array(2).join('0') + (o + 1)).slice(-2) + '<div class="shade"></div></div>';
                    for (var p = i == startDate.getFullYear() && o == startDate.getMonth() ? startDate.getDate() : 1; p <= new Date(i, o, 0).getDate() && (o != endDate.getMonth() || i != endDate.getFullYear()) || o == endDate.getMonth() && i == endDate.getFullYear() && p <= endDate.getDate(); p++) {
                        me.DayCount++;
                        element_day += '<div style="width:50px;" class="header-row-cell month">' + p + '<div class="shade"></div></div>';
                        datelist.push({
                            year: i,
                            month: o,
                            day: p
                        });
                    }
                }
            }
            me.Region.Width = me.DayCount * 50;
            document.querySelectorAll(element + " .bar-chart-header > .header-row")[0].innerHTML = element_month;
            document.querySelectorAll(element + " .bar-chart-header > .header-row")[1].innerHTML = element_day;
            //填充项目
            var element_program = "";
            var element_data = "";
            for (var i = 0; i < program.length; i++) {
                element_program += '<div class="sidebar-row program">' + program[i].name + '<div class="shade"></div></div>';
                element_data += '<div class="data-row">';
                for (var o = 0; o < datelist.length; o++) {
                    element_data += '<div class="data-cell">';
                    if (!!program[i].data) {
                        element_data += '<div class="data-cell-table">';
                        for (var p = 0; p < program[i].data.length; p++) {
                            if (program[i].data[p].date.year == datelist[o].year &&
                                program[i].data[p].date.month == datelist[o].month &&
                                program[i].data[p].date.day == datelist[o].day) {
                                element_data += '<a class="bg-' + program[i].data[p].style + '" target="_blank" ' + (program[i].data[p].url ? 'href="' + program[i].data[p].url + '"' : '') + ' title="' + program[i].data[p].text + '">' + program[i].data[p].text + '</a>';
                            }
                        }
                        element_data += '</div>';
                    }
                    element_data += '</div>';
                }
                element_data += '</div>';
            }
            me.HeaderElement.style.width = (datelist.length * 50 + 150) + "px";
            me.DataElement.style.width = (datelist.length * 50) + "px";
            me.SideBarElement.innerHTML = element_program;
            me.DataElement.innerHTML = element_data;

            me.Region.Top = 0;
            me.Region.Left = 0;
        }
        //自动滚屏
    this.AutoScroll = function(checked, time, linenumber) {
        if (checked === undefined) checked = true;
        if (time !== undefined) me.Timer.Time = time;
        if (linenumber !== undefined) me.Timer.ScrollLineNumber = linenumber;
        me.Timer.IsStart = checked;
    }
}