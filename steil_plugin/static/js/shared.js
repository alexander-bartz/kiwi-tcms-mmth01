/** 
* Author: Alexander Bartz, IU Internationale Hochschule MMTH01
* Written for Kiwi TCMS Version 12.5 in 2023
* This file contains all the code shared by the different tools importer, exporter, reporter
*/

/** 
* Importing the neccessary external modules and data
*/
import { jsonRPC } from '../../../static/js/jsonrpc.js'

/**Specifies the allowed entity types for calling Kiwi TCMS rpc api
 * id: specifies the corresponding api entity 
 * displayName: specifies the name to be displayed in the user interface e.g. dropdown
 * fieldDisplayNames: specifies the german display names for the columns titles e.g. in datatables
 * fieldNames: specifies the allowed fieldnames for calling the Kiwi TCMS rpc api
 * filterTypes: specifies the corresponding field type of the filter
 * filterOnly: specifies whether the entity type is only filterable (implies not being able to call create statement in Kiwi TCMS rpc api) (true|false)
 * baseData: specified whether the entity type identifies as basedata
 * path: the relative path to this entity in Kiwi TCMS
 * Translate Language
 */
export const entityTypes = {
    "Build": {
        "displayName": 'Build',
        "displayColumn": 'name',
        "fieldDisplayNames": ['Name', 'Version (ID)', 'Is active?'],
        "fieldNames": ['name','version','is_active'],
        "filterTypes": ['text', 'Version', 'boolean'],
        "fieldMandatory": [true, true, true],
        "filterOnly": false,
        "baseData": true,
        "path": "admin/management/build/"
    },
    "Category": {
        "displayName": 'Test object',
        "displayColumn": 'name',
        "fieldDisplayNames": ['Name', 'Product (ID)', 'Description'],
        "fieldNames": ['name','product','description'],
        "filterTypes": ['text', 'Product', 'text'],
        "fieldMandatory": [true, true, true],
        "filterOnly": false,
        "baseData": true,
        "path": "admin/testcases/category/"
    },
    "Classification": {
        "displayName": 'Classification',
        "displayColumn": 'name',
        "fieldDisplayNames": ['Name'],
        "fieldNames": ['name'],
        "filterTypes": ['text'],
        "fieldMandatory": [true],
        "filterOnly": false,
        "baseData": true,
        "path": "admin/management/classification/"
    },
    "Component": {
        "displayName": 'Component',
        "displayColumn": 'name',
        "fieldDisplayNames": ['Name', 'Product (ID)', 'Owner (ID)', 'Contact (ID)', 'Description'],
        "fieldNames": ["name","product","initial_owner","initial_qa_contact","description"],
        "filterTypes": ['text', 'Product', 'User', 'User', 'text'],
        "fieldMandatory": [true, true, true, true, true],
        "filterOnly": false,
        "baseData": true,
        "path": "admin/management/component/"
    },
    'Environment': {
        "displayName": 'Environment',
        "displayColumn": 'name',
        "fieldDisplayNames": ['Name', 'Description'],
        "fieldNames": ["name", "description"],
        "filterTypes": ['text', 'text'],
        "fieldMandatory": [true, true],
        "filterOnly": false,
        "baseData": true,
        "path": "admin/testruns/environment/"
    },
    'PlanType': {
        "displayName": 'Plan type',
        "displayColumn": 'name',
        "fieldDisplayNames": ['Name', 'Description'],
        "fieldNames": ["name", "description"],
        "filterTypes": ['text', 'text'],
        "fieldMandatory": [true, true],
        "filterOnly": false,
        "baseData": true,
        "path": "admin/testplans/plantype/"
    }, 
    'Priority': {
        "displayName": 'Priority',
        "displayColumn": 'value',
        "fieldDisplayNames": ['Value', 'Is active?'],
        "fieldNames": ["value", "is_active"],
        "filterTypes": ['text', 'boolean'],
        "fieldMandatory": [true, true],
        "filterOnly": true,
        "baseData": true,
        "path": "admin/management/priority/"
    }, 
    'Product': {
        "displayName": 'Product',
        "displayColumn": 'name',
        "fieldDisplayNames": ['Name', 'Classification (ID)', 'Description'],
        "fieldNames": ["name", "classification", "description"],
        "filterTypes": ['text', 'Classification', 'text'],
        "fieldMandatory": [true, true, true],
        "filterOnly": false,
        "baseData": true,
        "path": "admin/management/product/"
    },
    "TestCase": {
        "displayName": 'Test case',
        "displayColumn": 'summary',
        "fieldDisplayNames": ["Summary", "Requirement", "Notes", "Text", "Setup duration (HH:MM)", "Testing duration (HH:MM)", "Status (ID)", "Test object (ID)", "Priority (ID)", "Author (ID)", "Default tester (ID)", "Reviewer (ID)","Is Automated?", "Script", "Arguments", "Extra-Link"],
        "fieldNames": ["summary","requirement","notes","text","setup_duration","testing_duration","case_status","category","priority","author","default_tester","reviewer","is_automated","script","arguments","extra_link"],
        "filterTypes": ["text","text","text","text","time","time","TestCaseStatus","Category","Priority","User","User","User","boolean","text","text","text"],
        "fieldMandatory": [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
        "filterOnly": false,
        "baseData": false,
        "path": "case/"
    },
    "TestCaseStatus": {
        "displayName": 'Test case status',
        "displayColumn": 'name',
        "fieldDisplayNames": ["Name", "Description", "Is confirmed?"],
        "fieldNames": ["name", "description", "is_confirmed"],
        "filterTypes": ["text", "text", "boolean"],
        "fieldMandatory": [true, true, true],
        "filterOnly": true,
        "baseData": true,
        "path": "admin/testcases/testcasestatus/"
    },
    "TestExecution": {
        "displayName": 'Test execution',
        "displayColumn": 'tested_by',
        "fieldDisplayNames": ["Assignee (ID)", "Tested by (ID)", "Test case version", "Start date", "Stop date", "Sort key", "Test run (ID)", "Test case (ID)", "Status (ID)", "Build (ID)"],
        "fieldNames": ["assignee", "tested_by", "case_text_version", "start_date", "stop_date", "sortkey", "run", "case", "status", "build"],
        "filterTypes": ["User", "User", "text", "date", "date", "text", "TestRun", "TestCase", "TestExecutionStatus", "Build"],
        "fieldMandatory": [true, true, true, true, true, true, true, true, true, true],
        "filterOnly": true,
        "baseData": false,
    },
    "TestExecutionStatus": {
        "displayName": 'Test execution status',
        "displayColumn": 'name',
        "fieldDisplayNames": ["Name", "Weight", "Icon", "Color"],
        "fieldNames": ["name", "weight", "icon", "color"],
        "filterTypes": ["text", "text", "text", "text"],
        "fieldMandatory": [true, true, true, true],
        "filterOnly": true,
        "baseData": true,
        "path": "admin/testruns/testexecutionstatus/"
    },
    'TestPlan': {
        "displayName": 'Test plan',
        "displayColumn": 'name',
        "fieldDisplayNames": ["Name", "Text", "Product (ID)", "Product version (ID)", "Plan type (ID)", "Parent plan (ID)"],
        "fieldNames": ["name", "text", "product", "product_version", "type", "parent"],
        "filterTypes": ["text", "text", "Product", "Version", "PlanType", "TestPlan"],
        "fieldMandatory": [true, true, true, true, true, false],
        "filterOnly": false,
        "baseData": true,
        "path": "plan/"
    },
    'TestRun': {
        "displayName": 'Test run',
        "displayColumn": 'summary',
        "fieldDisplayNames": ["Summary", "Notes", 'Planned start', "Planned stop", "Test plan (ID)", "Build (ID)", "Test manager (ID)", "Default tester (ID)"],
        "fieldNames": ["summary", "notes", "planned_start","planned_stop","plan","build","manager","default_tester"],
        "filterTypes": ["text", "text", "date", "date", "TestPlan","Build","User","User"],
        "fieldMandatory": [true, true, true, true, true, true, true, true],
        "filterOnly": false,
        "baseData": true,
        "path": "runs/"
    },
    'Version': {
        "displayName": 'Version',
        "displayColumn": 'value',
        "fieldDisplayNames": ["Value", "Product (ID)"],
        "fieldNames": ["value", "product"],
        "filterTypes": ["text", "Product"],
        "fieldMandatory": [true],
        "filterOnly": false,
        "baseData": true,
        "path": "admin/management/version/"
    },
    'User': {
        "displayName": 'User',
        "displayColumn": 'username',
        "fieldDisplayNames": ["Username", "Firstname", "Lastname", "Email", "Is active?", "Is staff?", "Is superuser?"],
        "fieldNames": ["username", "firstname", "lastname", "email", "is_active", "is_staff", "is_superuser"],
        "filterTypes": ['text', 'text', 'text', 'text', 'boolean', 'boolean', 'boolean'],
        "fieldMandatory": [true, true, true, true, true, true, true],
        "filterOnly": true,
        "baseData": true,
        "path": "acounts/admin-users"
    },
}

export const baseUrl = "http://127.0.0.1:8000/";

//Parse KiwiBaseData from Django ViewContext
export var KiwiBaseData;
KiwiBaseData = JSON.parse(document.getElementById('base-data').textContent);
document.getElementById('base-data').remove();

/**
 * Funtion to (re)create a jquery datatable from given headers and optional body data on the specified table id 
 * @param {Object} sourcetables - the datatable object containing the datatables of the origin document
 * @param {string} table_id - the html dom id of the target table
 * @param {string[]} headers - a string array of the header column titles
 * @param {string[Object]} data - an optional array of objects representing the body data
 */
export function CreateDataTable(sourcetables, table_id, headers, data = null, searching = false) {

    //Deletes and recreates datatable if already existing, because jquery datatables dont support updating column count and body data
    if (sourcetables[table_id]) {
        var tbl_wrapper = document.getElementById(table_id + "_wrapper");
        tbl_wrapper.innerHTML = '';
        var tbl = document.createElement("table");
        tbl.setAttribute('id', table_id);
        tbl_wrapper.appendChild(tbl);
    }

    //Creates the column titles from headers parameter
    var columns = [];

    for (var i = 0; i < headers.length; i++) {
        columns.push({ title: headers[i] });
    }

    //Creates jquery datatable with given parameters
    sourcetables[table_id] = new DataTable('#' + table_id, {
        columns: columns,
        data: data,
        pageLength: 5,
        searching: searching,
        info: false
    });
}

/**
 * Function to export and download given datatable to a csv file and 
 * @param {string} table_id - the html dom id of the target table
 */
export function ExportDataTableToCSV(table_id) {

    var tbl = $('#' + table_id).DataTable();

    //Getting the column and row details of the selected datatable
    var table_data_rows = tbl.rows().data();
    var data_rows = "";
    table_data_rows.map(row => data_rows += row.join(';') + '\n');

    var table_data_columns = tbl.columns().header().map(d => d.textContent).toArray();
    var data_columns = "";
    data_columns = table_data_columns.toString().replaceAll(",", ";") + "\n";

    var export_data = data_columns + data_rows;

    ExportDataToCSV([export_data], 'export_' + table_id + '.csv');
}

/**
 * Exports given comma separated data as csv file with given name
 * @param {string} data the data to be exported
 * @param {string} filename the filename of the created csv file
 */
export function ExportDataToCSV(data, filename) {
    var blob = new Blob([data], { type: "text/csv;charset=utf-8" });
    saveAs(blob, filename);
}

/**
 * Reads the text content from a specified csv-file, validates is against a given entity type and returns the result within a callback function
 * @param {string} file specifies the file path e. g. from file input
 * @param {string} entityType specifies the entity type for which the table is loaded
 * @param {string} callback specifies the callback function to be called and returns parsedData with entity type, data and header
 * @param {object} additionalCriteria optional passable aditional criteria for validation check
 */
export async function ReadAndValidateFromCSV(file, entityType, callback, additionalCriteria = null) {

    //Reads all content from the selected .csv-file
    var reader = new FileReader();
    reader.readAsText(file);
    var parsedData = {};

    //Once loaded parse the loaded data 
    reader.onload = async function (event) {

        var csvdata = event.target.result;
        var data = ParseCSV(csvdata, "array");
        var errorList = [];
        var displayData = [];

        var regexTime = /^[0-9]+:[0-5][0-9]$/;
        var regexDate = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;

        //Translate language
        await loader.Show("Validating", "Validate datasets...");

        //Check if imported data scheme fits required data scheme of the entity and otherwise return error
        for (var i = 0; i < data.length; i++) {

            displayData[i] = JSON.parse(JSON.stringify(data[i]));

            //First perform column check
            //Translate language
            if (data[i].length != entityTypes[entityType].fieldNames.length) {
                errorList[errorList.length] = [i ,"Column count", "The column count of the import file does not fit the column count of the target table. Target table: " + entityTypes[entityType].fieldNames.length + " Import table: " + data[i].length];
            }
            
            //If column width fits -> perform type and mandatory checks
            else {              
           
                for(var j = 0; j < data[i].length; j++) {

                    //Get corresponding field type, fieldname and mandatory
                    var fieldType = entityTypes[entityType].filterTypes[j];
                    var fieldname = entityTypes[entityType].fieldDisplayNames[j];
                    var isMandatory = entityTypes[entityType].fieldMandatory[j];

                    //Check if field is mandatory but empty
                    //Translate Language
                    if(isMandatory && data[i][j].length == 0) {
                        errorList[errorList.length] = [i+1, fieldname, "Field is mandatory: The field '" + fieldname + "' is not filled, it must be of type '" + fieldType + "'. Please fill the field accordingly."]
                    }

                    //Otherweise check if field is field at all to perform field type check
                    else if(data[i][j].length > 0) {

                        //Check if entity id exists if not of field type text, date, time or boolean
                        if(fieldType !== "text" && fieldType !== "date" && fieldType !== "time" && fieldType !== "boolean") {
                            var entities = KiwiBaseData[fieldType];
                            var displayColumn = entityTypes[fieldType].displayColumn;
                            var object = entities.find(obj => obj.id === parseInt(data[i][j]));
                            if(!object) {
                                //Translate Language
                                errorList[errorList.length] = [i+1, fieldname, "Entity error: Entity '" + fieldType + "' with the ID '" + data[i][j] + "' does not exist. Please check the possible IDs of the entity."];
                            } else {
                                displayData[i][j] = object[displayColumn] + " (" + data[i][j] + ")";
                            }
                        }

                        //Validate string if field type is time
                        if(fieldType == "time" && !regexTime.test(data[i][j])) {              
                            //Translate Language      
                            errorList[errorList.length] = [i+1, fieldname, "Time error: the time format '" + data[i][j] + "' is not correct. Please enter a valid time format in HH:MM."];
                        }

                        //Validate string if field type is date
                        if(fieldType == "date" && !regexDate.test(data[i][j])) {
                            //Translate Language
                            errorList[errorList.length] = [i+1, fieldname, "Date error: the date format '" + data[i][j] + "' is not correct. Please enter a valid date format in YYYY-MM-DD."];
                        }

                        //Validate string if field type is boolean
                        if(fieldType == "boolean") {
                            if(!(data[i][j].toLowerCase() == 'true' || data[i][j].toLowerCase() == 'false')) {
                                //Translate Language
                                errorList[errorList.length] = [i+1, fieldname, "Boolean error: the boolean field '" + data[i][j] + "' is not correct. Allowed values are 'True' and 'False'."];
                            }
                            else {
                                switch(data[i][j].toLowerCase()) {
                                    case "true":
                                        displayData[i][j] = "Yes"; 
                                        break;
                                    case "false": 
                                        displayData[i][j] = "No";
                                        break;
                                }                         
                            }
                        }

                        /*If there are additional criterias passed to validate against - these criteria can be processed as followed
                        * Especially used to check test cases in quickstart for valid categories for product of testplan
                        */
                        if(additionalCriteria) {
                            
                            if(fieldType == additionalCriteria.entity) {
                                var dependantObject = KiwiBaseData[fieldType].find(obj => obj.id === parseInt(data[i][j]));
                                if(dependantObject[additionalCriteria.field] != additionalCriteria.value) {
                                    errorList[errorList.length] = [i+1, fieldname, "Entity reference error: the entity '" + fieldType + "' with ID '" + data[i][j] + "' is not allowed for the entity '" + additionalCriteria.field + "' with ID '" + additionalCriteria.value + "'"];
                                }
                            }
                        }
                    }   
                }
            }
        }

        loader.Hide();

        //If import column-width fits target table width populate preview data table and store data for import
        if (errorList.length == 0) {
            
            parsedData["entityType"] = entityType;
            parsedData["data"] = data;
            parsedData["displayData"] = displayData;
            parsedData["header"] = entityTypes[entityType].fieldNames;

            //Translate Language
            Swal.fire({
                title: "File is valid",
                icon: "success",
                width: 400,
                html: "The selected file is valid.<br />Please check the preview table before you continue."
            });

        }
        else {
            //Translate Language
            Swal.fire({
                title: 'File is not valid',
                html: "Some errors have been detected in the selected file!<br />A detailed summary of the errors can be downloaded below.<br />Please fix the errors and try validating the new file.",
                icon: 'error',
                width: 400,
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Download logs',
                cancelButtonText: 'Close'
              }).then((result) => {
                if (result.isConfirmed) {             
                    var error_data_rows = "Row count;Field name;Description\n";
                    errorList.map(row => error_data_rows += row.join(";") + '\n');          
                    ExportDataToCSV([error_data_rows], "error_list_" + entityType + ".csv");
                }
            })
        }

        callback(parsedData);
    }
}

/**
 * Function to parse loaded csv string and return an array or json object for the read csv string
 * @param {string} csv - the loaded csv string to process
 * @param {string} type - specifies the desired output type ("array"|"json")
 * @returns parsed csv file as array or json object
 */
function ParseCSV(csv, type) {

    //Reading CSV and removing all empty rows
    var lines = csv.split("\n").filter((str) => str !== '');;
    var result_json = [];
    var result_array = [];
    var headers = lines[0].split(";");

    for (var i = 1; i < lines.length; i++) {

        var obj = {};
        var arr = [];

        var currentline = lines[i].replace(/[\r\n]/g, "").split(";");

        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
            arr.push(currentline[j]);
        }

        result_json.push(obj);
        result_array.push(arr);
    }

    if(type === "array") {
        return result_array;
    } else {
        return result_json;
    }
}

