if(openDatabase){
        db = openDatabase('ftars_jb' , '1.0' , 'FTARS Jervis Bay' , 2 * 1024 * 1024);
};

var v_getFac_fn = function(e) {
    e.preventDefault; 
    $("#divListAttr").hide(); 
    $("#content").show();
    document.addEventListener("deviceready", function() {document.removeEventListener("backbutton", v_getFac_fn, true);}, false);
};

var v_editAttr_fn = function(e) {
    e.preventDefault; 
    $("#divEditAttr").hide(); 
    $("#content").hide();
    $("#divListAttr").show();
    getFac();
    document.addEventListener("deviceready", function() {document.removeEventListener("backbutton", v_editAttr_fn, false);}, false);
};

var v_addAttr_fn = function(e) {
    e.preventDefault; 
    $("#content").hide();
    $("#divListAttr").show();
    $("#divAddAttr").hide();
    document.addEventListener("deviceready", function() {document.removeEventListener("backbutton", v_addAttr_fn, false);}, false);
    getFac();
};

function addAttr() {
    $("#divAddAttr #frmAddAttr #x_facabbr").val("");
    $("#divAddAttr #frmAddAttr #x_facname").val("");
    document.addEventListener("deviceready", function() {document.addEventListener("backbutton", v_addAttr_fn, false);}, false);
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
                         // Reset the checkboxes
                         $("#divEditAttr #x_facfldtype_n").prop("checked", false).checkboxradio("refresh");
                         $("#divEditAttr #x_facfldtype_a").prop("checked", false).checkboxradio("refresh");
                         $("#divEditAttr #x_facfldtype_r").prop("checked", false).checkboxradio("refresh");
                         if (v_results.rows.item(0).facfldtype == 'N')
                             $("#divEditAttr #x_facfldtype_n").prop("checked", true).checkboxradio("refresh");
                         else if (v_results.rows.item(0).facfldtype == 'A')
                             $("#divEditAttr #x_facfldtype_a").prop("checked", true).checkboxradio("refresh");
                         else if (v_results.rows.item(0).facfldtype == 'R')
                             $("#divEditAttr #x_facfldtype_r").prop("checked", true).checkboxradio("refresh");
                         $("#divEditAttr #x_facvalidcodes").val(v_results.rows.item(0).facvalidcodes);
                     },
                     errorHandler);
    });
    document.addEventListener("deviceready", function() {document.addEventListener("backbutton", v_editAttr_fn, false);}, false);
}

function insFac() {
    var x_facabbr = $("#frmAddAttr #x_facabbr").val();
    var x_facname = $("#frmAddAttr #x_facname").val();
    var x_facfldtype = $("input[name=x_facfldtype]:checked", "#frmAddAttr").val();
    var x_facvalidcodes = $("#frmAddAttr #x_facvalidcodes").val();
    
    db.transaction(function(tx){
               tx.executeSql('INSERT INTO facatr (facabbr, facname, facfldtype, facvalidcodes)'
                           + ' VALUES (?,?,?,?)', [x_facabbr, x_facname, x_facfldtype, x_facvalidcodes],nullData, errorHandler); 
            }); 
}

function updFac() {
    var v_faccode = $("#frmEditAttr #x_faccode").val();
    var v_facabbr = $("#frmEditAttr #x_facabbr").val();
    var v_facname = $("#frmEditAttr #x_facname").val();
    var v_facfldtype = $("input[name=x_facfldtype]:checked", "#frmEditAttr").val();
    var v_facvalidcodes = $("#frmEditAttr #x_facvalidcodes").val();

    db.transaction(function(tx) {
       tx.executeSql('UPDATE facatr SET facabbr = ?, facname = ?, facfldtype = ?, facvalidcodes = ? WHERE faccode = ?',
                     [v_facabbr, v_facname, v_facfldtype, v_facvalidcodes, v_faccode], nullData, errorHandler); 
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
                               v_trdata = "<tr><th>Abbr</th><th>Name</th><th>Type</th><th>Valid values</th><th>&nbsp;</th></tr>";
                               $(v_trdata).appendTo("#divListAttr #tbl_attr_list");
                            }
                            v_trdata = "<tr><td>" + v_results.rows.item(v_count).facabbr + "</td>";
                            v_trdata += "<td>" + v_results.rows.item(v_count).facname + "</td>";
                            v_trdata += "<td>" + (v_results.rows.item(v_count).facfldtype == null ? "&nbsp;" : v_results.rows.item(v_count).facfldtype)+ "</td>";
                            v_trdata += "<td>" + (v_results.rows.item(v_count).facvalidcodes == null ? "&nbsp;" : v_results.rows.item(v_count).facvalidcodes) + "</td>";
                            v_trdata += "<td><button class=\"ui-button ui-btn-inline\" onClick=\"editAttr("+v_results.rows.item(v_count).faccode+");\">Edit</button></td>";
                            v_trdata += "</tr>";
                            $(v_trdata).appendTo("#divListAttr #tbl_attr_list");
                         }
                     }, 
                     errorHandler) ;
    });
    document.addEventListener("deviceready", function() {document.addEventListener("backbutton", v_getFac_fn, false);}, false);
}

