if(openDatabase){
        db = openDatabase('ftars_jb' , '1.0' , 'FTARS Jervis Bay' , 2 * 1024 * 1024);
};


function recordData(x_seq, x_specimen, x_speciesname, x_speciesabbr) {
    $("#divListSpecimens").hide();
    $("#divRecordData").show("fast");
    
    $("#divRecordData #tbl_recdata_list").empty();
    v_specdata = "<tr><th>Species:</th><td>" + x_speciesname + " (" + x_speciesabbr + ")</td></tr>";
    v_specdata += "<tr><th>Specimen</th><td>" + x_seq + "</td></tr>";
    $(v_specdata).appendTo("#frmRecData #tbl_recdata_list").trigger("create");
    
    db.transaction(function(tx) {
        tx.executeSql('SELECT fbccode, fbcheader, fbcattrtitle, fbcdispans, fbcans FROM fbcsfa WHERE fbcspecimencode = ? ORDER BY fbcheader, fbcdispans desc, fbcattrtitle',
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
                          v_trdata = "<tr type=\"data\"><td>" + v_results.rows.item(v_count).fbcattrtitle + "</td>";
                          v_trdata += "<td><input type='hidden' id='x_fbccode_" + v_results.rows.item(v_count).fbccode + "' value='" + v_results.rows.item(v_count).fbccode + "'/>";
                          v_trdata +=     "<input type='text' size=32 maxlength=64 id='x_fbcans_" + v_results.rows.item(v_count).fbccode + "' value='" + v_dispans + "'/>";
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
       var v_code_counter = -1;
       var v_data_arr = new Array();
       var v_data_counter = -1;
       var v_fbccode = 0;
       var v_ans = '';
//       $("#divRecordData #frmRecData #tbl_recdata_list tr[type=data] td input[type=hidden]").each(function() { alert("found the form, table, data record, cell, hidden input"); });
       $("#frmRecData #tbl_recdata_list tr[type=data] td input[type=hidden]").each(function(v_index, v_element) {
                 v_code_counter ++;
                 v_code_arr[v_code_counter] = $(v_element).val();
       });
       $("#frmRecData #tbl_recdata_list tr[type=data] td input[type=text]").each(function(v_index, v_element2) {
                 v_data_counter ++;
                 v_data_arr[v_data_counter] = $(v_element2).val();
       });
       for (v_counter = 0; v_counter <= v_code_counter; v_counter ++) {
           tx.executeSql(
            'UPDATE fbcsfa SET fbcans = ? WHERE fbccode = ?',
            [v_data_arr[v_counter], v_code_arr[v_counter]],
            nullData);
       }
    });
}