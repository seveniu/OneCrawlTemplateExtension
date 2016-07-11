/**
 * Created by serveniu on 14-3-31.
 * version 1.0
 */

var $template;
var $website;
var $url;
//var serverHost = "http://www.dhlz.com:18000/c/";
var serverHost = "http://58.30.208.70:19000/c/";
function init() {
    chrome.storage.local.get("$template", function (value) {
        $template = value.$template;
    });
}
init();
$.extend({
    hello: function (msg) {
        $.alertMessage("获取 id:" + msg + "的模板发生错误");
//        alert(msg);
    },


    setTemplate: function (define, callback) {
        $template = define;
        if ($template.pages) {
            $template.pages = JSON.parse($template.pages);
        }
        $.updateStorage(callback);
    },

    setWebsite: function (id, callback) {
        AJAX({
            url: serverHost + 'website/get/' + id,
            type: 'GET',
            success: function (data) {
                data = JSON.parse(data);
                if (data.result) {
                    $website = data.msg;
                }
                callback($website);
                console.log("从服务器获取网站：");
                console.log($website);
            },
            fail: function () {
                $.alertMessage("获取 id:" + id + "的模板发生错误")
            }
        });
    },
    updateStorage: function (callback) {
        if ($template) {
            chrome.storage.local.set({'$template': $template}, function () {
                console.log("更新本地存储模板：" + $template.name);
                if (callback) {
                    callback()
                }
            })
        }
    },
    getTemplate: function () {
        return $template;
    },
    createTask: function (structId, name) {
        chrome.tabs.create({url: serverHost + 'task/add-page?id=' + structId + '&name=' + name}, function () {
        });
    },
    addPage: function (page, callback) {
        console.log("添加page ： " + page.name);
        if ($template.pages) {
            $template.pages.push(page);
        } else {
            $template.pages = [page];
        }
        $.updateStorage(callback);
    },
    removePage: function (index, callback) {
        console.log("删除page ： " + index);
        console.log($template.pages);
        var page = $template.pages[index];
        $.confirmMessage("确认删除 " + page.name + " ?", function () {
            $template.pages.splice(index, 1);
            $.updateStorage(callback);
        });
    },

    /**
     *
     * @param pageId
     * @param label
     */
    addLabel: function (pageId, label, callback) {
        var page = $template.pages[pageId];
        console.log(label);
        if (page) {
            console.log("pageId:" + pageId + "，添加label ： " + label.name);
            if (page.labels) {
                page.labels.push(label);
            } else {
                page.labels = [label];
            }
            $.updateStorage(callback);
        }
    },

    removeLabel: function (pageId, labelId, callback) {
        var page = $template.pages[pageId];
        if (page) {
            console.log("pageId:" + pageId + "  删除label ： " + labelId);
            if (page.labels) {
                var label = page.labels[labelId];
                $.confirmMessage("确认删除 " + label.name + " ?", function () {
                    page.labels.splice(labelId, 1);
                    $.updateStorage(callback);
                });
            } else {
                $.alertMessage("label 获取 错误！")
            }
        } else {
            $.alertMessage("page 获取 错误！")
        }
    },

    setXpath: function (pageId, labelId, xpath, callback) {
        var page = $template.pages[pageId];
        if (page) {
            if (page.labels) {
                var label = page.labels[labelId];
                console.log("pageId:" + pageId + " 设置 label : " + label.name + "  的 xpath");
                label.xpath = xpath;
                $.updateStorage(callback);
            } else {
                $.alertMessage("label 获取 错误！")
            }
        } else {
            $.alertMessage("page 获取 错误！")
        }
    },
    setLabels: function (pageId, labels, callback) {
        var page = $template.pages[pageId];
        if (page) {
            page.labels = labels;
            console.log("pageId:" + pageId + " 设置 labels ");
            console.log(labels);
            $.updateStorage(callback);
        } else {
            $.alertMessage("page 获取 错误！")
        }
    },
    setUrl: function (pageId, url, callback) {
        var page = $template.pages[pageId];
        if (page) {
            page.url = url;
            console.log("pageId:" + pageId + " 设置 url:" + url);
            $.updateStorage(callback);
        } else {
            $.alertMessage("page 获取 错误！")
        }
    },
    setLabelsAndUrl: function (pageId, labels, callback) {
        var page = $template.pages[pageId];
        if (page) {
            page.labels = labels;
            console.log("pageId:" + pageId + " 设置 labels:");
            console.log(labels);

            $.updateStorage(callback);
        } else {
            $.alertMessage("page 获取 错误！")
        }
    },
    testLabels: function (pageId, labels, timeout, tabId, callback) {
        var page = $template.pages[pageId];
        if (page) {
            page.labels = labels;
            AJAX({
                type: "post",
                url: serverHost + "template/test/page",
                data: "json=" + encodeURIComponent(JSON.stringify(page)) + "&timeout=" + timeout,
                success: function (e) {
                    var result = JSON.parse(e);
                    if (result.success) {
                        $.carouselGetTestResult(result.msg, tabId);
                    } else {
                        alert(result.msg);
                    }
                }
            })
        } else {
            $.alertMessage("page 获取 错误！")
        }
    },

    carouselGetTestResult: function (testId, tabId) {
        var count = 0;
        var i = setInterval(function () {
            count++;
            if (count === 20) {
                clearInterval(i);
            }
            AJAX({
                type: "get",
                url: serverHost + "template/test/test-result/" + testId,
                success: function (e) {

                    var result = JSON.parse(e);
                    if (result.success) {
                        if(result.msg === "TIMEOUT") {
                            alert("请求超时");
                            return;
                        }
                        var parseResult = JSON.parse(result.msg);
                        console.log(parseResult);
                        clearInterval(i);
                        chrome.tabs.sendMessage(tabId, {action: "showTestResult", result: parseResult}, function (response) {
                        });
                    } else {
                        if (result.msg === "wait") {
                            console.log(count);
                        } else {
                            alert(result.msg);
                        }
                    }
                }
            })
        }, 1000);
    },


    resetLabels: function (pageId, callback) {
        var page = $template.pages[pageId];
        if (page) {
            $.confirmMessage("确认重置 " + page.name + " 的所有标签？", function () {
                console.log("pageId:" + pageId + " 重置 labels");
                page.labels = [];
                $.updateStorage(callback);
            });
        } else {
            $.alertMessage("page 获取 错误！")
        }
    },
    updateTemplateToServer: function (success, fail) {
        var pages = JSON.stringify($template.pages);
        console.log("更新服务器的 模板");
        console.log($template);
        console.log(pages);
        $.confirmMessage("确认提交更新到服务器?", function () {
            AJAX({
                type: "post",
                url: serverHost + "template/updatepages/" + $template.id,
                data: "pages=" + encodeURIComponent(pages), //必须要用 encodeURIComponent 转码，转义 &
                success: function (response) {
                    console.log(response);
                    if (response === "success") {
                        $template = undefined;
                        if (success) {
                            success();
                            $.alertMessage("更新成功！");
                        }
                    } else {
                        $.alertMessage("Error!更新到服务器发生错误！" + response);
                        if (fail) fail();
                    }
                },
                fail: function () {
                    $.alertMessage("Error!更新到服务器发生错误！");
                    if (fail) fail();
                }
            });
        });
    },

    cancelModify: function (callback) {
        chrome.storage.local.clear(function () {
            console.log("取消修改模板");
            $template = undefined;
            callback();
        });
    },

    editPage: function (pageId) {
        console.log("注入页面，pageId:" + pageId);
        var page = $template.pages[pageId];

        function createPage(url, callback) {
            console.log('测试页面：' + url);
            chrome.tabs.create({url: serverHost + "template/test/proxy?url=" + encodeURIComponent(url)}, function (tab) {
                callback(tab);
//                chrome.tabs.executeScript({code:"document.write(0000)"});
            });
        }

        if (page) {
            if (page.url) {
                createPage(page.url, function (tab) {
                    injectFun(tab.id);
                });
            } else {
                $.getUrl(function (url) {
                    $.confirmMessage("编辑 ：" + url + "  ?",function () {
                        page.url = url;
                        createPage(url, function (tab) {
                            injectFun(tab.id);
                        });
                    },
                    function () {

                    });
                });
            }
        }
        var injectFun = function (id) {

            chrome.tabs.executeScript({code: "var choosePageId=" + pageId});
            chrome.tabs.executeScript(id, {file: "js/jquery.js"});
            chrome.tabs.insertCSS(id, {file: "css/content.css"});
//            chrome.tabs.insertCSS(id, {file: "css/bootstrap.css"});
//            chrome.tabs.insertCSS(id, {file: "css/firedefine.css"});
            chrome.tabs.executeScript(id, {file: "js/frame.js"});
            chrome.tabs.executeScript(id, {file: "js/label.js"}); // inject 要在 label.js 上
            chrome.tabs.executeScript(id, {file: "js/xpath.js"});
            chrome.tabs.executeScript(id, {file: "js/tool.js"});
        };
    },

    getUrl: function (callback) {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
            console.log(tabs);
            var tab = tabs[0];
            console.log(tab.url);
            callback(tab.url);
        })
    },
    getLabelTemplate: function (callback) {
        AJAX({
            type: "get",
            url: serverHost + "labelTemplate/list/",
            success: function (response) {
                console.log(response);
                var templates = JSON.parse(response);
                callback(templates)
            },
            fail: function () {
                $.alertMessage("Error!获取 标记模板 服务器发生错误！");
            }
        })
    },
    getLabels: function (templateId, callback) {
        AJAX({
            type: "get",
            url: serverHost + "label/get-by-template/" + templateId,
            success: function (response) {
                try {
                    var templates = JSON.parse(response);
                } catch (e) {
                    alertMessage("结构定义解析错误！")
                }
                callback(templates)
            },
            fail: function () {
                $.alertMessage("Error!获取 标记模板 服务器发生错误！");
            }
        })
    },
    openCreateLabelTemplatePage: function () {
        chrome.tabs.create({url: serverHost +"labelTemplate/"}, function () {
        })
    },


