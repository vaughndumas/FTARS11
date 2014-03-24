if(openDatabase){
        db = openDatabase('ftars_jb' , '1.0' , 'FTARS Jervis Bay' , 2 * 1024 * 1024);
};

function editSpecies(x_fabcode) {
    $("#divSetupSpecies").hide();
    $("#divEditSpecies").show();
    // Get the FAB data
    db.transaction(function(tx) {
       tx.executeSql('SELECT * FROM fabspe WHERE fabcode = ?', [x_fabcode],
                     function(tx, v_results) {
                         $("#divEditSpecies #x_fabcode").val(v_results.rows.item(0).fabcode);
                         $("#divEditSpecies #x_fababbr").val(v_results.rows.item(0).fababbr);
                         $("#divEditSpecies #x_fabname").val(v_results.rows.item(0).fabname);
                         if (v_results.rows.item(0).fabdefault === "Y") {
                            $("input:radio[name=x_fabdefault]:nth(0)", "#frmEditSpecies").prop('checked', true);
                            $("input:radio[name=x_fabdefault]:nth(1)", "#frmEditSpecies").prop('checked', false);
                            $("input:radio").checkboxradio("refresh");
                         } else {
                            $("input:radio[name=x_fabdefault]:nth(0)", "#frmEditSpecies").prop('checked', false);
                            $("input:radio[name=x_fabdefault]:nth(1)", "#frmEditSpecies").prop('checked', true);
                            $("input:radio").checkboxradio("refresh");
                        }
                     },
                     errorHandler);
    });
}

function insFab() {
    var x_fababbr = $("#frmAddSpecies #x_fababbr").val();
    var x_fabname = $("#frmAddSpecies #x_fabname").val();
    var x_fabdefault = $("input[name=x_fabdefault]:checked", "#frmAddSpecies").val();
    
    if (x_fabdefault === 'Y') {
        db.transaction(function(tx) {
           tx.executeSql('UPDATE fabspe SET fabdefault = ? WHERE fabdefault = ?', ["N", "Y"], nullData, errorHandler) ;
        });
    }
    
    db.transaction(function(tx){
               tx.executeSql('INSERT INTO fabspe (fababbr, fabname, fabdefault)'
                           + ' VALUES (?,?,?)', [x_fababbr, x_fabname, x_fabdefault],nullData, errorHandler); 
            }); 
}

function updFab() {
    var v_fabcode = $("#frmEditSpecies #x_fabcode").val();
    var v_fababbr = $("#frmEditSpecies #x_fababbr").val();
    var v_fabname = $("#frmEditSpecies #x_fabname").val();
    var v_fabdefault = $("input[name=x_fabdefault]:checked", "#frmEditSpecies").val();

    if (v_fabdefault === 'Y') {
        db.transaction(function(tx) {
           tx.executeSql('UPDATE fabspe SET fabdefault = ? WHERE fabdefault = ?', ["N", "Y"], nullData, errorHandler) ;
        });
    }
    
    db.transaction(function(tx) {
       tx.executeSql('UPDATE fabspe SET fababbr = ?, fabname = ?, fabdefault = ? WHERE fabcode = ?',
                     [v_fababbr, v_fabname, v_fabdefault, v_fabcode], nullData, errorHandler); 
    });

}

function getFab() {
    $("#divSetupSpecies #tbl_species_list").empty();
    db.transaction(function(tx) {
       tx.executeSql('SELECT * FROM fabspe ORDER BY fabdefault desc, fababbr asc',
                     [],
                     function(tx, v_results) {
                         var v_rowcount = v_results.rows.length; 
                         for (v_count = 0; v_count < v_rowcount; v_count ++) {
                            if (v_count == 0) {
                               v_trdata = "<tr><th>Abbr</th><th>Name</th><th>&nbsp;</th><th>&nbsp;</th></tr>";
                               $(v_trdata).appendTo("#divSetupSpecies #tbl_species_list");
                            }
                            v_trdata = "<tr><td>" + v_results.rows.item(v_count).fababbr + "</td>";
                            if (v_results.rows.item(v_count).fabdefault === 'Y')
                                v_trdata += "<td><span style='background: #00FF00'>&nbsp;</span>" + v_results.rows.item(v_count).fabname + "</td>";
                            else
                                v_trdata += "<td>" + v_results.rows.item(v_count).fabname + "</td>";
                            v_trdata += "<td><button class=\"ui-button ui-btn-inline\" onClick=\"editSpecies("+v_results.rows.item(v_count).fabcode+");\">Edit</button></td>";
                            v_trdata += "<td><button class=\"ui-button ui-btn-inline\" onClick=\"editFbb("+v_results.rows.item(v_count).fabcode+");\">Link Groups</button></td>";
                            v_trdata += "</tr>";
                            $(v_trdata).appendTo("#divSetupSpecies #tbl_species_list");
                         }
                     }, 
                     errorHandler) ;
    });
}

