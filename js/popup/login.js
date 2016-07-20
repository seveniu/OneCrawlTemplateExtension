var serverHost;
var serverName;
var $bg;

chrome.runtime.getBackgroundPage(function (bg) {
    serverHost = bg.serverHost;
    serverName = bg.serverName;
    $bg = bg;
    console.log(serverName);
    init()
});

var id= "#main";
var vm;

function init() {

    vm = new Vue({
    el: id,
    data: {
        username: "",
        password: "",
        serverName: "xxx"
    },
    methods: {
        login: function () {
            $.post(serverHost + "login/ajax", {
                username: this.username,
                password: this.password
            }, function (result) {
                if (isResultSuccess(result)) {
                    chrome.cookies.set({
                        url: serverHost.slice(0, serverHost.lastIndexOf(":")),
                        name: "TEMPLATE_SESSION",
                        value: result.message
                    }, function () {
                        console.log("set sessionId success!");
                        console.log("checkOnLine success -> open createDiv");
                        toPage("popup");
                    });
                } else {
                    alertMessage("用户名或密码错误");
                }
            })

        }
    },
    ready: function () {
        this.serverName = serverName;
    }
});
}
