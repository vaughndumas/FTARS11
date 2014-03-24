if(openDatabase){
        db = openDatabase('ftars_jb' , '1.0' , 'FTARS Jervis Bay' , 2 * 1024 * 1024);
};

function addGp() {
    $("#divAddGp #frmAddGp #x_fadabbr").val("");
    $("#divAddGp #frmAddGp #x_fadname").val("");
}

function editGp(x_fadcode) {
    $("#divListGp").hide();
    $("#divEditGp").show();
    db.transaction(function(tx) {
       tx.executeSql('SELECT * FROM fadgrp WHERE fadcode = ?', [x_fadcode],
                     function(tx, v_results) {
                         $("#divEditGp #x_fadcode").val(v_results.rows.item(0).fadcode);
                         $("#divEditGp #x_fadabbr").val(v_results.rows.item(0).fadabbr);
                         $("#divEditGp #x_fadname").val(v_results.rows.item(0).fadname);
                     },
                     errorHandler);
    });
}

function editGpAttr(x_fadcode) {
    $("#divListGp").hide();
    $("#divGpAttr").show();


    // Get the group details
    $("#divGpAttr #tbl_link_attr").empty();
    db.transaction(function(tx) {
       tx.executeSql('SELECT * FROM fadgrp WHERE fadcode = ?', [x_fadcode],
                     function(tx, v_results) {
                         $("#divGpAttr #x_fadname").val(v_results.rows.item(0).fadname);
                     },
                     errorHandler);
        
        $("#divGpAttr #x_fbagroupcode").val(x_fadcode);
        // Get all the existing group attribute records
        tx.executeSql('SELECT faccode, facname FROM fbagpa, facatr '
                    + 'WHERE fbagroupcode = ? '
                    + 'AND faccode = fbaattrcode', [x_fadcode],
                    function(tx, v_results) {
                        var v_rowcount = v_results.rows.length;
                        $("<tr><th>Attribute</th><th>Link?</th></tr>").appendTo("#divGpAttr #tbl_link_attr");
                        for (v_count = 0; v_count < v_rowcount; v_count ++) {
                            v_trdata = "<tr><td>" 
                                    + "<input type=hidden name=x_faccode value='"+v_results.rows.item(v_count).faccode + "'/>"
                                    + v_results.rows.item(v_count).facname + "</td>";
                            v_trdata += "<td>";
                            v_trdata += "<input type=checkbox data-role=flipswitch id='flip-checkbox-b'"+v_count+"' name='flip-checkbox-b' data-on-text='Yes' data-off-text='No' checked=''>";
                            v_trdata += "</td>";
                            v_trdata += "</tr>";
                            $(v_trdata).appendTo("#tbl_link_attr").trigger("create");
                        }
                    },
                    errorHandler);
        // Get the rest of the attribute records that are not yet linked
        tx.executeSql('SELECT faccode, facname FROM facatr WHERE faccode NOT IN (SELECT fbaattrcode FROM fbagpa WHERE fbagroupcode = ?)', [x_fadcode],
                    function(tx, v_results) {
                        var v_rowcount = v_results.rows.length;
                        for (v_count = 0; v_count < v_rowcount; v_count ++) {
                            v_trdata = "<tr><td>"
                                    + "<input type=hidden name=x_faccode value='"+v_results.rows.item(v_count).faccode + "'/>"
                                    + v_results.rows.item(v_count).facname + "</td>"
                            v_trdata += '<td>';
                            v_trdata += '<input type=checkbox data-role=flipswitch id="flip-checkbox-a'+v_count+'" name="flip-checkbox-a" data-on-text="Yes" data-off-text="No"/>';
                            v_trdata += '</td>';
                            v_trdata += '</tr>';
                            $(v_trdata).appendTo("#tbl_link_attr").trigger("create");
                        }
                    }, errorHandler);


    });
    
}

function updGpAttr() {
    var v_attrcode = '';
    var v_groupcode = $("#divGpAttr #x_fbagroupcode").val();
    db.transaction(function(tx) {
       // Remove existing values for this group
       tx.executeSql('DELETE FROM fbagpa WHERE fbagroupcode = ?', [v_groupcode], nullData, errorHandler);
       // before inserting new ones.
       $("#divGpAttr #tbl_link_attr tr").each(function(v_count_tr) {
          v_attrcode = '';
          $(this).children("td").each(function() {
            // Second TD is a div
            $(this).children("input").each(function() {
               v_attrcode = $(this).attr("value"); 
            });
            $(this).children("div .ui-flipswitch-active").each(function() {
//                alert("Row " + v_count_tr + " for attribute " + v_attrcode + " has been selected:" + $(this).prop("class"));
                // Insert this combination into fbagpa
                tx.executeSql('INSERT INTO fbagpa (fbagroupcode, fbaattrcode) '
                            + ' VALUES (?, ?)', [v_groupcode, v_attrcode], nullData, errorHandler);
            });
          });
       });
    });
}

function insFad() {
    var x_fadabbr = $("#frmAddGp #x_fadabbr").val();
    var x_fadname = $("#frmAddGp #x_fadname").val();
    
    db.transaction(function(tx){
               tx.executeSql('INSERT INTO fadgrp (fadabbr, fadname)'
                           + ' VALUES (?,?)', [x_fadabbr, x_fadname],nullData, errorHandler); 
            }); 
}

function updFad() {
    var v_fadcode = $("#frmEditGp #x_fadcode").val();
    var v_fadabbr = $("#frmEditGp #x_fadabbr").val();
    var v_fadname = $("#frmEditGp #x_fadname").val();

    db.transaction(function(tx) {
       tx.executeSql('UPDATE fadgrp SET fadabbr = ?, fadname = ? WHERE fadcode = ?',
                     [v_fadabbr, v_fadname, v_fadcode], nullData, errorHandler); 
    });

}

function getFad() {
    $("#divListGp #tbl_gp_list").empty();
    db.transaction(function(tx) {
       tx.executeSql('SELECT * FROM fadgrp ORDER BY fadabbr',
                     [],
                     function(tx, v_results) {
                         var v_rowcount = v_results.rows.length; 
                         for (v_count = 0; v_count < v_rowcount; v_count ++) {
                            if (v_count == 0) {
                               v_trdata = "<tr><th>Abbr</th><th>Name</th><th>&nbsp;</th></tr>";
                               $(v_trdata).appendTo("#divListGp #tbl_gp_list");
                            }
                            v_trdata = "<tr><td>" + v_results.rows.item(v_count).fadabbr + "</td>";
                            v_trdata += "<td>" + v_results.rows.item(v_count).fadname + "</td>";
                            v_trdata += "<td><button class=\"ui-button ui-btn-inline\" onClick=\"editGp("+v_results.rows.item(v_count).fadcode+");\">Edit</button>";
                            v_trdata += "&nbsp;<button class=\"ui-button ui-btn-inline\" onClick=\"editGpAttr("+v_results.rows.item(v_count).fadcode+");\">Attributes</button></td>";
                            v_trdata += "</tr>";
                            $(v_trdata).appendTo("#divListGp #tbl_gp_list");
                         }
                     }, 
                     errorHandler) ;
    });
}

