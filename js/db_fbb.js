if(openDatabase){
        db = openDatabase('ftars_jb' , '1.0' , 'FTARS Jervis Bay' , 2 * 1024 * 1024);
};

function editFbb(x_fabcode) {
    $("#divSetupSpecies").hide();
    $("#divSpeciesGp").show();
    $("#divSpeciesGp #tbl_link_spegp").empty();
    
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM fabspe WHERE fabcode = ?', [x_fabcode],
                     function(tx, v_results) {
                         $("#divSpeciesGp #x_fabname").val(v_results.rows.item(0).fabname);
                     },
                     errorHandler);

        $("#divSpeciesGp #x_fbbspecies").val(x_fabcode);
        // Get the currently linked groups
        tx.executeSql('SELECT fbbgroupcode, fadname, fadabbr FROM fbbsgl, fadgrp '
                    + 'WHERE fbbspecies = ? '
                    + 'AND fbbgroupcode = fadcode', [x_fabcode],
                    function(tx, v_results) {
                        var v_rowcount = v_results.rows.length;
                        $("<tr><th>Group</th><th>Link?</th></tr>").appendTo("#divSpeciesGp #tbl_link_spegp");
                        for (v_count = 0; v_count < v_rowcount; v_count ++) {
                            v_trdata = "<tr><td>" 
                                    + "<input type=hidden name=fbbgroupcode value='"+v_results.rows.item(v_count).fbbgroupcode 
                                    + "'/>"
                                    + v_results.rows.item(v_count).fadname 
                                    + " (" + v_results.rows.item(v_count).fadabbr + ")"
                                    + "</td>";
                            v_trdata += "<td>";
                            v_trdata += "<input type=checkbox data-role=flipswitch id='flip-checkbox-b'"+v_count+"' name='flip-checkbox-b' data-on-text='Yes' data-off-text='No' checked=''>";
                            v_trdata += "</td>";
                            v_trdata += "</tr>";
                            $(v_trdata).appendTo("#tbl_link_spegp").trigger("create");
                        }
                    },
                    errorHandler);
        tx.executeSql('SELECT fadcode, fadname, fadabbr FROM fadgrp WHERE fadcode NOT IN (SELECT fbbgroupcode FROM fbbsgl WHERE fbbspecies = ?)', [x_fabcode],
                    function(tx, v_results) {
                        var v_rowcount = v_results.rows.length;
                        for (v_count = 0; v_count < v_rowcount; v_count ++) {
                            v_trdata = "<tr><td>" 
                                    + "<input type=hidden name=fbbgroupcode value='"+v_results.rows.item(v_count).fadcode 
                                    + "'/>"
                                    + v_results.rows.item(v_count).fadname 
                                    + " (" + v_results.rows.item(v_count).fadabbr + ")"
                                    + "</td>";
                            v_trdata += "<td>";
                            v_trdata += "<input type=checkbox data-role=flipswitch id='flip-checkbox-a'"+v_count+"' name='flip-checkbox-a' data-on-text='Yes' data-off-text='No'>";
                            v_trdata += "</td>";
                            v_trdata += "</tr>";
                            $(v_trdata).appendTo("#tbl_link_spegp").trigger("create");
                        }
                    },
                    errorHandler);
    });
}

function getGpName(x_groupcode) {
    var v_groupname = '';
    db.transaction(function(tx_ggn) {
        tx_ggn.executeSql('SELECT * FROM fadgrp WHERE fadcode = ?', [x_groupcode],
          function(tx_ggn, v_results_ggn) {
              v_groupname = v_results_ggn.rows.item(0).fadname + " (" + v_results_ggn.rows.item(0).fadabbr + ")";
          }
        ,nullData);
    });
    return v_groupname;
}

