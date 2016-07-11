var ResultPopup = function () {
    var popup = '' +
        '<div id="dhlz-inject-xpath-content-wrap" style="display:none;z-index:2147483647;position: fixed;top: 0;left:0;right: 0;bottom: 0;background-color: rgba(144, 144, 144, 0.66);" >' +
        '<div id="dhlz-inject-xpath-content" style="position: relative;width: 700px;height: 70%;padding:10px;margin: 50px auto 0 auto;background-color: #ffffff">' +
        '<div id="dhlz-inject-layer-button" style="position: absolute;top: -20px;">' +
        '<button class="dhlz_btn dhlz_confirm_button">确认</button>' +
        '<button class="dhlz_btn dhlz_cancel_button">取消</button>' +
        '</div>' +
        '<div id="dhlz-inject-xpath-content-html" style="overflow-y: auto;height: 100%">' +
        '</div>' +
        '</div>' +
        '';
    var that = this;
    $("body").append(popup);

    this.$xpathContentWrap = $("#dhlz-inject-xpath-content-wrap");
    this.$xpathContent = $("#dhlz-inject-xpath-content-html");
    this.cancelFunc = function () {
    };
    this.confirmFunc = function () {
    };
    this.show = function (content, confirm, cancel) {
        this.confirmFunc = confirm;
        this.cancelFunc = cancel;
        this.$xpathContent.html(content);
        this.$xpathContentWrap.show();
    };
    this.close = function () {
        this.$xpathContentWrap.hide();
    };


    initEvent();
    function initEvent() {
        $("#dhlz-inject-layer-button").find(".dhlz_confirm_button").on("click", function () {
            that.close();
            if (that.confirmFunc) {
                that.confirmFunc();
            }
        });
        $("#dhlz-inject-layer-button").find(".dhlz_cancel_button").on("click", function () {
            that.close();
            if (that.cancelFunc) {
                that.cancelFunc();
            }
        });
        $("#dhlz-inject-xpath-content").on("click", function (e) {
            e.stopPropagation();
            e.preventDefault();
        });
        $("#dhlz-inject-xpath-content-wrap").on("click", function () {
            that.close();
            if (that.cancelFunc) {
                that.cancelFunc();
            }
        });
    }
};
