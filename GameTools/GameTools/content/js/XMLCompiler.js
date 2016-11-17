function openDefault() { window.location = '../default.aspx'; }

$(document).ready(function () {
    buildXMLCompilerPage();
});

var divContainer, tblXML;

function buildXMLCompilerPage() {
    if (!divContainer) {
        divContainer = $('#divContainer')[0];

        var btnAddRow = D('button', '', '', 'Add Row', { 'type': 'button' });
        btnAddRow.onclick = function () {
            tblXML.addRow(-1, { isHeader: false });
        }
        btnAddRow.appendTo(divContainer);

        var btnAddCol = D('button', '', '', 'Add Col', { 'type': 'button' });
        btnAddCol.onclick = function () {
            tblXML.addCol(-1, { isHeader: false });
        }
        btnAddCol.appendTo(divContainer);

        var btnRemoveRow = D('button', '', '', 'Remove Row', { 'type': 'button' });
        btnRemoveRow.onclick = function () {
            tblXML.removeRows();
        }
        btnRemoveRow.appendTo(divContainer);

        var btnRemoveCol = D('button', '', '', 'Remove Col', { 'type': 'button' });
        btnRemoveCol.onclick = function () {
            tblXML.removeCols();
        }
        btnRemoveCol.appendTo(divContainer);

        tblXML = new XMLTable();
        tblXML.getControl().appendTo(divContainer);
        tblXML.addRow(-1, { isHeader: true });
        tblXML.addCol(-1, {});
    }

    setupSelectable();

    GameTools.XmlCompiler.saveXML(function (rsp) {
        window.alert(rsp);
    }, null, null, function () { /*error*/ }, function () {/*error*/ });
}

function setupSelectable() {
    $('table.xml').selectable({
        filter: 'td.xml',
        stop: function (event, ui) {
            //Get selected cols
            var $selectableRows = $('tr.xml', this);

            // Map row index
            var arrRowIdx = new Array();
            var arrColIdx = new Array();
            $selectableRows.each(function (index, element) {
                //Map colIndex
                var $selectableCols = $('td.xml', this);
                var $selectedCols = $('.ui-selected', this);
                if ($selectedCols.length > 0) {
                    arrRowIdx.push(index);
                    $selectedCols.each(function (index, element) {
                        arrColIdx.push($selectableCols.index(this));
                    })
                }
            });
            tblXML.selectedRows = arrRowIdx;
            tblXML.selectedCols = arrColIdx;
        }
    });
}

