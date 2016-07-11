/**
 * Created by JetBrains PhpStorm.
 * User: martin
 * Date: 11/10/11
 * Time: 11:46 PM
 * To change this template use File | Settings | File Templates.
 */


// 提示信息类
var _msgs_array = new Array();


// 对齐两个并列的Float Div
// Example: $.handleVAlign("#v1","#v2");
$.extend({
    handleVAlign: function (div1, div2) {
        var v1 = $(div1).height();
        var v2 = $(div2).height();
        if (v1 < v2) {
            $(div1).height(v2);
        } else {
            $(div2).height(v1);
        }

    }
});


// 把一个Div屏幕垂直居中
// Example: $.windowVAlign("#main");
//
//  $(window).resize(function(){  // 当调整窗口的时候动态修正位置
//      $.windowVAlign("#main");
//  });
$.extend({
    windowVAlign: function (centered) {

        var bodyheight = $(window).height(),  //获得屏幕高度
            bodywidth = $(window).width(),   //获得屏幕宽度
            wrapwidth = $(centered).width(),  //要垂直居中的内容的宽度
            wrapheight = $(centered).height();  //要垂直居中的内容的高度度

        postop = (bodyheight - wrapheight) / 2;  // 获取顶部的position
        posleft = (bodywidth - wrapwidth) / 2;  // 获取左边部的position

        $(centered).css({"position": "absolute", "width": "100%", "text-align": "center", "display": "inline-block", "vertical-align": "middle", "left": posleft + "px", "top": postop + "px"});  // 设置position

    }
});

// 显示信息并消隐
// Example: $.showTips("#div1","Hello");
$.extend({
    showTips: function (sel, tips, height, time) {
        var windowWidth = document.documentElement.clientWidth;
        var tipsDiv = '<div class="tipsClass">' + tips + '</div>';

        $(sel).append(tipsDiv);
        setTimeout(function () {
            $('div.tipsClass').fadeOut();
        }, ( time * 1000 ));
    }
});


// 文本框文本域提示文字的自动显示与隐藏

//    HTML代码：
//    <h4>最简单的切换</h4>
//    <p><input class="remind" type="text" size="45" value="请出入姓名" /></p>
//    <p><textarea class="textarea remind">内容不少于300字</textarea></p>
//    <h4>外带class的切换</h4>
//    <p><textarea class="textarea borderChange">变换边框颜色</textarea></p>
//    <h4>改变显示的颜色</h4>
//    <p><input id="textColorChg" type="text" size="45" value="请输入日期..." /></p>
//    JS代码：
//    $(function(){
//        $(".remind").textRemind();
//        $(".borderChange").textRemind({chgClass: "border"});
//        $("#textColorChg").textRemind({
//            focusColor: "red"
//        });
//    });;
(function ($) {
    $.fn.textRemind = function (options) {
        options = options || {};
        var defaults = {
            blurColor: "#999",
            focusColor: "#238ed7",
            auto: true,
            chgClass: ""
        };
        var settings = $.extend(defaults, options);
        $(this).each(function () {
            if (defaults.auto) {
                $(this).css("color", settings.blurColor);
            }
            var v = $.trim($(this).val());
            if (v) {
                $(this).focus(
                    function () {
                        if ($.trim($(this).val()) === v) {
                            $(this).val("");
                        }
                        $(this).css("color", settings.focusColor);
                        if (settings.chgClass) {
                            $(this).toggleClass(settings.chgClass);
                        }
                    }).blur(function () {
                        if ($.trim($(this).val()) === "") {
                            $(this).val(v);
                        }
                        $(this).css("color", settings.blurColor);
                        if (settings.chgClass) {
                            $(this).toggleClass(settings.chgClass);
                        }
                    });
            }
        });
    };
})(jQuery);


// 延期的鼠标悬停
// $("#test").hoverDelay({
//    hoverEvent: function(){
//        alert("经过我！");
//    }
// });
(function ($) {
    $.fn.hoverDelay = function (options) {
        var defaults = {
            hoverDuring: 200,
            outDuring: 200,
            hoverEvent: function () {
                $.noop();
            },
            outEvent: function () {
                $.noop();
            }
        };
        var sets = $.extend(defaults, options || {});
        var hoverTimer, outTimer;
        return $(this).each(function () {
            $(this).hover(function () {
                clearTimeout(outTimer);
                hoverTimer = setTimeout(sets.hoverEvent, sets.hoverDuring);
            }, function () {
                clearTimeout(hoverTimer);
                outTimer = setTimeout(sets.outEvent, sets.outDuring);
            });
        });
    }
})(jQuery);


// Form序列化方法toJSON
$.fn.popJson = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

// JSON序列化到Form
$.fn.pushJson = function (json) {
    $form = this;
    $.each(json, function (key, value) {
        var $ctrl = $form.find('[name=' + key + ']');
        if ($ctrl.is('select')) {
            $('option', $ctrl).each(function () {
                if (this.value == value)
                    this.selected = true;
            });
        } else if ($ctrl.is('textarea')) {
            $ctrl.val(value);
        } else {
            switch ($ctrl.attr("type")) {
                case "text":
                case "hidden":
                    $ctrl.val(value);
                    break;
                case "checkbox":
                    if (value == '1')
                        $ctrl.prop('checked', true);
                    else
                        $ctrl.prop('checked', false);
                    break;
            }
        }
    });

};