/**
 * Async function to call Kiwi TCMS json rpc api to retreive all entities marked as basedata
 * @returns dict of responses from json rpc call as object
 */
export async function GetAllTCMSData() {
    
    var result = {};

    for(var entityType in entityTypes) {
        
        if(entityTypes[entityType].baseData) {
            await CallJsonRPC(entityType, "filter", {}) .then(data => {
                result[entityType] = data;
            });
        }
    }

    return result;
}

/**
 * Async function to call Kiwi TCMS json rpc api to retreive specific all entities for given entity types
 * @param {string[]} entityQuery - the specific entity types to be retreived
 * @returns dict of responses from json rpc call as object
 */
export async function GetTCMSData(entityQuery) {
    
    var entityData = {};

    for(var i = 0; i < entityQuery.length; i++) {
        await CallJsonRPC(entityQuery[i], "filter", {}) .then(data => {
            entityData[entityQuery[i]] = data;
        });
    }

    return entityData;
}

/**
 * Async function to call Kiwi TCMS json rpc api to await each individual dataset result
 * @param {string} entity - the selected entity
 * @param {string} method - the selected api method ("create"|"filter")
 * @param {json} values - the valueset for the specific entity
 * @returns response from json rpc call as object
 */
export async function CallJsonRPC(entity, method, values) {
    
    var result;

    await jsonRPC(entity + '.' + method, values, data => {
        result = data;
    }, true);

    return result;
}

