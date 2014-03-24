
/////
///Error Handler
/////
//function errorHandler(transaction, error) {
//    console.log('Error: ' + error.message + ' (Code ' + error.code + ')');
//}

/////
///Null Data
/////
function nullData(){
    //Can be used for callbacks etc
}

function checkFaa(tx, x_result) {
         var v_rowcount = x_result.rows.length;
         if (v_rowcount > 1) {
            db.transaction(function(tx){
               tx.executeSql('DELETE FROM faaftp', nullData, errorHandler); 
               v_rowcount = 0;
            });
             
         }
         if (v_rowcount === 0) {
            db.transaction(function(tx){
               tx.executeSql('INSERT INTO faaftp (faasdate, faaedate, faadesc, faaarea)'
                           + ' VALUES (?,?,?,?)', ["", "", "Field trip description", "Where is this field trip"],nullData, errorHandler2); 
            });
         }
}

$(document).ready(function(){

    //Open the database 
    if(openDatabase){
        db = openDatabase('ftars_jb' , '1.0' , 'FTARS Jervis Bay' , 2 * 1024 * 1024);
        db.transaction(function(tx){
            // Create the setup table faaftp
            tx.executeSql('CREATE TABLE IF NOT EXISTS faaftp ('
                           + 'faacode INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,'
                           + 'faasdate DATE,'
                           + 'faaedate DATE,'
                           + 'faadesc VARCHAR(1024),'
                           + 'faaarea VARCHAR(128)'
                           + ');',[],nullData,errorHandler2);
        });
        /* Create table FABSPE - species */
        db.transaction(function(tx){
            tx.executeSql('CREATE TABLE IF NOT EXISTS fabspe ('
                           + 'fabcode INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,'
                           + 'fababbr VARCHAR(16),'
                           + 'fabname VARCHAR(64),'
                           + 'fabdefault VARCHAR(1)'
                           + ');',[],nullData,errorHandler2);
        });
        // Temp measure - clear the table
//        db.transaction(function(tx) {
//           tx.executeSql('DELETE FROM fabspe', nullData, errorHandler) ;
//        });
        
        /* Create table FACATR = attribute definitions */
        db.transaction(function(tx) {
           tx.executeSql('CREATE TABLE IF NOT EXISTS facatr ('
                       + 'faccode INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,'
                       + 'facabbr VARCHAR(16),'
                       + 'facname VARCHAR(64));',
                       [], nullData, errorHandler2);
           //tx.executeSql('DELETE FROM facatr', nullData, errorHandler);
        });

        
        /* Create table FADGRP = group definitions */
        db.transaction(function(tx) {
           tx.executeSql('CREATE TABLE IF NOT EXISTS fadgrp ('
                       + 'fadcode INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,'
                       + 'fadabbr VARCHAR(16),'
                       + 'fadname VARCHAR(64));',
                       [], nullData, errorHandler2);
        });
        
        /* Create table FAESPM = specimens */
        db.transaction(function(tx) {
           tx.executeSql("CREATE TABLE IF NOT EXISTS faespm ("
                       + "faecode INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "
                       + "faeseq INTEGER NOT NULL, "
                       + "faespecies INTEGER NOT NULL);",
                       [], nullData, errorHandler2); 
        });
        
        /* Create table FBAGRP = group attribute links */
        db.transaction(function(tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS fbagpa ("
                        + "fbacode INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "
                        + "fbagroupcode INTEGER NOT NULL, "
                        + "fbaattrcode INTEGER NOT NULL);",
                        [], nullData, errorHandler2);
        });
        
        /* Create table FBBSGL = Species:Groups links */
        db.transaction(function(tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS fbbsgl ("
                        + "fbbcode INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "
                        + "fbbspecies INTEGER NOT NULL, "
                        + "fbbgroupcode INTEGER NOT NULL);",
                        [], nullData, errorHandler2);
        });

        /* Create table FBCSFA = Specimen Field Attribute values */
        db.transaction(function(tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS fbcsfa ("
                        + "fbccode INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "
                        + "fbcheader VARCHAR(64), "
                        + "fbcspecimencode INTEGER, "
                        + "fbcattrcode INTEGER, "
                        + "fbcattrtitle VARCHAR(64), "
                        + "fbcdispans CHAR(1), "
                        + "fbcans VARCHAR(64));",
                        [], nullData, errorHandler_startup);
//            tx.executeSql('DELETE FROM fbcsfa', errorHandler2);
//            tx.executeSql('INSERT INTO fbcsfa (fbcheader, fbcspecimencode, fbcattrcode, fbcattrtitle, fbcdispans, fbcans) '
//                    + ' values (?,?,?,?,?, null)',["Test Group (tstgp)", 4, 8, "Terrain info", "A"], errorHandler);
        });
        

        /* Get the number of records in the FAA table
         * If none exist, then create one with the code of one
         */
        db.transaction(function(tx) {
           tx.executeSql('SELECT * FROM faaftp',
                         [],
                         checkFaa,
                         errorHandler);
        });
        

    }
    //Alert the user to upgrade their browser
    else {
        alert('Databases not supported. Please get a proper browser');
    }

});

function errorHandler_startup(transaction, error) {
    var v_errmsg = 'Error in startup: ' + error.message;
    v_errmsg += ' Code ';
    v_errmsg += error.code;
    console.log(v_errmsg);
}
