function sendMessage(m, response) {
    console.log("send msg");
    chrome.runtime.sendMessage(m, response);
}

sendMessage({action: "frameDone", msg: "hello"});

var allLabels;
chrome.runtime.sendMessage({action: "getFieldList"}, function (data) {
    if (isResultSuccess(data)) {
        allLabels = data.result.items;
    }
});
console.log("iframe js loaded");
var vm = new Vue({
    el: "#dhlz-inject-main",
    data: {
        fieldGroupSelected: "",
        labelGroupList: [],
        labels: [
            // {
            //     name: "标题",
            //     xpath: ""
            // }
        ],
        chooseLabel: null,
    },
    ready: function () {

        var that = this;
        chrome.runtime.sendMessage({action: "getFieldGroupList"}, function (data) {
            if (isResultSuccess(data)) {
                that.labelGroupList = data.result.items;
            }
        });

    },
    watch: {
        fieldGroupSelected: function () {
            var that = this;
            that.labels = [];
            if (this.labelGroupList && this.fieldGroupSelected) {

                var group = this.labelGroupList[this.fieldGroupSelected];

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
                                vv.must =false;
                                vv.defaultValue = "";
                                that.labels.push(vv)
                            }
                        });
                    })
                }
            }
            // return result;
        }
    },
    methods: {
        "chooseLabelGroup": function (group) {
            console.log(group);
        },
        "xpathChoose": function (label) {
            console.log(label);
            this.chooseLabel = label;
            vm.chooseLabel.xpath = "....."

            sendMessage({action: "choose", msg: "hello"});
        },
        "testXpath" :function () {
            var labels = JSON.stringify(this.labels);
            console.log(labels);
            sendMessage({action:"testXpath",msg:labels})
        }
    }
})
function isResultSuccess(result) {
    return result.code == "200000"
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function cancelXpathLocate() {
    sendMessage({action:"cancelXpathLocate",msg:""})
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
    });
// document.getElementsByName("a");
// console.log(parent.getElementsByName("a"));
// $(parent).on("mouseover", function (e) {
//     $(this).addClass("dhlz_locate_over");
// });
// $(parent).on("mouseout", function (e) {
//     $(this).removeClass("dhlz_locate_over");
// });


document.body.onkeydown = function(e){
    // alert(String.fromCharCode(e.keyCode)+" --> "+e.keyCode);
    if (e.which == 27) {
        cancelXpathLocate()
    }
};