/**
 * Loading Screen class, used to show frosted browser display at runtime while aquiring or writing data from or the the server
 */
export class LoadingScreen {

    /**
     * Constructor for loading screen class
     * @param {string} headerText headertext to be displayed 
     * @param {string} bodyText bodytext to be displayed 
     */
    constructor(headerText, bodyText) {

        this.text = {};
        this.text.headerText = headerText;
        this.text.bodyText = bodyText;

        this.wrapper = document.createElement("div");
        this.wrapper.setAttribute("id", "loader-wrapper");
        
        this.content = document.createElement("div");
        this.content.setAttribute("id", "loader-content");

        this.title = document.createElement("div");
        this.title.setAttribute("id", "loader-title");
        this.title.setAttribute("class", "row");

        this.body = document.createElement("div");
        this.body.setAttribute("id", "loader-body");
        this.body.setAttribute("class", "row");

        this.header = document.createElement("h4");

        this.title.appendChild(this.header);
        this.content.appendChild(this.title);
        this.content.appendChild(this.body)
        this.wrapper.appendChild(this.content);

        new Binding({
            object: this.text,
            property: "headerText"
        })
        .addBinding(this.header, "innerHTML")

        new Binding({
            object: this.text,
            property: "bodyText"
        })
        .addBinding(this.body, "innerHTML")

        document.body.prepend(this.wrapper);
    }

