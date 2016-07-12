var serverHost;
var $bg;

chrome.runtime.getBackgroundPage(function (bg) {
    serverHost = bg.serverHost;
    $bg = bg;
});


var id = "#websiteDiv";
var vm = new Vue({
    el: id,
    data: {
        websiteName: ""
    },
    ready:function () {
    },
    methods: {
        add: function () {
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
                        toPage("popup")
                    } else {
                        console.log("域名重复  --> websiteDiv");
                    }
                })
            })
        }
    }
});
