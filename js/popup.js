var serverHost;
var $template;
var $bg;

var templateView;
chrome.runtime.getBackgroundPage(function (bg) {
    serverHost = bg.serverHost;
    $bg = bg;
    bg.getTemplate(init);
});

function init(template) {
    $template = template;
    $.get(serverHost + "is-login", function (data) {
        console.log(data);
        if (isResultSuccess(data)) {
            if (template) {
                console.log(template);
                templateView = new TemplateListView();
                templateView.create();
                templateView.setCurTemplate(template)
            } else {
                // 之前没有 模板
                console.log("no templates");
                $bg.getCurTabUrl(function (url) {
                    console.log(url);
                    var a = document.createElement('a');
                    a.href = url;

                    $.get(serverHost + "api/website/get-by-domain", {domain: a.hostname}, function (data) {

                        console.log(data);
                        if (isResultSuccess(data)) {
                            console.log("已设置过该域名  --> websiteDiv");
                            var websiteId = data.result;
                            templateView = new TemplateListView(websiteId);
                            templateView.create();

                        } else {
                            console.log("没有设置过该域名  --> createDiv");
                            // controlView("createDiv");
                            var websiteView = new WebsiteView();
                            websiteView.create();
                        }
                    })
                })
            }
        } else {
            var loginView = new LoginView();
            loginView.create();
        }
    }).error(function () {
        var loginView = new LoginView();
        loginView.create();
    });

}
var LoginView = function () {
    var View = {
        id: "#loginDiv",
        vm: null,
        create: function () {
            var that = this;
            if (this.vm) {
                return
            }
            this.vm = new Vue({
                el: that.id,
                data: {
                    username: "",
                    password: ""
                },
                methods: {
                    login: function () {
                        $.post(serverHost + "login/ajax", {
                            username: this.username,
                            password: this.password
                        }, function (result) {
                            if (isResultSuccess(result)) {
                                console.log(result);
                                chrome.cookies.set({
                                    url: serverHost.slice(0, serverHost.lastIndexOf(":")),
                                    name: "TEMPLATE_SESSION",
                                    value: result.message
                                }, function () {
                                    console.log("set sessionId success!");
//                controlView("menuDiv");
                                    console.log("checkOnLine success -> open createDiv");
                                    window.location.reload()
                                });
                            } else {
                                alertMessage("用户名或密码错误");
                            }
                        })

                    }
                },
                ready: function () {
                    $(that.id).show();
                }
            })
        }
    };
    return View;
};

var TemplateListView = function (websiteId) {
    var View = {
        id: "#template",
        websiteId: websiteId,
        vm: null,
        create: function () {
            console.log(this.id + " create ...");
            var that = this;
            if (this.vm) {
                return
            }
            this.vm = new Vue({
                el: that.id,
                data: {
                    templates: [],
                    showTemplateList: true,
                    showNewTemplate: false,
                    showNewPage: false,
                    showPageList: false,
                    newTemplate: {
                        name: "",
                        type: 0,
                    },
                    editTemplate: {
                        name: "",
                        type: 0,
                        pages: []
                    },
                    pages: [],
                    newPage: {
                        name: "",
                        url: ""
                    }

                },

                ready: function () {
                    $(that.id).show();
                },
                methods: {
                    addNewTemplate: function () {
                        this.showNewTemplate = true;
                    },
                    addNewPage: function () {
                        this.showNewPage = true;
                        var that = this;
                        $bg.getCurTabUrl(function (url) {
                            that.newPage.url = url;
                        })
                    },
                    addTemplate: function () {
                        var vm = this;
                        $.post(serverHost + "api/template/is-name-exist", {
                            name: vm.newTemplate.name
                        }, function (result) {
                            if (isResultSuccess(result)) {
                                alertMessage("模板名已存在");
                            } else {
                                vm.showNewTemplate = false;
                                vm.showTemplateList = false;
                                vm.showPageList = true;
                                vm.editTemplate.name = vm.newTemplate.name;
                                vm.editTemplate.type = vm.newTemplate.type;
                                console.log("create new template");
                            }
                        })
                    },
                    addPage: function () {
                        this.editTemplate.pages.push(clone(this.newPage));
                        this.showNewPage = false;
                    },
                    cancel: function () {
                        $bg.clearTemplate();
                        window.location.reload()
                    },
                    inject: function (page) {
                        console.log("inject : " + page.url);
                        $bg.injectFrame(page.url);
                    }
                }
            });
            this.vm.$watch("editTemplate", function (val) {
                var template = clone(val);
                $bg.setTemplate(template)
            }, {deep: true})
        },
        setCurTemplate: function (template) {
            this.vm.editTemplate = template;
            this.vm.showTemplateList = false;
            this.vm.showPageList = true;
        },
        getTemplateList: function () {

            $.post(serverHost + "api/template/list-filter", {
                page: 0,
                pagesize: 10,
                orderColumn: "id",
                orderType: "desc",
                websiteId: this.websiteId
            }, function (e) {
                var data = JSON.parse(e);
                console.log(data);
                if (data.success) {
                    console.log("设置域名成功 ");
                    checkDomain();
                } else {
                    alertMessage(data.msg);
                }
            })
        }
    };
    return View;
};

var WebsiteView = function () {
    var View = {
        id: "#websiteDiv",
        vm: null,
        create: function () {
            if (this.vm) {
                return
            }
            var that = this;
            this.vm = new Vue({
                el: that.id,
                data: {
                    websiteName: ""
                },
                ready: function () {
                    $(that.id).show();
                },
                methods: {
                    add: function () {
                        console.log("......._+___");
                        var _vm = this;
                        $bg.getCurTabUrl(function (url) {
                            var a = document.createElement('a');
                            a.href = url;

                            $.post(serverHost + "api/website/add", {
                                name: _vm.websiteName,
                                domain: a.hostname
                            }, function (data) {

                                console.log(data);
                                if (isResultSuccess(data)) {
                                    console.log("已设置过该域名  --> websiteDiv");
                                    var websiteId = data.result;
                                    templateView = new TemplateListView(websiteId);
                                    templateView.create();
                                    that.remove()
                                } else {
                                    console.log("没有设置过该域名  --> createDiv");
                                    // controlView("createDiv");
                                }
                            })
                        })
                    }
                }
            })
        },
        remove: function () {
            this.vm.$remove();
        }
    };
    return View;
};


// new Vue({
//     el: '#app',
//     data: {
//         message: 'Hello Vue.js!'
//     }
// });
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