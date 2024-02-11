/** 
* Author: Alexander Bartz, IU Internationale Hochschule MMTH01
* Written for Kiwi TCMS Version 12.5 in 2023 
* This file contains all the importer tool specific code
*/

/** 
* Importing the neccessary external modules and data
*/
import * as util from './shared.js';
const entityTypes = util.entityTypes;

/** 
* Initializing the multiple used user interface elements
*/
const file_input = document.getElementById('inp-file');
const btn_validate = document.getElementById('btn-validate');
const btn_import = document.getElementById('btn-import');
const drp_entityTypes = document.getElementById('drp-entitytype');

/** 
* Initializing the containers for the created datatables and the data to be imported
*/
var datatables = {};
var importdata = {};

Initialize();

/**
* Starting up the user interface: populating the entity selector and getting the interface up and running
*/
function Initialize() {

    //Populating the entity selector from the shared.js
    for (var entityType_key in entityTypes) {
        var entityType = entityTypes[entityType_key];
        if(!entityType.filterOnly) {
            drp_entityTypes.options[drp_entityTypes.options.length] = new Option(entityType.displayName, entityType_key);
        }
    }
    ResetInterface();
}

/**
* Adding the OnClick Listener for all of the created data table export butttons
*/
$('.btn-export').click(function(){
    util.ExportDataTableToCSV(this.value); 
});

/**
* Adding the OnClick Listener for the download base data button
*/
$('#btn-download-metadata').click(function(){
    //Translate Language
    Swal.fire({
        title: 'Confirm download',
        html: "Are you sure you want to download all the basedata?",
        width: 400,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
            DownloadAllBaseData();
        }
    }); 
});


/**
* Adding the OnClick Listener for the reset button
*/
$('#btn-reset').click(function(){

    //Translate Language
    Swal.fire({
        title: 'Confirm reset',
        text: "Are you sure you want to reset all inputs?",
        width: 400,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Reset',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
            ResetInterface();
        }
    });

});

/**
* Adding the OnChange Listener for the entity selector dropdown
*/
$('#drp-entitytype').change(function(){
    ResetInterface();
});

/**
* Adding the OnChange Listener for the file input and applying the ux logic
*/
$('#inp-file').change(function(){
    
    if (file_input.files.length > 0) {
        btn_validate.disabled = false;
    }
    else {
        btn_validate.disabled = true;
    }
    ResetDataTables();
    btn_import.disabled = true;
});

/**
* Adding the OnClick Listener for the show manual button
*/
$('#btn-manual').click(function(){

    //Translate Language
    Swal.fire({
        title: 'User manual: Import tool',
        html: importer_manual,
        width: 1000
    });

});

/**
* Adding the OnClick Listener for the validating button
*/
$('#btn-validate').click(function(){
    
    if (file_input.files.length > 0) {
       
        //Translate Language
        Swal.fire({
            title: 'Confirm validation',
            text: "Are you sure you want to validate the selected file?",
            width: 400,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Validate',
            cancelButtonText: 'Cancel'
            }).then((result) => {
            if (result.isConfirmed) {
                util.ReadAndValidateFromCSV(file_input.files[0], drp_entityTypes.value, function(parsedData) {
                    if(parsedData.data != null) {
                        btn_import.disabled = false;
                        importdata = parsedData;
                        util.CreateDataTable(datatables, "tbl_preview", entityTypes[drp_entityTypes.value].fieldDisplayNames, parsedData.displayData);
                    }
                });
            }
        }); 

    }
    else {
        //Should not be possible to get into this branch
        alert("Please select a file to validate...");
    }
});

/**
* Adding the OnClick Listener for the import button and asking for confirmation to upload
*/
$('#btn-import').click(async function(){
    
    //Translate Language
    Swal.fire({
        title: 'Confirm import',
        html: "Are you sure you want to import the datasets shown below?<br />Note: The import cannot be undone!",
        width: 400,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Import',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
            RunImport();
        }
    });
});

/**
* Adding the OnClick Listener for the toggle preview button
*/
$('#btn-toggle-preview').click(function(){

    if(document.getElementById("preview-container").style.contentVisibility == "" || document.getElementById("preview-container").style.contentVisibility == "visible") {
        document.getElementById("preview-container").style.contentVisibility = "hidden";
        document.getElementById("btn-toggle-preview").textContent = "Expand";
    }
    else {
        document.getElementById("preview-container").style.contentVisibility = "visible";
        document.getElementById("preview-container").style.contentVisibility = "visible";
        document.getElementById("btn-toggle-preview").textContent = "Collapse";
    }
});

async function RunImport() {

    //Translate Language
    await util.loader.Show("Loading", "Please wait while the datasets are being imported ...", "page-steil-plugin-importer");
    await ImportDataTable().then(function(data) {
        util.loader.Hide();
        Swal.fire({
            title: "Import completed",
            width: 400,
            type: "success",
            html: "The import process has been completed!<br />Successfully imported datasets: " + data[0].length + "<br />Erroneous datasets: " + data[1].length
        });
    });
}

