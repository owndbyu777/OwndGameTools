
//DOM FUNCTION
{
    function D(tag, cls, stl, htm, attr) {
        var t = document.createElement(tag);

        if (typeof cls !== 'undefined' && cls != '') {
            var clsArr = cls.split(' ');
            for (var i = 0; i < clsArr.length; i++) if (clsArr[i].trim() != '') t.classList.add(clsArr[i]);
        }
        if (typeof stl !== 'undefined' && stl != '') {
            throw new Error("STYLE NOT IMPLEMENTED");
        }
        if (typeof htm !== 'undefined' && htm != '') {
            t.innerHTML = htm;
        }
        if (typeof attr !== 'undefined' && attr != '') {
            for (var key in attr) {
                // skip loop if the property is from prototype
                if (!attr.hasOwnProperty(key)) continue;

                t.setAttribute(key, attr[key]);
            }
        }

        t.append = function (dom) {
            t.appendChild(dom);
            return t;
        }
        t.appendTo = function (dom) {
            dom.appendChild(t);
            return t;
        }
        t.html = function (_html) {
            t.innerHTML = _html;
            return t;
        }

        return t;
    }

    //function H(tag, cls, stl, htm, attr) {
    //    var t = D(tag, cls, stl, htm, attr);

    //    t.on = function (type, fn) {
    //        t.addEventListener(type, fn);
    //    }
    //}
}