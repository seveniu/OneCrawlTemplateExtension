/**
 * 通用 弹出消息
 * @param m
 */
function alertMessage(m) {
    chrome.runtime.getBackgroundPage(function (bg) {
        bg.alertMessage(m);
    });
}

function isResultSuccess(result) {
    return result.code == "200000"
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function toPage(page) {
    var baseUrl = "/html/popup/";
    var url = "error.html";
    switch (page) {
        case  "popup" :
            url = "popup.html";
            break;
        case  "login" :
            url = "login.html";
            break;
        case  "website" :
            url = "website.html";
            break;
        case  "templateList" :
            url = "templateList.html";
            break;
        case  "pageList" :
            url = "pageList.html";
            break;
    }
    window.location.href = baseUrl + url;
}