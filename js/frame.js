function sendMessage(m, response) {
    console.log("send msg");
    chrome.runtime.sendMessage(m, response);
}

sendMessage({action: "frameDone", msg: "hello"});

var allLabels;

function init() {
    getFieldDict()
}
function getFieldDict() {
    chrome.runtime.sendMessage({action: "getFieldList"}, function (data) {
        if (isResultSuccess(data)) {
            allLabels = data.result.items;
        }
    });
}

var vm = new Vue({
    el: "#dhlz-inject-main",
    data: {
        fieldGroupSelected: "",
        fieldGroupList: [],
        page: {
            fields: [
            ]
        },
        chooseLabel: null,
    },
    ready: function () {
        this.getFieldGroupList();
        this.getPage();
    },
    watch: {
        fieldGroupSelected: function () {
            var that = this;
            that.fields = [];
            if (this.fieldGroupList && this.fieldGroupSelected) {

                var group = this.fieldGroupList[this.fieldGroupSelected];

                if (group && group.fields) {
                    console.log(group);
                    group = clone(group);

                    var fields = JSON.parse(group.fields);
                    fields.forEach(function (v) {
                        allLabels.forEach(function (vv) {
                            if (vv.id == v) {
                                console.log(vv);
                                // result.push(vv)
                                vv.xpath = "";
                                vv.must = false;
                                vv.defaultValue = "";
                                that.page.fields.push(vv)
                            }
                        });
                    })
                }
            }
            // return result;
        }
    },
    methods: {
        getFieldGroupList: function () {
            var that = this;
            chrome.runtime.sendMessage({action: "getFieldGroupList"}, function (data) {
                if (isResultSuccess(data)) {
                    that.fieldGroupList = data.result.items;
                }
            });
        },
        getPage: function () {
            var that = this;
            chrome.runtime.sendMessage({action: "getPage"}, function (page) {
                console.log(clone(page));
                that.page.name = page.name;
                that.page.url = page.url;
                that.page.fields = page.fields;
                // that.page.fields.push({
                //     name: "标题",
                //     xpath: ""
                // })
            });
        },
        "chooseLabelGroup": function (group) {
            console.log(group);
        },
        "xpathChoose": function (field) {
            console.log(field);
            this.chooseLabel = field;
            // vm.chooseLabel.xpath = "";

            sendMessage({action: "choose", msg: "hello"});
        },
        "testXpath": function () {
            var fields = JSON.stringify(this.fields);
            console.log(fields);
            sendMessage({action: "testXpath", msg: fields})
        }
    }
});
function isResultSuccess(result) {
    return result.code == "200000"
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function cancelXpathLocate() {
    sendMessage({action: "cancelXpathLocate", msg: ""})
}
function setXpath(xpath) {
    console.log("set xpath : " + xpath);
    vm.chooseLabel.xpath = xpath;
}
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // console.log(sender.tab ? "来自内容脚本：" + sender.tab.url : "来自扩展程序");
        if (request.target && request.target == "frame") {

            var action = request.action;
            console.log("getMessage action:" + action);
            if (action === "xpath") {
                setXpath(request.msg)
            }
        }
    }
);


document.body.onkeydown = function (e) {
    // alert(String.fromCharCode(e.keyCode)+" --> "+e.keyCode);
    if (e.which == 27) {
        cancelXpathLocate()
    }
};

console.log("iframe js loaded");