//////////////////////////////   公用方法   //////////////////////////////
    /**
     * 弹出消息框
     * @param m 消息
     */
    alertMessage: function (m) {
        alert(m);
    },

    /**
     *
     * @param m 消息
     * @param success 成功时调用
     * @param fail 失败时调用
     */
    confirmMessage: function (m, success, fail) {
        var r = confirm(m);
        if (r) {
            success();
        } else {
            if (fail) {
                fail();
            }
        }
    }

});
function getUrl(callback) {

    chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
        console.log(tabs);
        var tab = tabs[0];
        console.log(tab.url);
        $url = tab.url;
        callback($url);
    });
}
function removePage1(index, callback) {
    console.log("删除page ： " + index);
    var page = $template.pages[index];
    console.log(page);

    $.confirmMessage("确认删除 " + page.name + " ?", function () {
        $template.pages.splice(index, 1);
        $.updateStorage(callback);
    });
}
// 初始化
function addPage(page, callback) {
    console.log("添加page ： " + page.name);
    if ($template.pages) {
        $template.pages.push(page);
    } else {
        $template.pages = [page];
    }
    $.updateStorage(callback);
}
var AJAX = function (conf) {
    console.log("ajax url:" + conf.url);
    var type;
    var dataType = "text";
    var url;
    var data;
    var async = true;
    var success;
    var fail;

    // 初始化
    //type参数,可选
    if (conf.type) {
        type = conf.type;
    } else {

    }
    //url参数，必填
    if (conf.url) {
        url = conf.url;
    } else {

    }
    //data参数，可选，只有在post请求时需要
    if (conf.data) {
        data = conf.data;
    }
    //datatype参数，可选   
    if (conf.dataType) {
        dataType = conf.dataType;
    }
    //async 同步参数，可选， true：异步
    if (conf.async) {
        async = conf.async;
    }
    //回调函数，可选
    if (conf.success) {
        success = conf.success;
    }
    if (conf.fail) {
        fail = conf.fail;
    }


    // 创建ajax引擎对象
    var xhr = createAjax();
    // 打开
    xhr.open(type, url, async);
    // 发送
    if (type == "GET" || type == "get") {
        xhr.send(null);
    } else if (type == "POST" || type == "post") {
        xhr.setRequestHeader("content-type",
            "application/x-www-form-urlencoded");
        xhr.send(data);
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            if (success) {
                if (dataType == "text" || dataType == "TEXT") {
                    //普通文本
                    success(xhr.responseText);
                } else if (dataType == "xml" || dataType == "XML") {
                    //接收xml文档   
                    success(xhr.responseXML);
                } else if (dataType == "json" || dataType == "JSON") {
                    //将json字符串转换为js对象 
//                    success(eval("("+xhr.responseText+")"));
                    success(JSON.parse(xhr.responseText));
                }
            }
        } else {
            if (xhr.readyState == 4 && xhr.status != 200) {
                window.alert("服务器挂了！！！请通知系统管理员处理！！！");
                console.log(xhr.status);
                if (fail) {
                    fail();
                }
            }
        }
    };
};
var createAjax = function () {
    var xhr = null;
    try {
        //IE系列浏览器
        xhr = new ActiveXObject("microsoft.xmlhttp");
    } catch (e1) {
        try {
            //非IE浏览器
            xhr = new XMLHttpRequest();
        } catch (e2) {
            window.alert("您的浏览器不支持ajax，请更换！");
        }
    }
//    if (window.XMLHttpRequest) {
//        xhr = new XMLHttpRequest();
//    } else {
//        xhr = new ActiveXObject('Microsoft.XMLHTTP')
//    }
    return xhr;
};


