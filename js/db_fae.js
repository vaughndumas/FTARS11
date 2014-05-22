if(openDatabase){
        db = openDatabase('ftars_jb' , '1.0' , 'FTARS Jervis Bay' , 2 * 1024 * 1024);
};

var v_listFae_fn = function(e) {
    e.preventDefault; 
    $("#content").hide(); 
    $("#divListSpecimens").hide(); 
    $("#divSetupSpecies").show(); 
    //$("tbl_species_list").empty();
    document.addEventListener("deviceready", function() {document.removeEventListener("backbutton", v_listFae_fn);}, false);
    getFab();
}

var v_getFae_fn = function(e) {
    e.preventDefault; 
    $("#divAddSpm").hide(); 
    $("#divListSpecimens").show();
    $("#divSetupSpecies").hide(); 
    document.addEventListener("deviceready", function() {document.removeEventListener("backbutton", v_listFae_fn);}, false);
    document.addEventListener("deviceready", function() {document.removeEventListener("backbutton", v_getFae_fn, false);}, false);
    listFae(v_currentspecies);
};


function getFae() {
    $("#divAddSpm #x_faespecies").empty();
    db.transaction(function(tx) {
       tx.executeSql('SELECT * FROM fabspe WHERE faespecies = ? order by fabdefault desc, fababbr asc',
                     [x_faespecies],
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
    //$("#frmAddSpm #x_faespecies", "#divAddSpm").selectmenu("refresh", true);
    document.addEventListener("deviceready", function() {document.addEventListener("backbutton", v_getFae_fn, false);}, false);
}

function listFae(x_faespecies) {
            
    $("#divSetupSpecies").hide();
    $("#divListSpecimens").show();
    $("#divListSpecimens #tbl_spm_list").empty();
    db.transaction(function(tx) {
       tx.executeSql('SELECT faecode, faeseq, fabname, fababbr, faecomplind FROM faespm, fabspe WHERE faespecies = fabcode AND faespecies = ? ORDER BY fababbr, faeseq',
                     [x_faespecies],
                     function(tx, v_results) {
                         var v_rowcount = v_results.rows.length;
                         for (v_count = 0; v_count < v_rowcount; v_count ++) {
                             if (v_count == 0) {
                                 v_trdata = '<tr><th>Sequence</th><th>Species</th><th>&nbsp;</th><th>&nbsp;</th></tr>';
                                 $(v_trdata).appendTo("#tbl_spm_list");
                             }
                             v_complind = v_results.rows.item(v_count).faecomplind;
                             if (v_complind == null) v_complind = "N";
                             v_trdata  = "<tr>";
                             v_trdata += "<td>" + v_results.rows.item(v_count).faeseq + "</td>";
                             v_trdata += "<td>";
                             switch (v_complind) {
                                 case "A": v_trdata += '<span style="background-color: green">&nbsp;</span>';
                                           break;
                                 case "P": v_trdata += '<span style="background-color: orange">&nbsp;</span>';
                                           break;
                                 case "N": v_trdata += '<span style="background-color: red">&nbsp;</span>';
                                           break;
                             }
                             v_trdata += v_results.rows.item(v_count).fabname 
                                       + " (" + v_results.rows.item(v_count).fababbr + ")</td>";
                             v_trdata += "<td><button class=\"ui-button ui-btn-inline\" onClick=\"editFae("+v_results.rows.item(v_count).faecode+");\">Edit</button></td>";
                             v_trdata += "<td><button class=\"ui-button ui-btn-inline\" onClick=\"v_currentspecies="+x_faespecies+"; recordData("
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
    document.addEventListener("deviceready", function() {document.addEventListener("backbutton", v_listFae_fn, false);}, false);
}

function insFae() {
    var v_faespecies = v_currentspecies;
    var x_faeseq = $("#frmAddSpm #x_faeseq").val();
    db.transaction(function(tx){
               tx.executeSql('INSERT INTO faespm (faeseq, faespecies)'
                           + ' VALUES (?,?)', [x_faeseq, v_faespecies],nullData, errorHandler); 
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
    });
}

function updFae() {
    var x_faeseq = $("#frmEditSpm #x_faeseq").val();
    var v_faecode = $("#frmEditSpm #x_faecode").val();
    var x_faespecies = v_currentspecies;
    db.transaction(function(tx){
               tx.executeSql('UPDATE faespm SET faeseq = ?, faespecies = ? WHERE faecode = ?',
                             [x_faeseq, x_faespecies, v_faecode],
                             nullData, errorHandler);
    }); 
}

function quickAdd() {
    var x_faespecies = v_currentspecies;
    db.transaction(function(tx) {
       tx.executeSql('SELECT MAX(faeseq) as maxseq FROM faespm WHERE faespecies = ?',
       [x_faespecies],
       function(tx, v_results) {
           var v_maxseq = 0;
           var v_rowcount = v_results.rows.length;
           if (v_rowcount === 1) {
               v_maxseq = v_results.rows.item(0).maxseq;
               v_maxseq ++;
           } else
               v_maxseq = 1;
           tx.executeSql('INSERT INTO faespm (faeseq, faespecies)'
                   + ' VALUES (?,?)', [v_maxseq, x_faespecies],nullData, errorHandler);
       } , errorHandler);
    });
    listFae(x_faespecies);
}