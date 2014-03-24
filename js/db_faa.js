/////
///Get Data Function
/////
function getFaa() {
    db.transaction(function(tx) {
       tx.executeSql('SELECT * FROM faaftp',
                     [],
                     function(tx, v_results) {
                         //v_item = document.getElementById("x_faasdate");
                         $("#frmFieldTrip #x_faasdate").val(v_results.rows.item(0).faasdate);
                         $("#frmFieldTrip #x_faaedate").val(v_results.rows.item(0).faaedate);
                         $("#frmFieldTrip #x_faadesc").val(v_results.rows.item(0).faadesc);
                         $("#frmFieldTrip #x_faaarea").val(v_results.rows.item(0).faaarea);
                     },
                     errorHandler2);
    });
}

function updFaa() {
    v_faasdate = $("#frmFieldTrip #x_faasdate").val();
    v_faaedate = $("#frmFieldTrip #x_faaedate").val();
    v_faadesc = $("#frmFieldTrip #x_faadesc").val();
    v_faaarea = $("#frmFieldTrip #x_faaarea").val();
    db.transaction(function(tx) {
       tx.executeSql('UPDATE faaftp SET faasdate = ?, faaedate = ?, faadesc = ?, faaarea = ?',
                     [v_faasdate, v_faaedate, v_faadesc, v_faaarea], nullData, errorHandler2); 
    });
}

/////
///Error Handler
/////
function errorHandler(transaction, error) {
    var v_errmsg = 'Error: ' + error.message;
    v_errmsg += ' Code ';
    v_errmsg += error.code;
    console.log(v_errmsg);
}

function errorHandler2(transaction, error) {
    var v_errmsg = 'eH2: Error: ' + error.message;
    v_errmsg += ' Code ';
    v_errmsg += error.code;
    console.log(v_errmsg);
}

/////
///Null Data
/////
function nullData(){
    //Can be used for callbacks etc
}
/////
///Document Ready 
/////
