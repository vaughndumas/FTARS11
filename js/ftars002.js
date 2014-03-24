function syncUp() {
    if(openDatabase){
        db = openDatabase('ftars_jb' , '1.0' , 'FTARS Jervis Bay' , 2 * 1024 * 1024);
    };
    
    $("#divSyncUp #syncLoading").show("slow");
    
    // Create an XML document of all the data, each table excluding the setup (faa)
    //var v_xmldoc = $.parseXML("<root/>");

    // Species
    //var v_fab = v_xmldoc.createElement("fabspe");
    
    // Attributes
    //var v_fac = v_xmldoc.createElement("facatr");
    
    // Groups
    //var v_fad = v_xmldoc.createElement("fadgrp");
    
    // Specimens
    //var v_fae = v_xmldoc.createElement("faespm");
    
    // Groups:Attributes
    //var v_fba = v_xmldoc.createElement("fbagpa");
    
    // Species:Groups
    //var v_fbb = v_xmldoc.createElement("fbbsgl");
    
    // Specimen field attribute values
    //var v_fbc = v_xmldoc.createElement("fbcsfa");
    
    db.transaction(function(tx) {
        var v_xmldoc = "<root>";
        // FABSPE
        tx.executeSql('SELECT * from fabspe', [], 
        function(tx, v_results) {
            var v_xml = "<fab>";
            var v_rowcount = v_results.rows.length;
            for (v_count = 0; v_count < v_rowcount; v_count++) {
                v_xml += "<ROWNUM num=\""+(v_count+1) + "\">";
                v_xml += "<fabcode>" + v_results.rows.item(v_count).fabcode + "</fabcode>";
                v_xml += "<fababbr>" + v_results.rows.item(v_count).fababbr + "</fababbr>";
                v_xml += "<fabname>" + v_results.rows.item(v_count).fabname + "</fabname>";
                v_xml += "<fabdefault>" + v_results.rows.item(v_count).fabdefault + "</fabdefault>";
                v_xml += "</ROWNUM>";
            }
            v_xmldoc += v_xml + "</fab></root>";
            // Send the data to the server
            var v_xmlRequest = $.ajax({
                url: "http://instrumentbooking.rsb.anu.edu.au/ftars/ftars001.php",
                type: "POST",
                data: {x_table: "fab", x_xml : v_xmldoc}
            })
              .done(function(x_data) {   
                  console.log(x_data);
            });

        },
        nullData);
        
        // FACATR
        tx.executeSql('SELECT * from facatr', [], 
        function(tx, v_results) {
            var v_xml = "<fac>";
            var v_rowcount = v_results.rows.length;
            for (v_count = 0; v_count < v_rowcount; v_count++) {
                v_xml += "<ROWNUM num=\""+(v_count+1) + "\">";
                v_xml += "<faccode>" + v_results.rows.item(v_count).faccode + "</faccode>";
                v_xml += "<facabbr>" + v_results.rows.item(v_count).facabbr + "</facabbr>";
                v_xml += "<facname>" + v_results.rows.item(v_count).facname + "</facname>";
                v_xml += "</ROWNUM>";
            }
            v_xmldoc = "<root>" + v_xml + "</fac></root>";
            var v_xmlRequest = $.ajax({
                url: "http://instrumentbooking.rsb.anu.edu.au/ftars/ftars001.php",
                type: "POST",
                data: {x_table: "fac", x_xml : v_xmldoc}
            })
              .done(function(x_data) {   
                  console.log(x_data);
            });
        },
        nullData);

    });
    
    $("#divSyncUp #syncLoading").hide();
    $("#divSyncUp #syncLoaded").show("slow");
}

