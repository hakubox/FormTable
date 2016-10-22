# FormTable


---
> 以石墨文档的Excel编辑为目标努力

---
### 数据表格展示
![image](/git/show_1.png)

---
### 使用方法
```html
<div class="bar-chart">
        <div class="bar-chart-content">
            <div class="bar-chart-lefttopcell">Program</div>
            <div class="bar-chart-header">
                <div class="header-row"></div>
                  <div class="header-row"></div>
            </div>
            <div class="bar-chart-sidebar"></div>
            <div class="bar-chart-data"></div>
        </div>
        <div class="bar-chart-scrollbar horizontal">
            <div class="bar-chart-scrollbar-content">
                <span class="scrollbar-btn btn-prev"></span>
                <div class="scrollbar-rail"></div>
                <div class="scrollbar-dragger" style="left: 17px; width: 0px;">
                    <div class="scrollbar-dragger-bar"></div>
                </div>
                <span class="scrollbar-btn btn-next"></span>
            </div>
        </div>
        <div class="bar-chart-scrollbar vertical">
            <div class="bar-chart-scrollbar-content">
                <span class="scrollbar-btn btn-prev"></span>
                <div class="scrollbar-rail"></div>
                <div class="scrollbar-dragger" style="top: 0px; height: 17px;">
                    <div class="scrollbar-dragger-bar"></div>
                </div>
                <span class="scrollbar-btn btn-next"></span>
            </div>
        </div>
    </div>
```

```javascript
//创建BarChart对象并传入定位字符串
var barchart = new BarChart(".bar-chart");
//使用固定格式的数据进行初始化
barchart.Init(program, new Date(2016, 0, 24), new Date(2016, 2, 18));
```

---
### 更新内容

#### 暂无 2016.10.23