/**
* Function to reset the user interface with the ui elements and all data tables
*/
function ResetInterface() {
    
    file_input.value = "";
    btn_validate.disabled = true;
    btn_import.disabled = true;
    
    ResetDataTables();
}

/**
* Function to download all the base data required for preparing input datasets
*/
function DownloadAllBaseData() {
    for(var entityType in util.KiwiBaseData) {

        const csvRows = [];

        if(util.KiwiBaseData[entityType][0]) {

        const headers = Object.keys(util.KiwiBaseData[entityType][0]);
        csvRows.push(headers.join(';'));

        for (const row of util.KiwiBaseData[entityType]) {
            const values = headers.map(header => {
            const val = row[header]
            return `"${val}"`;
        });
 
        csvRows.push(values.join(';'));
        }
        util.ExportDataToCSV(csvRows.join('\n'),entityType + ".csv");
        }
    }
    
}


/**
* Function to reset all data tables and the loaded import data
*/
function ResetDataTables() {

    //Resetting preview data table
    util.CreateDataTable(datatables, "tbl_preview", entityTypes[drp_entityTypes.value].fieldDisplayNames, null);
        
    //Resetting success data table
    var success_header = entityTypes[drp_entityTypes.value].fieldDisplayNames.concat(["ID"]);
    util.CreateDataTable(datatables, "tbl_result_success", success_header, null);

    //Resetting error data table
    //Translate Language
    var error_header = entityTypes[drp_entityTypes.value].fieldDisplayNames.concat(["Error description"]);
    util.CreateDataTable(datatables, "tbl_result_error", error_header, null);

    //Resetting import data
    importdata = {};
}

/**
 * Async Function to import the loaded importdata to Kiwi TCMS
 */
async function ImportDataTable() {
    
    var success = [];
    var error = [];

    //Processing each individual importdata entity and creating value set for calling kiwi rpc api method
    for(var i = 0; i < importdata.data.length; i++) {

        var current_item = i+1;
        //Translate Language
        await util.loader.Show("", "Import dataset " + current_item +  " of " + importdata.data.length);

        //Mapping value set for each entity by pairing header with data string
        var values = {};
        for(var j = 0; j < importdata.header.length; j++) {
            values[importdata.header[j]] = importdata.data[i][j];
        }
    
        /**Calling Kiwi JsonRPC for creating an entry with parsed values for selected entity type
         * Add entity to corresponding response data table if errornous (with error description) or successful (with resulting id)
         */
        await util.CallJsonRPC(importdata.entityType, "create", values)
        .then(data => {
            if(typeof data === 'object') {

                var url = '<a href="' + util.baseUrl + entityTypes[drp_entityTypes.value].path + data.id + "/" + '">Link</a>';
                success[success.length] = [data.id].concat([url], importdata.data[i]);         

            } else {
                error[error.length] = importdata.data[i].concat([data.replaceAll(",","-")]);
            } 
        }) 
    }

    //Populating result data tables
    //Translate Language
    var error_header = entityTypes[drp_entityTypes.value].fieldDisplayNames.concat(["Error description"])
    util.CreateDataTable(datatables, "tbl_result_error", error_header, error);

    var success_headers = ["ID"].concat(["Open in Kiwi TCMS"], entityTypes[drp_entityTypes.value].fieldDisplayNames);
    util.CreateDataTable(datatables, "tbl_result_success", success_headers, success);

    return [success,error];
}

const importer_manual = `<table>
<tr style="margin-bottom: 10px">
  <th style="width: 50px"><p>Step</p></th>
  <th style="width: 900px"><p>Description</p></th>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>1</b></td>
  <td style="text-align:left"><p>In the toolbar select the <b>type of the entity</b> to be imported (e. g. test case) in the corresponding dropdown.</p></td>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>2</b></td>
  <td style="text-align:left">In the toolbar click <b>"Select file"</b> and select the import file which contains the desired datasets from your computer.<br /><p style="color:red">Important: The file must be of type ".csv" with a semicolon (;) delimiter!<br />The file must contain a header row. You can download an import template for the selected entity by clicking the <b>"Download table"</b> button in the preview table section<br />You can download all the allowed basedata for preparing the import by clicking <b>"Download base data" in the footer.</b></p></td>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>3</b></td>
  <td style="text-align:left"><p>In the toolbar click the <b>"Validate file"</b> button and confirm the validation to start validating the uploaded file.</p></td>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>4</b></td>
  <td style="text-align:left"><p>Once the validation has been completed successfully, click the <b>"Start import"</b> button in the footer to start the import.</p></td>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>5</b></td>
  <td style="text-align:left"><p>Wait for the import to finish.<b>Do not close the window during import process!</b></p></td>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>6</b></td>
  <td style="text-align:left"><p>After the import has finished check the successfully imported and errorneous datasets in the tables below.</p></td>
</tr>
</table>`;