function updSpeGp() {
    // Get the primary key from the table
    var v_fbbspecies = $("#divSpeciesGp #x_fbbspecies").val();
    var v_groupcode = '';
    var v_tmpgroup = '';
    var v_fbc_arr = [];
    var v_specimens = [];
    $(v_specimens).empty();
    $(v_fbc_arr).empty();
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM faespm WHERE faespecies = ?', [v_fbbspecies],
                      function(tx, v_results) {
                        var v_rowcount = v_results.rows.length;
                        for (v_count = 0; v_count < v_rowcount; v_count++) {
                            v_specimens.push(v_results.rows.item(v_count).faecode);
//                            v_specimens[v_count] = v_results.rows.item(v_count).faecode;
                        }
                    }, nullData);
    });

    // Cache the existing fbc records
    db.transaction(function(tx_fae) {
        for (var v_count = 0; v_count < v_specimens.length; v_count ++) {
                tx_fae.executeSql('SELECT * FROM fbcsfa WHERE fbcspecimencode = ?', [v_specimens[v_count]],
                function(tx_fae, v_results2) {
                    var v_fbccount = v_results2.rows.length;
                    for (v_count3 = 0; v_count3 < v_fbccount; v_count3 ++ ) {
                    v_fbc_arr.push(
                        [v_results2.rows.item(v_count3).fbcheader,
                         v_results2.rows.item(v_count3).fbcspecimencode,
                         v_results2.rows.item(v_count3).fbcattrcode,
                         v_results2.rows.item(v_count3).fbcattrtitle,
                         v_results2.rows.item(v_count3).fbcdispans,
                         v_results2.rows.item(v_count3).fbcans]);
                    }
                }, nullData);
        }
    });
    
    db.transaction(function(tx) {
       // Remove existing values for this species
       tx.executeSql('DELETE FROM fbbsgl WHERE fbbspecies = ?', [v_fbbspecies], nullData, errorHandler);
       // before inserting new ones.
       $("#divSpeciesGp #tbl_link_spegp tr").each(function(v_count_tr) {
          v_groupcode = '';
          $(this).children("td").each(function() {
            // Second TD is a div
            $(this).children("input").each(function() {
               v_groupcode = $(this).attr("value"); 
            });
            $(this).children("div .ui-flipswitch-active").each(function() {
                tx.executeSql('INSERT INTO fbbsgl (fbbspecies, fbbgroupcode) '
                            + ' VALUES (?, ?)', [v_fbbspecies, v_groupcode], nullData, errorHandler);
                v_tmpgroup = v_groupcode;
                var v_fbcheader = '';

                tx.executeSql('SELECT * FROM fadgrp WHERE fadcode = ?', [v_groupcode],
                  function(tx, v_results) {
                    v_fbcheader = v_results.rows.item(0).fadname + " (" 
                                + v_results.rows.item(0).fadabbr + ")";
                  }  ,nullData);

                /* 
                 * Add the attributes linked to this group to the field attribute values table.
                 * Only add those attributes that DO NOT exist
                 * Once finished, check if there is a dispans = 'D'.  If not then add one with the group name
                 * 
                 */
                tx.executeSql('SELECT fbaattrcode, facname, facabbr '
                            + 'FROM   fbagpa, facatr '
                            + 'WHERE  fbagroupcode = ? '
                            + 'AND    fbaattrcode = faccode '
                            + 'AND    fbaattrcode NOT IN '
                            + '   (SELECT fbcattrcode '
                            + '    FROM   fbcsfa, faespm '
                            + '    WHERE  fbcspecimencode = faecode '
                            + '    AND    fbcdispans = "A"'
                            + '    AND    faespecies = ?)',
                            [v_groupcode, v_fbbspecies],
                            function(tx, v_results) {
                                var v_rowcount = v_results.rows.length;
                                for (var v_count = 0; v_count < v_rowcount; v_count ++) {
                                    var v_fbaattrcode_ins = v_results.rows.item(v_count).fbaattrcode;
                                    var v_facname_ins = v_results.rows.item(v_count).facname;
                                    
                                    // Select every specimen linked to this species
                                    var v_specimencount = v_specimens.length;
                                    for (var v_count2 = 0; v_count2 < v_specimencount; v_count2 ++) {
                                        var v_faecode_ins = v_specimens[v_count2];

//                                        if (v_count2 === 0) {
                                            // Check for dispans header, create if necessary;
                                            var v_dispans = 'D';
                                            var v_counter = 0;
                                            for (v_c = 0; v_c < v_fbc_arr.length; v_c ++) {
                                                if ((v_fbc_arr[v_c][1] === v_faecode_ins) &&
                                                    (v_fbc_arr[v_c][0] === v_fbcheader) &&
                                                    (v_fbc_arr[v_c][4] === "D") ) {
                                                        v_counter ++;
                                                }
                                            }
                                            if (v_counter === 0) {
                                              v_fbc_arr.push([v_fbcheader, v_faecode_ins, null,v_facname_ins, v_dispans, null]);
                                              tx.executeSql('INSERT INTO fbcsfa (fbcheader, fbcspecimencode, fbcattrcode, fbcattrtitle, fbcdispans, fbcans) '
                                                          + 'VALUES (?, ?,NULL,?,?,NULL)',
                                                             [v_fbcheader, v_faecode_ins,
                                                              v_facname_ins,
                                                              v_dispans], nullData);
                                            } 
//                                        }
                                        // Check if this record (A) exists in the array
                                        var v_found = 0;
                                        for (v_c = 0; v_c < v_fbc_arr.length; v_c ++) {
                                            if ((v_fbc_arr[v_c][1] === v_faecode_ins) &&
                                                (v_fbc_arr[v_c][2] === v_fbaattrcode_ins) &&
                                                (v_fbc_arr[v_c][0] === v_fbcheader) &&
                                                (v_fbc_arr[v_c][4] === "A") ) {
                                                    v_found ++;
                                            }
                                        }
                                        if (v_found === 0) {
                                            v_dispans = "A";
                                            v_fbc_arr.push([v_fbcheader, v_faecode_ins, v_fbaattrcode_ins,v_facname_ins, v_dispans, null]);
                                            tx.executeSql('INSERT INTO fbcsfa (fbcheader, fbcspecimencode, fbcattrcode, fbcattrtitle, fbcdispans, fbcans) '
                                                        + 'VALUES (?, ?,?,?,?,NULL)',
                                                         [v_fbcheader, v_faecode_ins,
                                                          v_fbaattrcode_ins, v_facname_ins,
                                                          v_dispans], nullData);
                                        }
                                    };
                                }
                            },
                            errorHandler);
            });
          });
       });
    });

}

function errorHandler_fbb(transaction, error) {
    var v_errmsg = 'FBB Error: ' + transaction['sqlStatement'];
//    v_errmsg += ' Code ';
//    v_errmsg += error.code;
    console.log(v_errmsg);
}

function errorHandler_fbb2(transaction, error) {
    var v_errmsg = 'FBB2 Error: ' + error.message;
//    v_errmsg += ' Code ';
//    v_errmsg += error.code;
    console.log(v_errmsg);
}