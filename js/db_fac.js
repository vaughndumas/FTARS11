if(openDatabase){
        db = openDatabase('ftars_jb' , '1.0' , 'FTARS Jervis Bay' , 2 * 1024 * 1024);
};

function addAttr() {
    $("#divAddAttr #frmAddAttr #x_facabbr").val("");
    $("#divAddAttr #frmAddAttr #x_facname").val("");
}

function editAttr(x_faccode) {
    $("#divListAttr").hide();
    $("#divEditAttr").show();
    // Get the FAC data
    db.transaction(function(tx) {
       tx.executeSql('SELECT * FROM facatr WHERE faccode = ?', [x_faccode],
                     function(tx, v_results) {
                         $("#divEditAttr #x_faccode").val(v_results.rows.item(0).faccode);
                         $("#divEditAttr #x_facabbr").val(v_results.rows.item(0).facabbr);
                         $("#divEditAttr #x_facname").val(v_results.rows.item(0).facname);
                     },
                     errorHandler);
    });
}

function insFac() {
    var x_facabbr = $("#frmAddAttr #x_facabbr").val();
    var x_facname = $("#frmAddAttr #x_facname").val();
    
    db.transaction(function(tx){
               tx.executeSql('INSERT INTO facatr (facabbr, facname)'
                           + ' VALUES (?,?)', [x_facabbr, x_facname],nullData, errorHandler); 
            }); 
}

function updFac() {
    var v_faccode = $("#frmEditAttr #x_faccode").val();
    var v_facabbr = $("#frmEditAttr #x_facabbr").val();
    var v_facname = $("#frmEditAttr #x_facname").val();

    db.transaction(function(tx) {
       tx.executeSql('UPDATE facatr SET facabbr = ?, facname = ? WHERE faccode = ?',
                     [v_facabbr, v_facname, v_faccode], nullData, errorHandler); 
    });

}

function getFac() {
    $("#divListAttr #tbl_attr_list").empty();
    db.transaction(function(tx) {
       tx.executeSql('SELECT * FROM facatr ORDER BY facabbr',
                     [],
                     function(tx, v_results) {
                         var v_rowcount = v_results.rows.length; 
                         for (v_count = 0; v_count < v_rowcount; v_count ++) {
                            if (v_count == 0) {
                               v_trdata = "<tr><th>Abbr</th><th>Name</th><th>&nbsp;</th></tr>";
                               $(v_trdata).appendTo("#divListAttr #tbl_attr_list");
                            }
                            v_trdata = "<tr><td>" + v_results.rows.item(v_count).facabbr + "</td>";
                            v_trdata += "<td>" + v_results.rows.item(v_count).facname + "</td>";
                            v_trdata += "<td><button class=\"ui-button ui-btn-inline\" onClick=\"editAttr("+v_results.rows.item(v_count).faccode+");\">Edit</button></td>";
                            v_trdata += "</tr>";
                            $(v_trdata).appendTo("#divListAttr #tbl_attr_list");
                         }
                     }, 
                     errorHandler) ;
    });
}

