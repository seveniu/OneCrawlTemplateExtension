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
               
                toPage("pageList")
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
                            var websiteId = data.message.id;
                            $bg.websiteId = websiteId;
                            toPage("templateList");
                            // templateView = new TemplateListView(websiteId);
                            // templateView.create();

                        } else {
                            console.log("没有设置过该域名  --> createDiv");
                            // controlView("createDiv");
                            toPage("website")
                        }
                    })
                })
            }
        } else {
            window.location.href ="/html/popup/login.html";
        }
    }).error(function () {
        window.location.href ="/html/popup/login.html";
    });

}

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
                    addNewPage: function () {
                        this.showNewPage = true;
                        var that = this;
                        $bg.getCurTabUrl(function (url) {
                            that.newPage.url = url;
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


