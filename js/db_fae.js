if(openDatabase){
        db = openDatabase('ftars_jb' , '1.0' , 'FTARS Jervis Bay' , 2 * 1024 * 1024);
};

function getFae() {
    $("#divAddSpm #x_faespecies").empty();
    db.transaction(function(tx) {
       tx.executeSql('SELECT * FROM fabspe order by fabdefault desc, fababbr asc',
                     [],
                     function(tx, v_results) {
                         var v_rowcount = v_results.rows.length; 
                         for (v_count = 0; v_count < v_rowcount; v_count ++) {
                            v_listdata = '<option value="' + v_results.rows.item(v_count).fabcode + '"' ;
                            if (v_results.rows.item(v_count).fabdefault === 'Y')
                                v_listdata += " selected=\"selected\"";
                            v_listdata += ">"
                                       + v_results.rows.item(v_count).fabname
                                       + ' (' + v_results.rows.item(v_count).fababbr + ')'
                                       + '</option>';
                            $("#divAddSpm #x_faespecies").append(v_listdata).trigger("create");
                            //$(v_listdata).appendTo("#divAddSpm #x_faespecies").trigger("create");
                         }
                     }, 
                     errorHandler) ;
    });
    $("#frmAddSpm #x_faespecies", "#divAddSpm").selectmenu("refresh", true);
}

function listFae() {
    $("#divListSpecimens #tbl_spm_list").empty();
    db.transaction(function(tx) {
       tx.executeSql('SELECT faecode, faeseq, fabname, fababbr FROM faespm, fabspe WHERE faespecies = fabcode ORDER BY fababbr, faeseq',
                     [],
                     function(tx, v_results) {
                         var v_rowcount = v_results.rows.length;
                         for (v_count = 0; v_count < v_rowcount; v_count ++) {
                             if (v_count == 0) {
                                 v_trdata = '<tr><th>Sequence</th><th>Species</th><th>&nbsp;</th><th>&nbsp;</th></tr>';
                                 $(v_trdata).appendTo("#tbl_spm_list");
                             }
                             v_trdata  = "<tr>";
                             v_trdata += "<td>" + v_results.rows.item(v_count).faeseq + "</td>";
                             v_trdata += "<td>" + v_results.rows.item(v_count).fabname 
                                       + " (" + v_results.rows.item(v_count).fababbr + ")</td>";
                             v_trdata += "<td><button class=\"ui-button ui-btn-inline\" onClick=\"editFae("+v_results.rows.item(v_count).faecode+");\">Edit</button></td>";
                             v_trdata += "<td><button class=\"ui-button ui-btn-inline\" onClick=\"recordData("
                                       + v_results.rows.item(v_count).faeseq+", "
                                       + v_results.rows.item(v_count).faecode+", "
                                       + "'" + v_results.rows.item(v_count).fabname + "', "
                                       + "'" + v_results.rows.item(v_count).fababbr
                                       + "');\">Record Data</button></td>";
                             v_trdata += "</tr>";
                             $(v_trdata).appendTo("#tbl_spm_list");
                         }
                     },
                     errorHandler);
    });
}

function insFae() {
    var x_faeseq = $("#frmAddSpm #x_faeseq").val();
    var x_faespecies = '';
    $("#frmAddSpm #x_faespecies").each(function() {
        x_faespecies = $("select option:selected").prop("value");
    });
    
    db.transaction(function(tx){
               tx.executeSql('INSERT INTO faespm (faeseq, faespecies)'
                           + ' VALUES (?,?)', [x_faeseq, x_faespecies],nullData, errorHandler); 
            }); 
}

function editFae(x_faecode) {
    $("#divListSpecimens").hide();
    $("#divEditSpm").show("fast");
    
    $("#divEditSpm #x_faespecies").empty();
    $("#frmEditSpm #x_faecode").val(x_faecode);
    var v_defaultspecies = '';
    var v_listdata = '';
    db.transaction(function(tx) {
        tx.executeSql('SELECT faeseq, faespecies FROM faespm WHERE faecode = ?', [x_faecode],
                      function(tx, v_results) {
                                  $("#divEditSpm #x_faeseq").val(v_results.rows.item(0).faeseq);
                                  v_defaultspecies = v_results.rows.item(0).faespecies;
                      },
                      errorHandler);
        // Populate the SELECT
        tx.executeSql('SELECT fabcode, fabname, fababbr, fabdefault FROM fabspe ORDER BY fababbr',
                     [],
                     function(tx, v_results) {
                         var v_rowcount = v_results.rows.length;
                         for (v_count = 0; v_count < v_rowcount; v_count ++) {
                            v_listdata = '<option value="' + v_results.rows.item(v_count).fabcode + '"' ;
                            if (v_results.rows.item(v_count).fabdefault === 'Y')
                                v_listdata += " selected=\"selected\"";
                            v_listdata += ">"
                                       + v_results.rows.item(v_count).fabname
                                       + ' (' + v_results.rows.item(v_count).fababbr + ')'
                                       + '</option>';
                            $("#frmEditSpm #x_faespecies").append(v_listdata).trigger("create");
                            //$(v_listdata).appendTo("#frmEditSpm #x_faespecies", "#divEditSpm").trigger("create");
                         }
                     }, errorHandler);
        $("#frmEditSpm #x_faespecies select").selectmenu();
    });
}

function updFae() {
    var x_faeseq = $("#frmEditSpm #x_faeseq").val();
    var v_faecode = $("#frmEditSpm #x_faecode").val();
    var x_faespecies = '';
    $("#frmEditSpm #x_faespecies").each(function() {
        x_faespecies = $("select option:selected").prop("value");
    });
    db.transaction(function(tx){
               tx.executeSql('UPDATE faespm SET faeseq = ?, faespecies = ? WHERE faecode = ?',
                             [x_faeseq, x_faespecies, v_faecode],
                             nullData, errorHandler);
    }); 
}