//TABLE
{
    function XMLTable(obj) {
        var t = this;

        t.rows = new Array();
        t.protoCols = new Array();

        t.selectedCols = new Array();
        t.selectedRows = new Array();

        $.extend(t, obj);

        t.getControl = function () {
            if (!t.control) {
                t.control = D('table', 'xml');
            }

            return t.control;
        }

        //ROW/COL functions
        {
            /// <summary>Adds a row to the table. An index of -1 adds the row to the end, any other index attempts to insert the row at that index.</summary>
            t.addRow = function (index, obj) {
                //Process the index
                if (index != -1) {
                    if (index > t.rows.length) {
                        index = -1;
                    }
                }

                //Add row
                var r = new XMLRow(obj);
                //Add cols to row
                if (index == -1) {
                    //Push
                    t.rows.push(r);
                } else {
                    //Insert
                    t.rows.splice(index, 0, r);
                }
                t.append(r.getControl());
                for (var i = 0; i < t.protoCols.length; i++) {
                    r.addCol(-1, t.protoCols[i].getProtoObj());
                }
                setupSelectable();
            }

            t.addCol = function (colIndex, obj) {
                //Process the index
                if (colIndex != -1) {
                    if (colIndex > t.protoCols.length) {
                        colIndex = -1;
                    }
                }

                //Add col
                var c = new XMLCol(obj);
                c.isProto = true;
                if (colIndex == -1) {
                    t.protoCols.push(c);
                } else {
                    t.protoCols.splice(colIndex, 0, c);
                }

                //Add col to rows
                for (var i = 0; i < t.rows.length; i++) {
                    t.rows[i].addCol(colIndex, obj);
                }
                setupSelectable();
            }

            t.removeRows = function () {
                if (t.selectedRows.length == t.rows.length) {
                    throw new Error("There must be at least 1 row at all times. You cannot delete them all.");
                    return false;
                }
                for (var i = t.selectedRows.length - 1; i >= 0; i--) {
                    var index = t.selectedRows[i];
                    $(t.rows[index].getControl()).remove();
                    t.rows.splice(index, 1);
                }
                t.selectedRows = new Array();
            }

            t.removeCols = function () {
                //Validate
                if (t.selectedCols.length == t.protoCols.length) {
                    throw new Error("There must be at least 1 column at all times. You cannot delete them all.");
                    return false;
                }
                //Remove cols
                for (var icols = t.selectedCols.length - 1; icols >= 0; icols--) {
                    var index = t.selectedCols[icols];
                    for (var i = 0; i < t.rows.length; i++) {
                        $(t.rows[i].cols[index].getControl()).remove();
                        t.rows[i].cols.splice(index, 1);
                    }
                    t.protoCols.splice(index, 1);
                }
                t.selectedCols = new Array();
            }
        }

        //DOM FUNCTIONS
        {
            t.append = function (dom) {
                t.control.append(dom);
            }
        }

        //SAVE FUNCTIONS
        {
            t.buildSaveObj = function () {
                var protoColData = new Array();
                for (var i = 0; i < t.protoCols.length; i++) {
                    protoColData.push(t.protoCols[i].getProtoColData());
                }

                var rowData = new Array();
                for (var i = 0; i < t.rows.length; i++) {
                    rowData.push(t.rows[i].getRowData());
                }

                return { protoCols: protoColData, rows: rowData };
            }
        }
    }
}

//ROW
{
    function XMLRow(obj) {
        var t = this;

        t.isHeader = false;
        t.cols = new Array();

        $.extend(t, obj);

        t.getControl = function () {
            if (!t.control) {
                t.control = D('tr', 'xml');

                if (t.isHeader) t.control.classList.add('headerRow');
            }

            return t.control;
        }

        t.getControlCols = function () {
            return $(t.getControl()).find('td');
        }

        //COL FUNCTIONS
        {
            t.addCol = function (index, obj) {
                //Process the index
                if (index != -1) {
                    if (index > t.cols.length) {
                        index = -1;
                    }
                }

                //Add col
                var c = new XMLCol(obj);
                if (index == -1) {
                    t.cols.push(c);
                    t.append(c.getControl());
                } else {
                    t.cols.splice(index, 0, c);
                    t.insert(c.getControl(), index);
                }
            }

            t.getFieldsForColumn = function () {
                return { isHeader: t.isHeader };
            }
        }

        //DOM FUNCTIONS
        {
            t.append = function (dom) {
                t.getControl().append(dom);
            }

            t.insert = function (dom, index) {
                $(dom).insertAfter(t.getControlCols().eq(index));
            }
        }
        
        //SAVE FUNCTIONS
        {
            t.getRowData = function () {
                var colData = new Array();
                for (var i = 0; i < t.cols.length; i++) {
                    colData.push(t.cols[i].getColData());
                }
                return { cols: colData };
            }
        }
    }
}

//COL
{
    function XMLCol(obj) {
        var t = this;

        t.isHeader = false;
        t.isProto = false;

        t.name = 'selectable';
        t.value = 'select me';

        $.extend(t, obj);

        t.getControl = function () {
            if (!t.control) {
                t.control = D('td', 'xml');
                t.divSelect = D('div', 'sel').appendTo(t.control).html(t.value);
            }

            return t.control;
        }

        t.getProtoObj = function () {
            return { isHeader: t.isHeader }
        }

        //DOM FUNCTIONS
        {
            t.append = function (dom) {
                t.control.append(dom);
            }
        }

        //SAVE FUNCTIONS
        {
            t.getProtoColData = function () {
                return t.name;
            }

            t.getColData = function () {
                return t.value;
            }
        }
    }
}