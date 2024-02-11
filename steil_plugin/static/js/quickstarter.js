/** 
* Author: Alexander Bartz, IU Internationale Hochschule MMTH01
* Written for Kiwi TCMS Version 12.5 in 2023
* This file contains all the quickstarter tool specific code
*/

/** 
* Importing the neccessary external modules and data
*/
import * as util from './shared.js';
const entityTypes = util.entityTypes;

/** 
* Initializing the containers for the created datatables and the data to be imported
*/
var datatables = {};
var inputFieldContainer = {};
var testcases = {};

var testcases_success = [];
var testrun_success, testplan_success;

/** 
* Initializing the multiple used user interface elements
*/
const btn_validate = document.getElementById('btn-validate');
const btn_start = document.getElementById('btn-start');
const file_input = document.getElementById('inp-file');

Initialize();

function Initialize() {

    //Showing loading screen for duration of base data acquiring 
    //await util.loader.Show("Ladevorgang", "Bitte warten Sie, während die Entitäten geladen werden...");

    //Gets the neccessary basedata for supplying the foreign keys input fields 
    //basedata = await util.GetTCMSData(["Product","Version","PlanType","TestPlan","Build","User"]);

    //Generating the necessary input fields for testruns and testplans
    GenerateInputFields(document.getElementById("testplan-input-container"), "TestPlan");
    GenerateInputFields(document.getElementById("testrun-input-container"), "TestRun");
    GenerateWorkloadField();

    //Initizalizing the empty testcase data table
    util.CreateDataTable(datatables, "tbl_testcase_preview", entityTypes["TestCase"].fieldDisplayNames, null);
    PopulateDependantFields("product");

    util.loader.Hide();
}

/**
* Adding the OnClick Listener for the quickstart button and asking for confirmation to upload
*/
$('#btn-start').click(async function(){
    
    if(ValidateForm()) {

        //Translate Language
        Swal.fire({
            title: "Form incomplete",
            type: "warning",
            width: 400,
            html: "The form is missing some input.<br />Please fill the highlighted fields and try again!"
        });

        return;

    }
    else {
        
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
                RunQuickstart();
            }
        });   
    }
});

/**
* Adding the OnClick Listener for the validate file button
*/
$('#btn-validate').click(function(){
    
    if (file_input.files.length > 0) {
        util.ReadAndValidateFromCSV(file_input.files[0], "TestCase", function(parsedData) {
            if(parsedData.data != null) { 
                CalculateTestRunTime(parsedData.data, parsedData.header);          
                util.CreateDataTable(datatables, "tbl_testcase_preview", entityTypes["TestCase"].fieldDisplayNames, parsedData.displayData);
                testcases = parsedData;
                btn_start.disabled = false;
                //Perform Form Check --> Activate Start Button
            }
        }, {entity: "Category", "field": "product", "value": parseInt(inputFieldContainer.TestPlan.product.value)});
    }
    else {
        //Should not be possible to get into this branch
        alert("Please select a file...");
    }
});