    //Hides the loading screen
    Hide() {
        this.wrapper.style.visibility = "hidden";
    }

    /**
     * Sets the loading screen content, async because html dom draws to slowly, there is potencial for optimization
     * @param {string|null} headerText headertext to be displayed 
     * @param {string|null} bodyText bodytext to be displayed
     */
    async Show(headerText=null, bodyText=null) {
        if(headerText) this.text.headerText = headerText;
        if(bodyText) this.text.bodyText = bodyText;
        this.wrapper.style.visibility = "visible";
        await new Promise(r => setTimeout(r, 10));
    }
}

export const loader = new LoadingScreen(null, null);
loader.Hide();

/**
 * Funtion for bi-directional binding dom elements to objects, used to minimize dom calls
 * Source: https://www.atmosera.com/blog/data-binding-pure-javascript/
 * @param {{object, property}} b object and property to bind dom element to
 */
function Binding(b) {
    var _this = this;
    this.elementBindings = []
    this.value = b.object[b.property]
    this.valueGetter = function(){
        return _this.value;
    }
    this.valueSetter = function(val){
        _this.value = val
        for (var i = 0; i < _this.elementBindings.length; i++) {
            var binding=_this.elementBindings[i]
            binding.element[binding.attribute] = val
        }
    }
    this.addBinding = function(element, attribute, event){
        var binding = {
            element: element,
            attribute: attribute
        }
        if (event){
            element.addEventListener(event, function(event){
                _this.valueSetter(element[attribute]);
            })
            binding.event = event
        }       
        this.elementBindings.push(binding)
        element[attribute] = _this.value
        return _this
    }

    Object.defineProperty(b.object, b.property, {
        get: this.valueGetter,
        set: this.valueSetter
    }); 

    b.object[b.property] = this.value;
}

