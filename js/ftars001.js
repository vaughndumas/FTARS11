if(openDatabase){
        db = openDatabase('ftars_jb' , '1.0' , 'FTARS Jervis Bay' , 2 * 1024 * 1024);
};


function recordData(x_seq, x_specimen, x_speciesname, x_speciesabbr) {
    $("#divListSpecimens").hide();
    $("#divRecordData").show("fast");
    v_currentspecimen = x_seq;
    
    $("#divRecordData #tbl_recdata_list").empty();
    v_specdata = "<tr><th>Species:</th><td>" + x_speciesname + " (" + x_speciesabbr + ")</td></tr>";
    v_specdata += "<tr><th>Specimen</th><td>" + x_seq + "</td></tr>";
    $(v_specdata).appendTo("#frmRecData #tbl_recdata_list").trigger("create");
    
    db.transaction(function(tx) {
        tx.executeSql('SELECT fbccode, fbcheader, fbcattrtitle, fbcdispans, fbcans, fbcfldtype, fbcvalidcodes FROM fbcsfa WHERE fbcspecimencode = ? ORDER BY fbcheader, fbcdispans desc, fbcattrtitle',
              [x_specimen],
              function (tx, v_results) {
                  var v_rowcount = v_results.rows.length;
                  var v_trdata = '';
                  for (v_count = 0; v_count < v_rowcount; v_count ++) {
                      if (v_results.rows.item(v_count).fbcdispans === 'D') {
                          v_trdata = '<tr type="hdr"><td colspan=2 style="background-color: #ddd">' + v_results.rows.item(v_count).fbcheader + '</td></tr>';
                          $(v_trdata).appendTo("#frmRecData #tbl_recdata_list");
                      } else if (v_results.rows.item(v_count).fbcdispans === 'A') {
                          v_dispans = (v_results.rows.item(v_count).fbcans === null) ? '' : v_results.rows.item(v_count).fbcans;
                          v_fldtype = (v_results.rows.item(v_count).fbcfldtype == null) ? 'A' : v_results.rows.item(v_count).fbcfldtype;
                          v_inputtype = "text";
                          v_trdata = "<tr type=\"data\"><td>" + v_results.rows.item(v_count).fbcattrtitle + "</td>";
                          v_trdata += "<td><input type='hidden' id='x_fbccode_" + v_results.rows.item(v_count).fbccode + "' value='" + v_results.rows.item(v_count).fbccode + "'/>";
                          
                          if (v_fldtype == 'R') {
                              /* Create the hidden input field to hold the value of the radio button
                               * This saves effort in trying to decode via jQ which RB was chosen */
                              v_tmphtml = '';
                              v_tmphtml += "<input fldtype='A' size=0 maxlength=0 type='text' id='x_fbcans_" + v_results.rows.item(v_count).fbccode + "' value='" + v_dispans + "' style='display: none;'/>";
                              v_tmphtml += "<script>$('#x_fbcans_" + v_results.rows.item(v_count).fbccode + "').closest('.ui-input-text').hide();</script>";
                              v_radio_elems = v_results.rows.item(v_count).fbcvalidcodes.split(",");
                              v_rb_name = 'x_fbcans_' + v_results.rows.item(v_count).fbccode;
                              v_rb_id = 'x_rb_fbcans_';
                              v_rb_counter = 0;
                              for (v_rb = 0; v_rb < v_radio_elems.length; v_rb += 2) {
                                  v_rb_counter ++;
                                  if (v_rb == 0) {
                                      v_tmphtml += '<fieldset data-role="controlgroup">';
                                  }
                                  v_tmphtml += '<input type="radio" name="' + v_rb_name + '" id="' + v_rb_id + v_radio_elems[v_rb] + '" value="' + v_radio_elems[v_rb] +'"';
                                  // If this question has not been answered then default to the first rb as checked.
                                  if (v_dispans == '') {
                                    if (v_rb == 0) {
                                        v_tmphtml += ' checked="checked" onChange="$(\'#x_fbcans_' + v_results.rows.item(v_count).fbccode + '\').val(\''+ v_radio_elems[v_rb] +'\');">';
                                        v_tmphtml += "<script>$('#x_fbcans_" + v_results.rows.item(v_count).fbccode + "').val('" + v_radio_elems[v_rb] + "');</script>";
                                    } else {
                                        v_tmphtml += ' onChange="$(\'#x_fbcans_' + v_results.rows.item(v_count).fbccode + '\').val(\''+ v_radio_elems[v_rb] +'\');">';
                                    }
                                  } else {
                                      if (v_radio_elems[v_rb] == v_dispans) {
                                        v_tmphtml += ' checked="checked" onChange="$(\'#x_fbcans_' + v_results.rows.item(v_count).fbccode + '\').val(\''+ v_radio_elems[v_rb] +'\');">';
                                        v_tmphtml += "<script>$('#x_fbcans_" + v_results.rows.item(v_count).fbccode + "').val('" + v_radio_elems[v_rb] + "');</script>";
                                          
                                      } else {
                                        v_tmphtml += ' onChange="$(\'#x_fbcans_' + v_results.rows.item(v_count).fbccode + '\').val(\''+ v_radio_elems[v_rb] +'\');">';
                                      }
                                  }
                                  v_tmphtml += '<label for="' + v_rb_id + v_radio_elems[v_rb] + '">' + v_radio_elems[v_rb + 1] + '</label>';
                              }
                              v_tmphtml += '</fieldset>';
                              v_trdata += v_tmphtml;
                          } else if (v_fldtype == 'N') {
                            v_trdata += "<script>$(\"#x_fbcans_" + v_results.rows.item(v_count).fbccode + "\").number(true, 8, '.', ',');</script>"
                            v_trdata +=     "<input fldtype='A' type='number' id='x_fbcans_" + v_results.rows.item(v_count).fbccode + "' value='" + v_dispans + "'/>";
                          } else {
                            v_trdata +=     "<input fldtype='A' type='" + v_inputtype + "' size=32 maxlength=64 id='x_fbcans_" + v_results.rows.item(v_count).fbccode + "' value='" + v_dispans + "'/>";
                          }
                          v_trdata += "</td></tr>";
                          $(v_trdata).appendTo("#frmRecData #tbl_recdata_list").trigger("create");
                          $("#x_fbcans_" + v_results.rows.item(v_count).fbccode).val("");
                          $("#x_fbcans_" + v_results.rows.item(v_count).fbccode).val(v_dispans).trigger("create");
                      }
                  }
              },
              errorHandler);
    });

}