/**
* Adding the OnClick Listener for the download test case data table button
*/
$('#btn-export').click(function(){
    
    util.ExportDataTableToCSV("tbl_testcase_preview");

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

function GenerateWorkloadField() {

    var inputContainer = document.createElement("div");
    inputContainer.setAttribute("class", "steil-plugin-quickstart-input-container col-sm-2");

    var workload_label = document.createElement("label");
    workload_label.setAttribute("class", "steil-plugin-quickstart-input-label");

    //Translate Language
    workload_label.innerHTML = "Workload (h/day):"
    inputContainer.appendChild(workload_label);

    var workload_inputElement = document.createElement("input");
    workload_inputElement.setAttribute("type", "number");    
    workload_inputElement.value = 8;

    workload_inputElement.setAttribute("id", "tester-workload");
    workload_inputElement.setAttribute("class", "steil-plugin-quickstart-input-element");
    workload_inputElement.required = true;
    inputContainer.appendChild(workload_inputElement);

    document.getElementById("testrun-input-container").appendChild(inputContainer);
}

/**
 * Function to reset all user interface elements and temporarily stored data
 */
function ResetInterface() {
    DisableUserElements(false);

    for(var entityType in inputFieldContainer) {

        for(var inputField in inputFieldContainer[entityType]) {

            var input = inputFieldContainer[entityType][inputField];

            if(input.type == "select-one") {

                if(input.required) {
                    
                    input.selectedIndex = 0;

                } else {
                             
                    input.value = "";
                }
            }

            else {
                input.value = "";
            }
        }
    }

    util.CreateDataTable(datatables, "tbl_testcase_preview", entityTypes["TestCase"].fieldDisplayNames, null);

    $('#testplan-id')[0].innerHTML = "";
    $('#testrun-id')[0].innerHTML = "";

    testcases = {};
    testcases_success = [];
    testrun_success = null;
    testplan_success = null;

    file_input.value = "";
    file_input.disabled = false;

    btn_start.disabled = true;
    btn_validate.disabled = true;
}

/**
* Adding the OnChange Listener for the test case file input
*/
$('#inp-file').change(function(){
    
    if (file_input.files.length > 0) {
        btn_validate.disabled = false;
    }
    else {
        btn_validate.disabled = true;
    }

    btn_start.disabled = true;
    util.CreateDataTable(datatables, "tbl_testcase_preview", entityTypes["TestCase"].fieldDisplayNames, null);
    testcases = {};
});

/**
* Adding the OnClick Listener for the show manual button
*/
$('#btn-manual').click(function(){

    //Translate Language
    Swal.fire({
        title: 'User manual',
        html: quickstarter_manual,
        width: 1000
    });

});

/**
 * Runs the quickstarter tool from all given input fields and testcases
 * 1. Create all Testcases from loaded Data
 * 2. Create Testplan from form fields
 * 3. Add all created Testcases to Testplan
 * 4. Create Test run from form fields
 * 5. Add all created Testcases to Test run
 */
async function RunQuickstart() {

    //Translate Language
    await util.loader.Show("Loading", "Please wait while the test plan, test run and test cases are being created ...");

    //Getting values from ui to pass as valuesets to JsonRPC
    var quickStartList = {};

    //Parses the data for testplan and test run in json rpc applicable value sets
    for(var entityType in inputFieldContainer) {
        
        var values = {};

        for(var inputField in inputFieldContainer[entityType]) {

            var input = inputFieldContainer[entityType][inputField];
            values[input.id] = input.value;
        }

        quickStartList[entityType] = values;
    }

    //1. Creating all test cases from read csv-file
    //Translate Language
    await util.loader.Show("Loading", "Creating test cases...");
    for(var i = 0; i < testcases.data.length; i++) {
     
        //Filling value set for each entity by pairing header with data string
        var values = {};
        for(var j = 0; j < testcases.header.length; j++) {
            values[testcases.header[j]] = testcases.data[i][j];
        }

        var current_tc = i+1;

        //Translate Language
        await util.loader.Show("Loading", "Creating test case " + current_tc + " of " + testcases.data.length);
        await util.CallJsonRPC("TestCase", "create", values)
        .then(data => {
            if(typeof data === 'object') {
                
                var url = '<a href="' + util.baseUrl + entityTypes["TestCase"].path + data.id + "/" + '">Open in Kiwi TCMS</a>';
                testcases_success[testcases_success.length] = [data.id].concat([url], Object.values(values)); 

            } else {
               
                util.loader.Hide();

                //Translate Language
                Swal.fire({
                    title: 'Error while creating test cases',
                    html: "An unexpected error occured while creating test case in line " + current_tc + ".< /br>Please check the following error details: < /br>" + data,
                    icon: 'error',
                    width: 400,
                }).then((result) => {
                    if (result.isConfirmed) {          
                        return;
                    }
                }); 

               return;
            } 
        }) 
    }

    //2. Creating test plan from value set and passing resulting testplan id to test run
    //Translate Language
    await util.loader.Show("Loading", "Creating test plan...");
    await util.CallJsonRPC("TestPlan", "create", quickStartList["TestPlan"])
        .then(data => {
            if(typeof data === 'object') {
                testplan_success = data;
                quickStartList["TestRun"]["plan"] = testplan_success.id
            } else {
                
                util.loader.Hide();

                //Translate Language
                Swal.fire({
                    title: 'Error while creating test plan',
                    html: "An unexpected error occured while creating the testplan.< /br>Please check the following error detail: < /br>" + data,
                    icon: 'error',
                    width: 400,
                }).then((result) => {
                    if (result.isConfirmed) {          
                        return;
                    }
                }); 

               return;

            } 
        }) 

    //3. Adding previously created test cases to test plan
    //Translate Language
    await util.loader.Show("Loading", "Adding test cases to test plan ...");
    for(var i = 0; i < testcases_success.length; i++) {

        var current_tc = i+1;
        //Translate Language
        await util.loader.Show("Loading", "Adding test case " + current_tc + " of " + testcases.data.length + " to test plan ...");

        await util.CallJsonRPC("TestPlan", "add_case", [testplan_success.id,testcases_success[i][0]])
        .then(data => {
            if(typeof data === 'object') {
                console.log(data);
            } else {
                
                util.loader.Hide();

                //Translate Language
                Swal.fire({
                    title: 'Error while adding test cases to test plan',
                    html: "An unexpected error occured while adding test case in line " + current_tc + " to the test plan.< /br>Please check the following error details: < /br>" + data,
                    icon: 'error',
                    width: 400,
                }).then((result) => {
                    if (result.isConfirmed) {          
                        return;
                    }
                }); 

               return;

            } 
        }) 
    }

    //4. Creating test run from value set
    //Translate Language
    await util.loader.Show("Loading", "Creating test run...");
    await util.CallJsonRPC("TestRun", "create", quickStartList["TestRun"])
    .then(data => {
        if(typeof data === 'object') {
            testrun_success = data;
        } else {
            util.loader.Hide();

                //Translate Language
                Swal.fire({
                    title: 'Error while creating test run',
                    html: "An unexpected error occured while creating the test run.< /br>Please check the following error detail: < /br>" + data,
                    icon: 'error',
                    width: 400,
                }).then((result) => {
                    if (result.isConfirmed) {          
                        return;
                    }
                }); 

            return;
        } 
    })

    //5. Adding previously created TestCases to Testplan
    //Translate Language
    await util.loader.Show("Loading", "Adding test cases to test run ...");
    for(var i = 0; i < testcases_success.length; i++) {

        var current_tc = i+1;
        //Translate Language
        await util.loader.Show("Loading", "Adding test case " + current_tc + " of " + testcases.data.length + " to the test run ...");

        await util.CallJsonRPC("TestRun", "add_case", [testrun_success.id,testcases_success[i][0]])
        .then(data => {
            if(typeof data === 'object') {
                console.log(data);
            } else {

                util.loader.Hide();

                //Translate Language
                Swal.fire({
                    title: 'Error while adding test cases to test run',
                    html: "An unexpected error occured while adding test case in line " + current_tc + " to the test run.< /br>Please check the following error details: < /br>" + data,
                    icon: 'error',
                    width: 400,
                }).then((result) => {
                    if (result.isConfirmed) {          
                        return;
                    }
                }); 

               return;
            } 
        }) 
    }

    PostQuickstartProcess();
    util.loader.Hide();

    //Translate Language
    Swal.fire(
        "Quickstart completed",
        "The quickstart process has been completed successfully!",
        "success"
    );
}

/**
 * Automatically generates the neccessary input fields for creating testruns and testplans
 * @param {string} container the html dom container to insert the created elements into
 * @param {string} entityTypeName the name of the desired entity type for which the input fields are generated for (testplan|testrun)
 */
function GenerateInputFields(container, entityTypeName) {

    var entityType = entityTypes[entityTypeName];
    inputFieldContainer[entityTypeName] = {};

    for(var i = 0; i<entityType.fieldNames.length; i++) {

        var inputContainer = document.createElement("div");
        inputContainer.setAttribute("class", "steil-plugin-quickstart-input-container col-sm-2");

        var label = document.createElement("label");
        label.setAttribute("class", "steil-plugin-quickstart-input-label");
    
        label.innerHTML = entityType.fieldDisplayNames[i] + ": ";
        inputContainer.appendChild(label);
        
        var inputElement;

        switch(entityType.filterTypes[i]) {
            case "text":

                inputElement = document.createElement("input");
                inputElement.setAttribute("type", "text");     
                break;     
                
            case "date":

                inputElement = document.createElement("input");
                inputElement.setAttribute("type", "date");
                break;

            case "time":

                inputElement = document.createElement("input");
                inputElement.setAttribute("type", "time");
                break;
            
            case "boolean":

                inputElement = document.createElement("input");
                inputElement.setAttribute("type", "checkbox");
                break;

            default:
                
                //For all basedata types of inputfields
                inputElement = document.createElement("select");
                PopulateDropdownFromBaseData(inputElement, entityType.filterTypes[i], entityType.fieldMandatory[i]);        
        }

        inputElement.setAttribute("id", entityType.fieldNames[i]);
        inputElement.setAttribute("class", "steil-plugin-quickstart-input-element");
        inputContainer.appendChild(inputElement);

        //Check if field is mandatory and set required
        if(entityType.fieldMandatory[i]) {
            inputElement.required = true;
        }

        //Dont Show Testplan Selector in Testrun as the test plan will be created at runtime
        if(entityType.fieldNames[i] == "plan") {
            inputContainer.remove();
        }

        else {
            inputFieldContainer[entityTypeName][entityType.fieldNames[i]] = inputElement;
            container.appendChild(inputContainer);
        }

        //Event-listener for dependant select fields
        if(entityType.fieldNames[i] == "product") {
            inputElement.addEventListener("change",function(e){
                PopulateDependantFields(e.target.id);
            })
        }  
        
        if(entityType.fieldNames[i] == "product_version") {
            inputElement.addEventListener("change",function(e){
                PopulateDependantFields(e.target.id);
            })
        }    
        
    }
}

/**
 * Populates the given select element with options of the given entity type name from basedata
 * @param {string} select the dom select element
 * @param {string} entityTypeName the name of the desired entity
 */
function PopulateDropdownFromBaseData(select, entityTypeName, isMandatory) {

    //Sort Dropdown Selects by ID
    var entities = util.KiwiBaseData[entityTypeName].sort((a, b) => (a.id > b.id) ? 1 : -1);
    var displayColumn = util.entityTypes[entityTypeName].displayColumn;

    for(let i = 0; i<entities.length; i++) {

        if(entityTypeName == "User") {
            if(entities[i].id != 1) {
                select.options[select.options.length] = new Option(entities[i].first_name + " " + entities[i].last_name  + " (" + entities[i].id + ")", entities[i].id);
            }
        }
        else {
            select.options[select.options.length] = new Option(entities[i][displayColumn]  + " (" + entities[i].id + ")", entities[i].id);
        }
    }

    if(!isMandatory) {
        //Translate Language
        select.options[select.options.length] = new Option("No selection", "");
        select.value = "";
    }
} 

function CalculateTestRunTime(data, header) {
    
    var test_time = "00:00";
    var dailyWorkloadHours = document.getElementById("tester-workload").value;

    var testers = [];
    var testcases = [];

    for(var i = 0; i < data.length; i++) {

        var values = {};
        for(var j = 0; j < header.length; j++) {
            values[header[j]] = data[i][j];
        }

        testcases.push(values);
    }

    for(var i = 0; i < testcases.length; i++) {
        
        test_time = addTimes(test_time, testcases[i].setup_duration);
        test_time = addTimes(test_time, testcases[i].testing_duration);
        if(!testers.includes(testcases[i].default_tester)) {
            testers.push(testcases[i].default_tester);
        }
    }

    if(document.getElementById("planned_start").value != "" && test_time != "0:00:00" && dailyWorkloadHours != "") {

        var approxTimeInDays = Math.ceil((timeToSecs(test_time) / (dailyWorkloadHours*3600)));
        var calculatedEndDate = addDays(new Date(document.getElementById("planned_start").value), approxTimeInDays, true);

        //Translate Language
        Swal.fire({
            title: 'File is valid',
            html: "The estimated test end date of the test run can be updated! Do you want to set the end date of the test run to <br /><br />" + 
                calculatedEndDate.toISOString().substring(0,10) + "<br /><br />?",
            icon: 'success',
            width: 400,
            showCancelButton: true,
            confirmButtonColor: '#869efc',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
          }).then((result) => {
            if (result.isConfirmed) {          
                document.getElementById("planned_stop").value = calculatedEndDate.toISOString().substring(0,10);
            }
        });  
    }  
}

/**
 * Function to calculate an end date from a given start days, number of days to add and if weekends count as workdays
 * @param {Date} startDate the given start date
 * @param {integer} days the number of days to add 
 * @param {boolean} excludeWeekends specifies if weekends count as workdays
 * @returns End Date
 */
function addDays(startDate, days, excludeWeekends) {

    var date;

    if(excludeWeekends) {
        var count = 0;

        while(count < days){
            date = new Date(startDate.setDate(startDate.getDate() + 1));
            if(date.getDay() != 0 && date.getDay() != 6){
                count++;
            }
        }
    }
    else {
        date = new Date(startDate.setDate(startDate.getDate() + days));
    }

    return date;
}

/** Add times, only deals with positive values
** @param {string} t0 : time in h[:mm[:ss]] format
** @param {string} t1 : time in same format as t0
** @returns {string} summ of t0 and t1 in h:mm:ss format
** Source: https://stackoverflow.com/questions/61978034/how-to-add-minutes-to-hhmmss-in-javascript
**/
function addTimes(t0, t1) {
    return secsToTime(timeToSecs(t0) + timeToSecs(t1));
}
  
// Convert time in H[:mm[:ss]] format to seconds
function timeToSecs(time) {
let [h, m, s] = time.split(':');
return h*3600 + (m|0)*60 + (s|0)*1;
}

// Convert seconds to time in H:mm:ss format
function secsToTime(seconds) {
let z = n => (n<10? '0' : '') + n; 
return (seconds / 3600 | 0) + ':' +
        z((seconds % 3600) / 60 | 0) + ':' +
        z(seconds % 60);
}

/**
 * Validates the test plan and test run forms
 * @returns true, if form has errors and false if form has no errors
 */
function ValidateForm() {

    var error = false;

    if (! $('#quickstartForm')[0].checkValidity()) {
        $('#quickstartForm')[0].reportValidity();
        error = true;
    }

    if(inputFieldContainer.TestRun.planned_start.value != '' && inputFieldContainer.TestRun.planned_stop.value != '') {
        if(Date.parse(inputFieldContainer.TestRun.planned_stop.value) - Date.parse(inputFieldContainer.TestRun.planned_start.value) < 0) {

            //Translate Language
            Swal.fire(
                'Error',
                'The selected end date of the test run must not be before its start date.',
                'error'
              )
            error = true;
        }
    }

    return error;
}

/**
 * Disables all user elements after processing and shows resulting plan and run id
 */
function PostQuickstartProcess() {

    DisableUserElements(true); 

    $('#testplan-id')[0].innerHTML = "(#" + testplan_success.id + ") " + '<a href="' + util.baseUrl + "/plan/"+ testplan_success.id + "/" + '">Open test plan</a>';
    $('#testrun-id')[0].innerHTML = "(#" + testrun_success.id + ") " + '<a href="' + util.baseUrl + "/runs/"+ testrun_success.id + "/" + '">Open test run</a>';

    util.CreateDataTable(datatables, "tbl_testcase_preview", ["ID", "Link"].concat(entityTypes["TestCase"].fieldDisplayNames), testcases_success);

    btn_start.disabled = true;
    btn_validate.disabled = true;
    file_input.disabled = true;
}

/**
 * Help function to enable or disabled all form elements
 * @param {boolean} state desired state of the form elements
 */
function DisableUserElements(state) {
    
    for(var entityType in inputFieldContainer) {

        for(var inputField in inputFieldContainer[entityType]) {

            inputFieldContainer[entityType][inputField].disabled = state;
        }
    }

    document.getElementById('tester-workload').disabled = state;
}

/**
 * Function to dynamically fill the dependant select fields product, product version and build to prevent false data
 * @param {string} trigger the select element triggering the on change event 
 */
function PopulateDependantFields(trigger) {

    var selected_product = inputFieldContainer.TestPlan.product.value;
    var product_version_selector = inputFieldContainer.TestPlan.product_version;
    var selected_version = product_version_selector.value;
    var build_selector = inputFieldContainer.TestRun.build;
    
    let available_product_versions = util.KiwiBaseData.Version.filter(function (version) {
        return version.product == selected_product;
    });

    let available_builds = util.KiwiBaseData.Build.filter(function (build) {

        if(trigger == "product") {
            return build.version == available_product_versions[0].id;
        }

        else if(trigger == "product_version") {
            return build.version == selected_version;
        }

    });

    //Remove all currently offered select options

    if(trigger == "product") {
        var i, L = product_version_selector.options.length - 1;
        for(i = L; i >= 0; i--) {
            product_version_selector.remove(i);
        }

        //Add the available testruns for the selected testplan to the dropdown
        for(let i = 0; i<available_product_versions.length; i++) {
            product_version_selector.options[product_version_selector.options.length] = new Option(available_product_versions[i].value + " (" + available_product_versions[i].id + ")", available_product_versions[i].id);
        }
    }

    //Remove all currently offered select options
    var i, L = build_selector.options.length - 1;
    for(i = L; i >= 0; i--) {
        build_selector.remove(i);
    }

    //Add the available testruns for the selected testplan to the dropdown
    for(let i = 0; i<available_builds.length; i++) {
        build_selector.options[build_selector.options.length] = new Option(available_builds[i].name + " (" + available_builds[i].id + ")", available_builds[i].id);
    }
}

const quickstarter_manual = `<table>
<tr style="margin-bottom: 10px">
  <th style="width: 50px"><p>Step</p></th>
  <th style="width: 850px"><p>Description</p></th>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>1</b></td>
  <td style="text-align:left"><p>In the test plan section fill all of the form elements in accordance to your test plan.</p></td>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>2</b></td>
  <td style="text-align:left">In the test run section fill all of the form elements in accordance to your test run.</p></td>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>3</b></td>
  <td style="text-align:left"><p>In the test case section click <b>"Select file"</b> and select the import file which contains the desired test cases from your computer.<br /><p style="color:red">Important: The file must be of type ".csv" with a semicolon (;) delimiter!<br />The file must contain a header row. You can download an import template for the test cases by clicking the <b>"Download table"</b> button in the preview table section</p></td>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>4</b></td>
  <td style="text-align:left"><p>In the test case section click the <b>"Validate file"</b> button and confirm the validation to start validating the uploaded file.</p></td>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>5</b></td>
  <td style="text-align:left"><p>Once the validation has been completed successfully, click the <b>"Start quickstart"</b> button in the footer to start the quickstart process.</p></td>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>6</b></td>
  <td style="text-align:left"><p>Wait for the quickstart process to finish.<b>Do not close the window during the process!</b></p></td>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>7</b></td>
  <td style="text-align:left"><p>After the quickstart has finished successfully check the created test run and test plan by clicking the buttons of the corresponding tool bar.</p></td>
</tr>
</table>`;