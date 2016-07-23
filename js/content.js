console.log("content js loading");
var iframe = $("#dhlz-inject-iiframe");
var locateClass = "dhlz_locate_over";


var resultPopup = new ResultPopup();


var chooseFlag = false;

function beginChoose() {
    chooseFlag = true;
    iframe.hide();
}
function doneChoose() {
    var xpath = xpathUtil.getXpath(choosedElement);
    console.log(xpath);
    chrome.runtime.sendMessage({action: "xpath", msg: xpath}, function (v) {
        console.log(v);
    });
    cancelChoose();
}
function cancelChoose() {
    chooseFlag = false;
    iframe.show();
    $("." + locateClass).removeClass(locateClass)
}
function showResultPopup(data) {
    var content = "";
    data = JSON.parse(data);
    data.forEach(function (v) {
        content += "<h4>" + v.name + "</h4>";
        console.log(v);
        var elements = xpathUtil.getElementsByXpath(v.xpath, document);
        elements.forEach(function (element) {
            content += element.innerHTML;
            content += "<hr>"
        })
    });
    resultPopup.show(content)
}
function locateByXpath(xpath) {
    var nodes = xpathUtil.getElementsByXpath(xpath, document);
    for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        addLocateClass(n);
    }
}
function addLocateClass(node) {
    $(node).addClass(locateClass);
}
function removeLocateClass(node) {
    $(node).addClass(locateClass);
}
// -------------- 事件

var choosedElement;
$(document).on("click", "body", function (e) {
    if (chooseFlag) {
        choosedElement = $("." + locateClass)[0];
        $(choosedElement).removeClass("dhlz_locate_over");
        doneChoose();
        e.preventDefault();
        e.stopPropagation();
    }
});
$(document).on("mouseover", function (e) {
    if (chooseFlag) {
        addLocateClass(getTargetElement(e));
    }
});
$(document).on("mouseout", function (e) {
    if (chooseFlag) {
        removeLocateClass(getTargetElement(e));
    }
});
document.body.onkeydown = function (e) {
    // alert(String.fromCharCode(e.keyCode)+" --> "+e.keyCode);
    if (e.which == 27) {
        console.log("press esc!");
        cancelChoose();
    }
};
// $(document).on("keydown", function (e) {
//     console.log(e.which);
//     if (e.which == 27) {
//         console.log("press esc!");
//         alert("esc")
//         cancelChoose();
//     }
// });


// -----------------  util 方法
/**
 * 获取目标元素
 * @param e 事件
 * @returns target
 */
function getTargetElement(e) {
    var targ;
    if (!e) var e = window.event;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;
    if (targ.nodeType == 3)
    // defeat Safari bug
        targ = targ.parentNode;
    return targ;
}

// -------------------  message
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
        "来自内容脚本：" + sender.tab.url :
            "来自扩展程序");
        var action = request.action;
        console.log(request);
        console.log("getMessage action:" + action);
        if (request.target == "content") {
            if (action === "addLabel") {
                $.addLabel(request.pageId, request.label, function () {
                    console.log("send response");
                    sendResponse("success");
                });
                return true; //您在事件处理函数中返回 true，表示您希望通过异步方式发送响应（这样，与另一端之间的消息通道将会保持打开状态，直到调用了 sendResponse）。
            } else if (action === 'choose') {
                beginChoose()
            } else if (action === 'testXpath') {
                showResultPopup(request.msg)
            } else if (action === 'cancelXpathLocate') {
                console.log("00000000000");
                cancelChoose();
            }
        }
    });
console.log("content js load end`");
