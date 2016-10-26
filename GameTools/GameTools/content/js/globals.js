
//DOM FUNCTION
{
    function D(tag, cls) {
        var t = document.createElement(tag);

        if (typeof cls !== 'undefined') {
            var clsArr = cls.split(' ');
            for (var i = 0; i < clsArr.length; i++) if (clsArr[i].trim() != '') t.classList.add(clsArr[i]);
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
}