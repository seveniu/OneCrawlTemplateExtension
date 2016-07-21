/**
 * Created by seveniu on 14-3-31.
 * version 1.0
 */
var serverHost = "http://127.0.0.1:9601/";
var serverName = "";
var injectTemplateUrl = chrome.extension.getURL('/html/iframe.html');
var injectTab;
var websiteId;
var pageIndex;
init();
function init() {
    chrome.storage.local.get("serverData", function (data) {
        var serverData = data["serverData"];
        if (serverData) {
            var server = serverData.serverList[serverData.curServerIndex];
            console.log(server);
            serverHost = server.host;
            serverName = server.name;
        }
    });
}
function getTemplate(callback) {
    chrome.storage.local.get("template", function (value) {
        var template = value.template;
        callback(template);
    });
}

function setTemplate(template, callback) {
    chrome.storage.local.set({'template': template}, function () {
        console.log("更新本地存储模板：" + template.name);
        if (callback) {
            callback()
        }
    })
}

function clearTemplate(callback) {

    chrome.storage.local.clear(function () {
        console.log("取消修改模板");
        if (callback)
            callback();
    });
}

/**
 *
 * @param index page index 页面索引
 * @param url 页面 url
 */
function inject(index, url) {
    pageIndex = index;
    createNewTab(url, function (tab) {
        console.log(tab.id);
        injectTab = tab;
        chrome.tabs.insertCSS(injectTab.id, {file: "/css/inject.css"});
        chrome.tabs.executeScript(tab.id, {"file": "/js/lib/vue.js"});
        chrome.tabs.executeScript(tab.id, {"file": "/js/lib/jquery.js"});
        chrome.tabs.executeScript(tab.id, {"file": "/js/lib/xpath.js"});
        chrome.tabs.executeScript(tab.id, {"file": "/js/content-popup.js"});
        chrome.tabs.executeScript(tab.id, {"file": "/js/content.js"});

        chrome.tabs.executeScript(tab.id, {code: 'document.body.innerHTML=\'<iframe id="dhlz-inject-iframe" src=\"' + injectTemplateUrl + '\" ></iframe>\' + document.body.innerHTML;'}, function () {
            console.log('Iframe injection complete');
        });
    });
}

function updatePageFields(pageFields) {
    getTemplate(function (template) {
        template.pages[pageIndex].fields = pageFields;
        setTemplate(template, function () {

        })
    })
}
function submitTemplate() {
    getTemplate(function (template) {
        submitToServer(template)
    })
}
function testXpathInServer() {

}
// ---------------  服务器请求
function getFieldList(callback) {
    $.get(serverHost + "api/field/list", {
        page: 1,
        pagesize: 1000,
        orderColumn: "id",
        orderType: "asc"
    }, function (data) {
        callback(data)
    })
}
function getFieldGroupList(callback) {

    $.get(serverHost + "api/field-group/list", {
        page: 1,
        pagesize: 1000,
        orderColumn: "id",
        orderType: "asc"
    }, function (data) {
        callback(data)
    })
}
function submitToServer(template, callback) {
    template.pages = JSON.stringify(template.pages);
    delete template.createtime;
    if (template.id) {

        $.ajax({
            url: serverHost + "api/template/edit",
            type: 'put',
            data: template,
            success: function (result) {
                console.log(result);
                if (result.code == "200000") {
                    clearTemplate()
                } else {
                    alertMessage("更新服务器数据,发生错误")
                }
            }
        });
    } else {
        $.ajax({
            url: serverHost + "api/template/add",
            type: 'post',
            data: template,
            success: function (result) {
                console.log(result);
                if (result.code == "200000") {
                    clearTemplate()
                } else {
                    alertMessage("服务器添加数据,发生错误")
                }
            }
        });

    }
}
function createNewTab(url, callback) {
    chrome.tabs.create({url: url}, callback)
}

// --------------- 工具方法
/**
 * 弹出消息框
 * @param m 消息
 */
function alertMessage(m) {
    alert(m);
}

/**
 *
 * @param m 消息
 * @param success 成功时调用
 * @param fail 失败时调用
 */
function confirmMessage(m, success, fail) {
    var r = confirm(m);
    if (r) {
        success();
    } else {
        if (fail) {
            fail();
        }
    }
}
function getCurTabUrl(callback) {

    chrome.tabs.query({active: true}, function (tabs) {
        console.log(tabs);
        var tab = tabs[0];
        console.log(tab.url);
        $url = tab.url;
        callback($url);
    });
}


function sendRadio(msg, response) {
    chrome.tabs.sendMessage(injectTab.id, msg, response);

}

//////////////////////////////   事件监听   //////////////////////////////
chrome.runtime.onMessage.addListener(
    function (requestData, sender, sendResponse) {
        console.log(requestData);
        console.log(sender.tab ?
        "来自内容脚本：" + sender.tab.url :
            "来自扩展程序");
        var action = requestData.action;
        console.log("getMessage action:" + action);
        if (action === "addLabel") {
            $.addLabel(requestData.pageId, requestData.label, function () {
                console.log("send response");
                sendResponse("success");
            });
            return true; //您在事件处理函数中返回 true，表示您希望通过异步方式发送响应（这样，与另一端之间的消息通道将会保持打开状态，直到调用了 sendResponse）。
        } else if (action === 'iframeLoadDone') {
        } else if (action === 'choose') {
            sendRadio({target: "content", action: "choose"});
        } else if (action === 'xpath') {
            sendRadio({target: "iframe", action: "xpath", msg: requestData.msg})
        } else if (action === 'getFieldList') {
            getFieldList(function (data) {
                sendResponse(data);
            });
            return true;
        } else if (action === 'getFieldGroupList') {
            getFieldGroupList(function (data) {
                sendResponse(data);
            });
            return true;
        } else if (action === 'testXpath') {
            sendRadio({target: "content", action: "testXpath", msg: requestData.msg})
        } else if (action === 'testXpathInServer') {

        } else if (action === 'cancelXpathLocate') {
            sendRadio({target: "content", action: "cancelXpathLocate", msg: requestData.msg})
        } else if (action === 'getPageFields') {
            getTemplate(function (template) {
                sendResponse(template.pages[pageIndex])
            });
            return true;
        } else if (action === 'updatePageFields') {
            sendRadio({target: "iframe", action: "getPageFields"}, function (data) {
                updatePageFields(data);
                chrome.tabs.remove(sender.tab.id)
            })
        } else if (action === 'closeCurTab') {
        }

    }
);