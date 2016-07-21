var ResultPopup = function () {
    var popup = '' +
        '<div id="dhlz-inject-xpath-content-wrap" style="" >' +
        '<div id="dhlz-inject-xpath-content" style="">' +
        '<div id="dhlz-inject-layer-button" style="">' +
        '<button class="dhlz-inject-button  dhlz-inject-button-close">关闭</button>' +
        // '<button class="dhlz-inject-button  dhlz-inject-button-confirm">确认</button>' +
        // '<button class="dhlz-inject-button  dhlz-inject-button-cancel">取消</button>' +
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
        $("#dhlz-inject-layer-button").find(".dhlz-inject-button-confirm").on("click", function () {
            that.close();
            if (that.confirmFunc) {
                that.confirmFunc();
            }
        });
        $("#dhlz-inject-layer-button").find(".dhlz-inject-button-close").on("click", function () {
            that.close();
        });
        $("#dhlz-inject-layer-button").find(".dhlz-inject-button-cancel").on("click", function () {
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
        $('#dhlz-inject-xpath-content-html').on('DOMMouseScroll mousewheel', function (e) {
            var $this = $(this),
                scrollTop = this.scrollTop,
                scrollHeight = this.scrollHeight,
                height = $this.height(),
                delta = (e.type == 'DOMMouseScroll' ?
                e.originalEvent.detail * -40 :
                    e.originalEvent.wheelDelta),
                up = delta > 0;

            var prevent = function () {
                e.stopPropagation();
                e.preventDefault();
                e.returnValue = false;
                return false;
            };

            if (!up && -delta > scrollHeight - height - scrollTop) {
                // Scrolling down, but this will take us past the bottom.
                $this.scrollTop(scrollHeight);
                return prevent();
            } else if (up && delta > scrollTop) {
                // Scrolling up, but this will take us past the top.
                $this.scrollTop(0);
                return prevent();
            }
        });
    }
};
