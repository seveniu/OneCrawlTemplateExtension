var serverHost;
var $template;
var $bg;

chrome.runtime.getBackgroundPage(function (bg) {
    serverHost = bg.serverHost;
    $bg = bg;
    bg.getTemplate(init);
});

function init(template) {
    $template = template;
    isLogin(function (result) {
        if (result) { // 已登录
            if (template) { // 存在正在编辑的模板
                console.log(template);
                toPage("pageList")
            } else { // 不存在正在编辑模板
                console.log("no templates");
                getWebsiteInfo(function (website) {
                    if (website) {// 网站已设置
                        $bg.websiteId = website.id;
                        toPage("templateList");
                    } else {// 网站未设置
                        console.log("没有设置过该域名  --> createDiv");
                        // controlView("createDiv");
                        toPage("website")
                    }
                })
            }
        } else { //未登录
            window.location.href = "/html/popup/login.html";
        }
    })
}

function isLogin(callback) {
    $.get(serverHost + "is-login", function (data) {
        console.log(data);
        if (isResultSuccess(data)) {
            callback(true);
        } else {
            callback(false);
        }
    })
}

function getWebsiteInfo(callback) {
    $bg.getCurTabUrl(function (url) {
        console.log(url);
        var a = document.createElement('a');
        a.href = url;

        $.get(serverHost + "api/website/get-by-domain", {domain: a.hostname}, function (data) {
            console.log(data);
            if (isResultSuccess(data)) {
                console.log("已设置过该域名  --> websiteDiv");
                callback(data.message);
            } else {
                callback();
            }
        })
    })
}