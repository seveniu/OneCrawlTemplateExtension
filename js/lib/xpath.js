/**
 * Created by niu on 2014/5/22.
 */

var xpathUtil = (function () {

    var xpathUtil = {

        /**
         * 根据元素 获取 xpath
         * @param element 元素
         * @returns {string}
         */
        getXpath: function (element, islink) {
            var xx = new Xpath(element);

            if (islink)
                xx.removeAfterATag();

            var xpathStr = xx.toStringFromBody();

            return xpathStr;
        },

        getElementsByXpath: function (xpath, document) {
            if(xpath == null) {
                console.error("xpath is null");
                return
            }
            if(document == null) {
                console.error("document is null");
                return
            }
            var nodes = [];

            try {
                var iterator = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
                var thisNode = iterator.iterateNext();

                while (thisNode) {
                    nodes.push(thisNode);
                    thisNode = iterator.iterateNext();
                }
            }
            catch (e) {
                console.log('Error: Document tree modified during iteration ' + e);
                //alert("xpath 获取失败，页面有错误：" + xpath);
                console.log("xpath error", "xpath 获取失败，页面有错误：" + xpath)
            }
            console.log(nodes);
            return nodes;
        }
    };

    function XpathElement(tag, id, classes, index) {
        this.tag = tag;
        this.id = id;
        this.classes = classes;
        this.index = index;
    }

    /**
     * 带 ID 和 class 的xpath
     * @returns {string}
     */
    XpathElement.prototype.toStringWithIdClass = function () {
        var str = this.tag + "";
        if (this.id)
            str += "[@id='" + this.id + "']";
        if (this.classes)
            str += "[@class='" + this.classes + "']";
        return str;
    };
    /**
     * 带 index 的 xpath
     * @returns {string}
     */
    XpathElement.prototype.toStringWithIndex = function () {
        return this.tag + "[" + this.index + "]";
    };
    function Xpath(domElement) {
        this.xpathElements = [];
        this.domElement = domElement;

        this.getXpathElements(domElement);

    }

    Xpath.prototype.toStringFromBody = function () {
        var xpath = "//";
        for (var i = this.xpathElements.length - 1; i >= 0; i--) {
            var element = this.xpathElements[i];
            if (element.tag == "html")
                continue;
            xpath += element.toStringWithIdClass() + "/";
        }
        return xpath.slice(0, -1);
    };
    Xpath.prototype.toString = function () {
        var xpath = "/";
        for (var i = this.xpathElements.length - 1; i >= 0; i--) {
            var element = this.xpathElements[i];
            xpath += element.toStringWithIdClass() + "/";
        }
        return xpath.slice(0, -1);
    };
    Xpath.prototype.getXpathElements = function (element) {
        // Use nodeName (instead of localName) so namespace prefix is included (if any).
        for (; element && element.nodeType == Node.ELEMENT_NODE; element = element.parentNode) {
            var index = 0;
            for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
                // Ignore document type declaration.
                if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
                    continue;
                if (sibling.nodeName == element.nodeName)
                    ++index;
            }
            var tagName = (element.prefix ? element.prefix + ':' : '') + element.localName;

            var attr = '';
            // 获取 id
            if (element.hasAttribute("id") && element.id.length > 0) {
                attr += "[@id='" + element.id + "']";
            }
            // 获取 class
            if (element.hasAttribute('class') && element.className.length > 0) {
                attr += "[@class='" + element.className + "']";
            }
            // alert(element.className);

            var xElement = new XpathElement(tagName, element.id, element.className, index + 1);
            this.xpathElements.push(xElement);
        }
    };

    Xpath.prototype.getATagIndex = function () {
        for (var i in this.xpathElements) {
            if (this.xpathElements[i].tag === "a")
                return i;
        }
        return -1;
    };
    Xpath.prototype.removeAfterATag = function () {
        var aTagIndex = this.getATagIndex();
        if (aTagIndex != -1) {
            this.xpathElements = this.xpathElements.slice(aTagIndex);
        }
        return this.xpathElements;
    };

    return xpathUtil;
})();
