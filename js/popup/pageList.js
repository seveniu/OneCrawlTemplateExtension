var serverHost;
var $bg;
var id = "#pageListDiv";

chrome.runtime.getBackgroundPage(function (bg) {
    serverHost = bg.serverHost;
    $bg = bg;
    bg.getTemplate(function (template) {
        init(template);
    })
});


function init(template) {
    vm.setTemplate(template)
}
var vm = new Vue({
    el: id,
    data: {
        template: {
            name: ""
        },
        newPage: {
            name: ""
        },
        showNewPage: false
    },

    ready: function () {
    },
    methods: {
        setTemplate: function (template) {
            console.log(template);
            this.template = template;
            if (!template.pages) {
                this.template.pages = []
            }
        },
        addNewPage: function () {
            this.showNewPage = true;
            var that = this;
            $bg.getCurTabUrl(function (url) {
                that.newPage.url = url;
            })
        },
        addPage: function () {
            this.template.pages.push(clone(this.newPage));
            this.showNewPage = false;
        },
        cancel: function () {
            $bg.clearTemplate();
            toPage("popup")
        },
        inject: function (index, page) {
            console.log("inject : " + page.url);
            $bg.inject(index, page.url);
        }

    }
});

vm.$watch("template", function (val) {
    var template = clone(val);
    $bg.setTemplate(template)
}, {deep: true});
