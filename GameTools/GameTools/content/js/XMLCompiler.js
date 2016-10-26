function openDefault() { window.location = '../default.aspx'; }

$(document).ready(function () {
    buildXMLCompilerPage();
});

var divContainer, tblXML;

function buildXMLCompilerPage() {
    if (!divContainer) {
        divContainer = $('#divContainer')[0];

        tblXML = D('table').appendTo(divContainer);

        var tr = D('tr', 'headerRow underline').appendTo(tblXML);
        var td = D('td').html('hello').appendTo(tr);
    }
}