export function ExceptionHandler(errorText) {
    
    //Translate Language
    Swal.fire({
        title: "An unexpected error occured",
        icon: "error",
        width: 400,
        html: "The following error occured: <br /> <br />" + errorText + "<br /> <br />Please contact the software developer and append the given error description."
    });

}

// async function TEST_jsonRPC (rpcMethod, rpcParams, callback, isSync) {
//     // .filter() args are passed as dictionary but other args,
//     // e.g. for .add_tag() are passed as a list of positional values
//     if (!Array.isArray(rpcParams)) {
//         rpcParams = [rpcParams]
//     }

//     await $.ajax({
//         url: '/json-rpc/',
//         async: isSync !== true,
//         data: JSON.stringify({
//             jsonrpc: '2.0',
//             method: rpcMethod,
//             params: rpcParams,
//             id: 'jsonrpc'
//         }), // id is needed !!
//         // see "Request object" at https://www.jsonrpc.org/specification
//         type: 'POST',
//         dataType: 'json',
//         contentType: 'application/json',
//         success: function (result) {
//             if (result.error) {
//                 callback(result.error.message);
//             } else {
//                 callback(result.result);
//             }
//         },
//         error: function (err, status, thrown) {
//             console.log('*** jsonRPC ERROR: ' + err + ' STATUS: ' + status + ' ' + thrown)
//         }
//     })
// }

// async function RunSingleRPC(entity) {

//     var result;

//     await TEST_jsonRPC(entity + ".filter", {}, (data) => {
//         result = data;
//     }, false);
    
//     return result;
// }


// export async function RunAllRPC() {

//     const userIds = ["t", "t", "t"];
//     const promises = userIds.map((i) => RunSingleRPC(i));

//     const results = await Promise.all(promises);
//     console.log(results);
// }