//////////////////////////////   事件监听   //////////////////////////////
chrome.runtime.onMessage.addListener(
    function (requestData, sender, sendResponse) {
        console.log(sender.tab ?
            "来自内容脚本：" + sender.tab.url :
            "来自扩展程序");
        var action = requestData.action;
        console.log("getMessage action:" + action);
        console.log(requestData);
        if (action === "addLabel") {
            $.addLabel(requestData.pageId, requestData.label, function () {
                console.log("send response");
                sendResponse("success");
            });
            return true; //您在事件处理函数中返回 true，表示您希望通过异步方式发送响应（这样，与另一端之间的消息通道将会保持打开状态，直到调用了 sendResponse）。
        } else if (action === 'removeLabel') {
            $.removeLabel(requestData.pageId, requestData.labelId, function () {
                sendResponse("success");
            });
            return true;
        } else if (action === 'getPage') {
            var page = $template.pages[requestData.pageId];
            console.log(page);
            sendResponse(page);
        } else if (action === 'setXpath') {
            $.setXpath(requestData.pageId, requestData.labelId, requestData.xpath, function () {
                sendResponse("success");
            });
            return true;
        } else if (action === 'saveLabelsAndUrl') {
            console.log(requestData.labels);
            $.setLabelsAndUrl(requestData.pageId, requestData.labels, function () {
                sendResponse("success");
            });
            return true;
        } else if (action === 'testLabels') {
            console.log(requestData.labels);
            $.testLabels(requestData.pageId, requestData.labels, requestData.timeout, sender.tab.id, function () {
                sendResponse("success");
            });
            return true;
        } else if (action === 'saveUrl') {
            $.setUrl(requestData.pageId, requestData.url, function () {
                sendResponse("success");
            });
            return true;
        } else if (action === 'resetLabels') {
            $.resetLabels(requestData.pageId, function () {
                sendResponse("success");
            });
            return true;
        } else if (action === 'getLabelTemplate') {
            $.getLabelTemplate(function (templates) {
                sendResponse(templates)
            });
            return true;
        } else if (action === 'getLabels') {
            $.getLabels(requestData.templateId, function (templates) {
                sendResponse(templates)
            });
            return true;
        } else if (action === 'openCreateLabelTemplatePage') {
            $.openCreateLabelTemplatePage();
        }
    }
);

chrome.runtime.onStartup.addListener(function () {
    console.log("start up");
});
chrome.runtime.onSuspend.addListener(function () {
    console.log("suspend");
    $.updateStorage();
});
chrome.runtime.onInstalled.addListener(function () {
    console.log("install");
    chrome.storage.local.clear();
});
//chrome.tabs.onActivated.addListener(function callback(activeInfo) {
//    var tabId = activeInfo.tabId;
//    chrome.tabs.get(tabId,function (tab) {
//        console.log(tab.windowId);
//        console.log(tab.url);
//    })
//
//})
//chrome.tabs.onHighlighted.addListener(function callback(activeInfo) {
//    var tabId = activeInfo.tabId;
//    chrome.tabs.get(tabId,function (tab) {
//        console.log(tab.url);
//    })
//
//})
