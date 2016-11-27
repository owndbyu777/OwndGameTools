function openDefault() { window.location = '../default.aspx'; }

$(document).ready(function () {
    buildXMLCompilerPage();
});

var divContainer, tblXML;

function updateColumnValues() {
    tblXML.updateCols();
}

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

        var btnLoad = D('button', '', '', 'Load XML', { 'type': 'button' });
        btnLoad.onclick = function () {
            GameTools.XMLCompiler.XMLCompiler.loadXML(JSON.stringify({ filePath: document.getElementById('txbFilePath').value }), function (rsp) {
                if (!rsp.error) {
                    var objRsp = JSON.parse(rsp.value);
                    if (objRsp.success) {
                        //Clear table
                        tblXML.clearAll();

                        // loop through first row, get the names of the variables and set up the protorow and protocols
                        var a = objRsp.arr;
                        var nameArr = new Array();

                        tblXML.addRow(-1, { isProto: true, addCol: false });
                        for (var prop in a[0]) {
                            if (a[0].hasOwnProperty(prop)) {
                                tblXML.addCol(-1, { name: prop });
                                nameArr.push(prop);
                            }
                        }
                        // loop through rows, creating them and creating the cols. setting the values of the cols as it goes.

                        for (var iRow = 0; iRow < a.length; iRow++) {
                            var r = tblXML.addRow(-1, {});

                            for (var iCol = 0; iCol < r.cols.length; iCol++) {
                                r.cols[iCol].name = nameArr[iCol];
                                r.cols[iCol].value = a[iRow][nameArr[iCol]];
                                r.cols[iCol].update();
                            }
                        }
                        //window.alert(objRsp.array);
                    } else {
                        //error
                        window.alert(objRsp.error);
                    }
                } else {
                    //error
                    window.alert("error");
                }
            }, null, null, function () { window.alert("error"); }, function () { window.alert("error"); });
        }
        btnLoad.appendTo(divContainer);

        var btnSave = D('button', '', '', 'Save', { 'type': 'button' });
        btnSave.onclick = function () {
            var obj = tblXML.buildSaveObj();
            obj.filePath = document.getElementById('txbFilePath').value;
            GameTools.XMLCompiler.XMLCompiler.saveXML(JSON.stringify(obj), function (rsp) {
                if (!rsp.error) {
                    var objRsp = JSON.parse(rsp.value);
                    if (objRsp.success) {
                    } else {
                        //error
                        window.alert("fail: " + objRsp.error);
                    }
                } else {
                    //error
                    window.alert("error");
                }
            }, null, null, function () { window.alert("error"); }, function () { window.alert("error"); });
        }
        btnSave.appendTo(divContainer);

        var btnEditCols = D('button', '', '', 'Edit Cols', { 'type': 'button' });
        btnEditCols.onclick = function () {
            tblXML.editCols();
        }
        btnEditCols.appendTo(divContainer);

        var pBreak = D('p').appendTo(divContainer);

        var txbFilePath = D('input', '', '', '', { 'type': 'text', 'id': 'txbFilePath' });
        txbFilePath.value = 'C:\\Users\\David\\Desktop\\Games\\xmlfile.xml';
        txbFilePath.style.width = '400px';
        txbFilePath.appendTo(divContainer);

        tblXML = new XMLTable();
        tblXML.getControl().appendTo(divContainer);
        tblXML.addRow(-1, { isProto: true });
    }

    setupSelectable();
}