function updRecData() {
    db.transaction(function(tx) {
       var v_code_arr = new Array();
       var v_code_counter = 0;
       var v_data_arr = new Array();
       var v_data_counter = 0;
       var v_notnull_count = 0;
       var v_complind = 'P';
//       $("#divRecordData #frmRecData #tbl_recdata_list tr[type=data] td input[type=hidden]").each(function() { alert("found the form, table, data record, cell, hidden input"); });
       $("#frmRecData #tbl_recdata_list tr[type=data] td input[type=hidden]").each(function(v_index, v_element) {
                 v_code_arr[v_code_counter] = $(v_element).val();
                 v_code_counter ++;
       });
//       $("#frmRecData #tbl_recdata_list tr[type=data] td input[type=text|number]").each(function(v_index, v_element2) {
       $("#tbl_recdata_list tr[type=data] td input[type=text], #tbl_recdata_list tr[type=data] td input[type=number]", "#frmRecData").each(function(v_index, v_element2) {
                 v_data_arr[v_data_counter] = $(v_element2).val();
                 v_data_counter ++;
       });
       for (v_counter = 0; v_counter < v_code_counter; v_counter ++) {
           if (v_data_arr[v_counter] != '') v_notnull_count ++;
           tx.executeSql(
            'UPDATE fbcsfa SET fbcans = ? WHERE fbccode = ?',
            [v_data_arr[v_counter], v_code_arr[v_counter]],
            errorHandler_urd);
       }
       if (v_notnull_count === 0)
           v_complind = "N";
       else if ((v_notnull_count > 0) && (v_notnull_count < v_code_counter))
           v_complind = "P";
       else
           v_complind = "A";
       tx.executeSql("UPDATE faespm SET faecomplind = ? WHERE faeseq = ?", [v_complind, v_currentspecimen], nullData, errorHandler_urd);
    });
}

function errorHandler_urd(transaction, error) {
    var v_errmsg = 'Error in updRecData: ' + error.message;
    v_errmsg += ' Code ';
//    v_errmsg += error.code;
//    alert(v_errmsg);
    console.log(v_errmsg);
}