var serverHost;
var $bg;
var id = "#template";

chrome.runtime.getBackgroundPage(function (bg) {
    serverHost = bg.serverHost;
    $bg = bg;
    init(bg.websiteId);
});


function init(websiteId) {
    vm.getTemplateList(websiteId)
}
var vm = new Vue({
    el: id,
    data: {
        templates: [],
        showNewTemplate: false,
        newTemplate: {
            name: "",
            type: 0
        }
    },

    ready: function () {
    },
    methods: {
        getTemplateList: function (websiteId) {
            var templates = this.templates = [];
            $.get(serverHost + "api/template/list-filter", {
                page: 0,
                pagesize: 1000,
                orderColumn: "id",
                orderType: "desc",
                websiteId: websiteId
            }, function (data) {
                console.log(data);
                data.result.items.forEach(function (v) {
                    templates.push(v)
                });
            })
        },
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
                    vm.chooseTemplate(vm.newTemplate)
                }
            })
        },
        chooseTemplate:function (template) {
            if(template.pages) {
                template.pages = JSON.parse(template.pages);
            } else {
                template.pages = [];
            }
            $bg.setTemplate(clone(template));
            toPage("popup")
        }

    }
});
