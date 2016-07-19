var KEY = "serverData";
var chromeStorage = {
    get: function (key, callback) {
        chrome.storage.sync.get(key, callback)
    },
    set: function (data, callback) {
        chrome.storage.sync.set(data, callback);
    }
};
var id = "#data";
var vm = new Vue({
    el: id,
    data: {
        newServer: {
            host: "",
            name: ""
        },
        curServerIndex: 0,
        serverList: []
    },
    ready: function () {
        this.getFromStorage()
    },
    computed: {
        curServer: function () {
            if (this.serverList.length > 0) {
                var curServer = this.serverList[this.curServerIndex];
            }
            if (curServer) {
                return curServer;
            }
            return {
                host: "",
                name: ""
            }
        }
    },
    methods: {
        addServer: function () {
            if (this.newServer.name && this.newServer.host) {
                this.serverList.push(JSON.parse(JSON.stringify(this.newServer)));
                this.saveToStorage();
                this.clearNewServer()
            } else {
                window.alert("请填写完整")
            }
        },
        clearNewServer: function () {
            this.newServer.name = "";
            this.newServer.host = "";
        },
        setCur: function (index) {
            this.curServerIndex = index;
            this.saveToStorage();
        },
        deleteServer: function (index) {
            console.log(index);
            this.serverList.splice(index, 1);
            this.saveToStorage();
        },
        getFromStorage: function () {

            var that = this;
            function write(serverData) {

                console.log(serverData);
                if (serverData) {
                    if (serverData.curServerIndex) {
                        that.curServerIndex = serverData.curServerIndex;
                    }
                    if (serverData.serverList) {
                        serverData.serverList.forEach(function (v) {
                            that.serverList.push(v)
                        });
                    }
                }
            }
            chromeStorage.get(KEY, function (data) {
                write(data[KEY])
            });
        },
        saveToStorage: function () {
            console.log("storage");
            var that = this;
            var data = {};
            data[KEY] = {
                curServerIndex: clone(that.curServerIndex),
                serverList: clone(that.serverList)
            };
            chromeStorage.set(data, function () {
                chrome.runtime.getBackgroundPage(function (bg) {
                    bg.serverHost = clone(that.serverList[that.curServerIndex]).host;
                    // checkTimeout();
                });
            })
        }
    }
});
function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}