function setupSelectable() {
    $('table.xml').selectable({
        filter: 'td.xml:not(.proto)',
        stop: function (event, ui) {
            //Get selected cols
            var $selectableRows = $('tr.xml', this);

            // Map row index
            var arrCoords = new Array();
            var arrRowIdx = new Array();
            var arrColIdx = new Array();
            $selectableRows.each(function (rowIdx, element) {
                //Map colIndex
                var $selectableCols = $('td.xml', this);
                var $selectedCols = $('.ui-selected', this);
                if ($selectedCols.length > 0) {
                    arrRowIdx.push(rowIdx);
                    $selectedCols.each(function (index, element) {
                        var colIdx = $selectableCols.index(this);
                        if (arrColIdx.indexOf(colIdx) == -1) arrColIdx.push(colIdx);

                        arrCoords.push(new Coordinate2D(colIdx, rowIdx - 1));
                    })
                }
            });
            tblXML.selectedCoords = arrCoords;
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
        t.protoRow = null;
        t.protoCols = new Array();

        t.selectedCoords = new Array();
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
                var r;
                if (obj.isProto) {
                    if (t.protoCols.length > 0 || t.protoRow != null) throw new Error('Cannot add a protoRow once one exists');

                    t.protoRow = new XMLRow(obj);
                    r = t.protoRow; 

                    t.append(t.protoRow.getControl());
                    if (typeof obj.addCol == 'undefined' || obj.addCol == true) t.addCol(-1, {});
                } else {
                    //Process the index
                    if (index != -1) {
                        if (index > t.rows.length) {
                            index = -1;
                        }
                    }

                    //Add row
                    r = new XMLRow(obj);
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
                        r.addCol(-1, t.protoCols[i].getProtoColData());
                    }
                }
                
                setupSelectable();

                return r;
            }

            t.addCol = function (colIndex, obj) {
                //Process the index
                if (colIndex != -1) {
                    if (colIndex > t.protoCols.length) {
                        colIndex = -1;
                    }
                }

                //Add col
                if (obj.isProto) throw new Error('Cannot have the isProto flag set while creating a col');

                var c = new XMLCol(obj);
                c.isProto = true;
                if (colIndex == -1) {
                    t.protoCols.push(c);
                    t.protoRow.append(c.getControl());
                } else {
                    t.protoCols.splice(colIndex, 0, c);
                    t.protoRow.insert(c.getControl(), colIndex);
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
                    $(t.protoCols[index].getControl()).remove();
                    t.protoCols.splice(index, 1);
                }
                t.selectedCols = new Array();
            }

            t.updateCols = function () {
                //loop through all cols setting name to the respective protoCols name
                for (var rowI = 0; rowI < t.rows.length; rowI++) {
                    if (t.rows[rowI].isProto) continue;
                    var cols = t.rows[rowI].cols;
                    for (var colI = 0; colI < cols.length; colI++) {
                        cols[colI].name = t.protoCols[colI].name;
                        cols[colI].updateValues();
                    }
                }
            }

            t.editCols = function () {
                for (var i = 0; i < t.selectedCoords.length; i++) {
                    var colIdx = t.selectedCoords[i].x;
                    var rowIdx = t.selectedCoords[i].y;
                    t.rows[rowIdx].cols[colIdx].startEditing();
                }
            }

            t.clearAll = function () {
                t.rows = new Array();
                t.protoRow = null;
                t.protoCols = new Array();

                t.selectedCoords = new Array();
                t.selectedRows = new Array();
                t.selectedCols = new Array();

                $(t.control).empty();
            }
        }

        //DOM FUNCTIONS
        {
            t.append = function (dom) {
                t.control.append(dom);
            }
        }

        //SAVE/LOAD/EDIT FUNCTIONS
        {
            t.buildSaveObj = function () {
                var protoColData = new Array();
                for (var i = 0; i < t.protoCols.length; i++) {
                    protoColData.push(t.protoCols[i].getProtoColData().name); //TODO: DW 27/11/16 When converting to the protoCols having heaps of cool stuff, extend this and the backend
                }

                var rowData = new Array();
                for (var i = 0; i < t.rows.length; i++) {
                    if (t.rows[i].canSave()) rowData.push(t.rows[i].getRowData());
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

        t.isProto = false;
        t.cols = new Array();

        $.extend(t, obj);

        t.getControl = function () {
            if (!t.control) {
                t.control = D('tr', 'xml');
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

                //Add extra properties to it
                c.isProto = t.isProto;

                if (index == -1) {
                    t.cols.push(c);
                    t.append(c.getControl());
                } else {
                    t.cols.splice(index, 0, c);
                    t.insert(c.getControl(), index);
                }
            }

            t.getFieldsForColumn = function () {
                return { isProto: t.isProto };
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
            t.canSave = function () {
                return !t.isProto;
            }

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
            if (t.isProto) return getProtoControl();
            else return getNormalControl();
        }

        var getProtoControl = function () {
            if (!t.control) {
                t.control = D('td', 'xml proto');
                t.divSelect = D('div', 'sel');
                t.txbName = D('input', '', '', '', { 'type': 'text' });

                t.control.append(t.divSelect.append(t.txbName));
            }

            t.txbName.value = t.name;
            t.txbName.onchange = function () { t.name = t.txbName.value; t.updateValues(); }

            return t.control;
        }

        var getNormalControl = function () {
            if (!t.control) {
                t.control = D('td', 'xml');
                t.divSelect = D('div', 'sel').appendTo(t.control);

                t.spnTitle = D('span', '', '', t.name + '_' + t.value).appendTo(t.divSelect);

                t.txbValue = D('input', '', '', '', { 'type': 'text' }).appendTo(t.divSelect);
                t.txbValue.style.display = 'none';

                t.control
                    .append(t.divSelect
                        .append(t.spnTitle)
                        .append(t.txbValue)
                    );
            }

            t.txbValue.value = t.value;
            t.txbValue.onchange = function () { t.value = t.txbValue.value; t.updateValues(); }
            t.txbValue.onkeypress = function (event) {
                if (event.charCode == 13) {
                    event.preventDefault();
                    var inputs = $('input:visible, select:visible, textarea:visible');
                    if (inputs.length > 1 && inputs[inputs.index(this) + 1]) inputs[inputs.index(this) + 1].focus();
                    t.stopEditing();
                }
            }

            return t.control;
        }

        t.getProtoObj = function () {
            return { isHeader: t.isHeader }
        }

        t.updateValues = function () {
            if (t.isProto) {
                updateColumnValues();
            } else {
                t.spnTitle.html(t.name + '_' + t.value);
            }
        }

        t.startEditing = function () {
            if (t.isProto) {
                throw new Error('XMLCol.startEditing -> isProto == true || NOT IMPLEMENTED');
            } else {
                t.txbValue.style.display = 'initial';
                t.spnTitle.style.display = 'none';
            }
        }

        t.stopEditing = function () {
            if (t.isProto) {
                throw new Error('XMLCol.stopEditing -> isProto == true || NOT IMPLEMENTED');
            } else {
                t.txbValue.style.display = 'none';
                t.spnTitle.style.display = 'initial';
            }
        }

        //DOM FUNCTIONS
        {
            t.append = function (dom) {
                t.control.append(dom);
            }

            t.update = function () {
                t.spnTitle.innerHTML = t.name + '_' + t.value;
                t.txbValue.value = t.value;
            }
        }

        //SAVE FUNCTIONS
        {
            t.getProtoColData = function () {
                return { name: t.name };
            }

            t.getColData = function () {
                return t.value;
            }
        }
    }
}

function Coordinate2D(x, y) {
    var t = this;

    t.x = x;
    t.y = y;

    t.get = function () {
        return { 'x': t.x, 'y': t.y };
    }

    return t;
}