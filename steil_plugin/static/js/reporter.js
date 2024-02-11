/** 
* Author: Alexander Bartz, IU Internationale Hochschule MMTH01
* Written for Kiwi TCMS Version 12.5 in 2023 
* This file contains all the reporter tool specific code
*/

/** 
* Importing the neccessary external modules and data
* Translate Language
*/
import * as util from './shared.js';
const domBody = document.getElementById("body-content");
const runSelector = document.getElementById("drp-testrun");
const planSelector = document.getElementById("drp-testplan");
const diagrammTypeSelector = document.getElementById("drp-add-diagramm-diagrammtype");
const statusTypeSelector = document.getElementById("drp-add-diagramm-statustype");
const fieldSelector =  document.getElementById("drp-add-diagramm-field");
const fieldGroupSelector =  document.getElementById("drp-add-diagramm-groupfield");

const testplan_text_container = $('#testplan-text')[0];
const testplan_plantype_container = $('#testplan-plantype')[0];
const testplan_author_container = $('#testplan-author')[0];
const testplan_created_at_container = $('#testplan-created-at')[0];
const testplan_product_container = $('#testplan-product')[0];
const testplan_product_version_container = $('#testplan-product-version')[0];

const testrun_summary_container = $('#testrun-summary')[0];
const testrun_manager_container = $('#testrun-manager')[0];
const testrun_default_tester_container = $('#testrun-default-tester')[0];
const testrun_notes_container = $('#testrun-notes')[0];
const testrun_planned_start_container = $('#testrun-planned-start')[0];
const testrun_planned_stop_container = $('#testrun-planned-stop')[0];
const testrun_started_at_container = $('#testrun-started-at')[0];
const testrun_stopped_at_container = $('#testrun-stopped-at')[0];
const testrun_total_estimation_container = $('#testrun-total-estimation')[0];
const testrun_booked_times_container = $('#testrun-booked-times')[0];
const testrun_remaining_estimate_container = $('#testrun-remaining-estimates')[0];

/**
 * Reporting Config
 * Specifies status types (testexecution, bugs), visualisation diagrams and reportable data fields for each status type
 * Consider changing these settings when additional fields are needed, see Kiwi TCMS data model for further information
*/
const statusTypes = [{"label": "Test Executions", "id": "test"}, {"label": "Errors", "id": "error"}];
const diagrammTypes = [{"label": "Bar chart", "id": "bar"}, {"label": "Line chart", "id": "line"}, {"label": "Pie chart", "id": "pie"}];
const fieldTypes = {
    "test": [
        {"label": "Assignee", "id": "assignee__username"}, 
        {"label": "Test object", "id": "category__name"},
        {"label": "Priority", "id": "priority__value"},
        {"label": "Status", "id": "status__name"}
    ], 
    "error": [
        {"label": "Severity", "id": "severity__name"}, 
        {"label": "Priority", "id": "priority__value"},
        {"label": "Test object", "id": "category__name"}, 
        {"label": "Status", "id": "status"}
    ]};

//Charts and datatable containers storing all the currently active charts and tables in the canvas
var charts = {};
var datatables = {};

/** ReportData holds all the current data to be displayed in the created charts
 * Currently these are information for test plan, test run and corresponding test executions and bugs
 */
var reportData = {};

Initialize();

/**
 * Populate user interface elements and fetch report data
 * Populate selectors for test plan and test run, visualisation selectors
 * Fetch and display plan, run information data and create default visualisations
 */
function Initialize() {

   PopulateHeaderSelectors();
   PopulateVisualisationSelectors();
   PopulatePlanRunInformation();
   PopulateInitialReports();

}

/**
 * Populates some default report charts and data tables considering test strategy
 */
function PopulateInitialReports() {
    CreateChartContainer("test","pie","status__name", "nogroup");
    CreateChartContainer("test","bar","category__name", "status__name");
    CreateChartContainer("test","bar","priority__value", "status__name");
    CreateChartContainer("test","bar","assignee__username", "status__name");

    CreateChartContainer("error","bar", "category__name", "nogroup");
    CreateChartContainer("error","bar","severity__name", "category__name");
    CreateChartContainer("error","bar","severity__name", "status");
    CreateTableContainer("error","priority__value", "severity__name");

}

/**
 * Create listener for the add new chart button
 */
$('#btn-addChart').click(function(){
    CreateChartContainer(statusTypeSelector.value, diagrammTypeSelector.value, fieldSelector.value, fieldGroupSelector.value);
});

/**
 * Create listener for the add new chart button
 */
$('#btn-addTable').click(function(){
    CreateTableContainer(statusTypeSelector.value, fieldSelector.value, fieldGroupSelector.value);
});

/**
* Adding the OnClick Listener for the show manual button
*/
$('#btn-manual').click(function(){

    //Translate Language
    Swal.fire({
        title: 'User manual',
        html: reporter_manual,
        width: 1000
    });

});

/**
* Adding the OnClick Listener for the reset button
*/
$('#btn-reset').click(function(){

    //Translate Language
    Swal.fire({
        title: 'Confirm reset',
        html: "Are you sure you want to reset the dashboard? <br />All charts and tables will be removes from the canvas!",
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
* Adding the OnClick Listener for the toggle plan & run information button
*/
$('#btn-toggle-planinfo').click(function(){

    if(document.getElementById("testplan-container").style.contentVisibility == "" || document.getElementById("testplan-container").style.contentVisibility == "visible") {
        document.getElementById("testplan-container").style.contentVisibility = "hidden";
        document.getElementById("testrun-container").style.contentVisibility = "hidden";
        document.getElementById("btn-toggle-planinfo").textContent = "Expand";
    }
    else {
        document.getElementById("testplan-container").style.contentVisibility = "visible";
        document.getElementById("testrun-container").style.contentVisibility = "visible";
        document.getElementById("btn-toggle-planinfo").textContent = "Collapse";
    }
});

/**
* Adding the OnClick Listener for the toggle toolbar button
*/
$('#btn-toggle-toolbar').click(function(){

    if(document.getElementById("toolbar-header-container").style.contentVisibility == "" || document.getElementById("toolbar-header-container").style.contentVisibility == "visible") {
        document.getElementById("toolbar-header-container").style.contentVisibility = "hidden";
        document.getElementById("toolbar-body-container").style.contentVisibility = "hidden";
        document.getElementById("btn-toggle-toolbar").textContent = "Expand";
    }
    else {
        document.getElementById("toolbar-header-container").style.contentVisibility = "visible";
        document.getElementById("toolbar-body-container").style.contentVisibility = "visible";
        document.getElementById("btn-toggle-toolbar").textContent = "Collapse";
    }
});

/**
* Adding the OnClick Listener for the export Pdf-Button
*/
$('#btn-export-pdf').click(function(){

    //Translate Language
    Swal.fire({
        title: 'Download as PDF',
        html: "Are you sure you want to download the status report as a PDF file?",
        width: 400,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Download',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
            CreatePDFExport();
        }
    });

});

/**
* Adding the OnClick Listener for the Export-CSV Button
*/
$('#btn-export-csv').click(function(){

    //Translate Language
    Swal.fire({
        title: 'Download as CSV',
        html: "Are you sure you want to download the selected data as a csv-file?",
        width: 400,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Download',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
            var currentdate = new Date(); 
            util.ExportDataToCSV(PrepareDataExport("test"),"testexecutions_"+ reportData["testrun"].id + "_" + currentdate + "_.csv");
            util.ExportDataToCSV(PrepareDataExport("error"),"errors_"+ reportData["testrun"].id + "_" + currentdate + "_.csv");
        }
    });

});

/**
* Adding the OnChange Listener for status type selector
* Upon changing the type (test executions, bugs) only the allowed fields are filtered in the succeeding fields
*/
statusTypeSelector.addEventListener("change", (event) => {
    CreateAndPopulateFieldSelector(fieldSelector, statusTypeSelector.value);
    CreateAndPopulateFieldSelector(fieldGroupSelector, statusTypeSelector.value);
});

/**
 * Populates the necessary dropdown fields for creating a new chart or table
 */
function PopulateVisualisationSelectors() {

    CreateAndPopulateStatusSelector(statusTypeSelector);
    CreateAndPopulateDiagrammSelector(diagrammTypeSelector);
    CreateAndPopulateFieldSelector(fieldSelector, "test");
    CreateAndPopulateFieldSelector(fieldGroupSelector, "test");

}

/**
 * Populates the necessary dropdown fields for testplans and testruns to be reported
 */
function PopulateHeaderSelectors() {

    //Fill the testplan dropdown with all available testplans
    for(let i = 0; i<util.KiwiBaseData.TestPlan.length; i++) {
        planSelector.options[planSelector.options.length] = new Option(util.KiwiBaseData.TestPlan[i].name + " (" + util.KiwiBaseData.TestPlan[i].id + ")", util.KiwiBaseData.TestPlan[i].id);
    }

    //Store the data for the currently selected testplan to be reported
    reportData["testplan"] = util.KiwiBaseData.TestPlan.filter(function(testplan) {
        return testplan.id == planSelector.value;
    })[0];

    //Add on change listener for testplan to a) filter the available testruns to this testplan b) refresh the report data and redraw all created charts
    planSelector.addEventListener("change", function(e) {
        PopulateTestRunSelector();
        reportData["testplan"] = util.KiwiBaseData.TestPlan.filter(function(testplan) {
            return testplan.id == planSelector.value;
        })[0];
        GetTestExecutionsForTestRun();
        GetErrorsForTestRun();
        PopulatePlanRunInformation();
        RedrawDashboard();
    });

    //Add on change listener for testrun to refresh the report data and redraw all created charts
    runSelector.addEventListener("change", function(e) {
        GetTestExecutionsForTestRun();
        GetErrorsForTestRun();
        PopulatePlanRunInformation();
        RedrawDashboard();
    });

    //Initially populate the avaliable test runs for selected testplan and get report data
    PopulateTestRunSelector();
    GetTestExecutionsForTestRun();
    GetErrorsForTestRun();
}

/**
 * Populate and refresh the testrun selector dropdown
 * Triggered when testplan is changed and on startup
 */
function PopulateTestRunSelector() {
    var plan_id = planSelector.value;

    //Filter all the available testruns for the selected testplan
    let availableTestRuns = util.KiwiBaseData.TestRun.filter(function (run) {
        return run.plan == plan_id;
    });

    //Remove all currently offered select options
    var i, L = runSelector.options.length - 1;
    for(i = L; i >= 0; i--) {
        runSelector.remove(i);
    }

    if(availableTestRuns.length == 0) {
        //Translate Language
        runSelector.options[runSelector.options.length] = new Option("No test run available", "-1");
    }

    //Add the available testruns for the selected testplan to the dropdown
    for(let i = 0; i<availableTestRuns.length; i++) {
        runSelector.options[runSelector.options.length] = new Option(availableTestRuns[i].summary + " (" + availableTestRuns[i].id + ")", availableTestRuns[i].id);
    }

    //Store the data for the currently selected testrun to be reported
    reportData["testrun"] = util.KiwiBaseData.TestRun.filter(function(testrun) {
        return testrun.id == runSelector.value;
    })[0];
}

/**
 * Populates the displayed information for the selected test plan and test run
 * Triggered when test plan and / or test run is updated and on startup
 */
function PopulatePlanRunInformation() {

    var author = util.KiwiBaseData.User.filter(function(user) {
        return user.id == reportData.testplan.author;
    })[0];

    var manager = util.KiwiBaseData.User.filter(function(user) {
        return user.id == reportData.testrun.manager;
    })[0];

    var default_tester = util.KiwiBaseData.User.filter(function(user) {
        return user.id == reportData.testrun.default_tester;
    })[0];

    testplan_text_container.value = (reportData.testplan.text === null) ? "No text available" : reportData.testplan.text;   
    testplan_plantype_container.value = reportData.testplan.type__name
    testplan_author_container.value = author.first_name + " " + author.last_name;
    testplan_created_at_container.value = reportData.testplan.create_date;
    testplan_product_container.value = reportData.testplan.product__name;
    testplan_product_version_container.value = reportData.testplan.product_version__value; 
    testrun_summary_container.value = (reportData.testrun.summary === null) ? "No summary available" : reportData.testrun.summary;
    testrun_manager_container.value = manager.first_name + " " + manager.last_name;
    testrun_default_tester_container.value = default_tester.first_name + " " + default_tester.last_name;
    testrun_notes_container.value = (reportData.testrun.notes === null) ? "No notes available" : reportData.testrun.notes;
    testrun_planned_start_container.value = reportData.testrun.planned_start; 
    testrun_planned_stop_container.value = reportData.testrun.planned_stop;
    testrun_started_at_container.value = (reportData.testrun.start_date === null) ? "Run not started yet" : reportData.testrun.start_date;
    testrun_stopped_at_container.value = (reportData.testrun.stop_date === null) ? "Run not stopped yet" : reportData.testrun.stop_date;
    
    var estimates = CalculateEstimates();
    testrun_total_estimation_container.value = estimates.total; 
    testrun_booked_times_container.value = estimates.booked;
    testrun_remaining_estimate_container.value = estimates.remaining;

}

/**
 * Creates and / or populates a new dropdown field for the data field selection 
 * @param {select} selector the given dropdown
 * @param {string} statusType specifies the status for filtering field selectors (test|error)
 * @returns the created select element
 */
function CreateAndPopulateFieldSelector(selector, statusType) {

    var i, L = selector.options.length - 1;
        for(i = L; i >= 0; i--) {
            selector.remove(i);
    }

    if(!selector) var selector = document.createElement("select");

    for(let i = 0; i<fieldTypes[statusType].length; i++) {
        selector.options[selector.options.length] = new Option(fieldTypes[statusType][i].label, fieldTypes[statusType][i].id);
    }

    if(selector.id == "drp-add-diagramm-groupfield") {
        selector.options[selector.options.length] = new Option("No Group", "nogroup");
        selector.value = "nogroup";
    }

    return selector;
}

/**
 * Creates and / or populates a new dropdown field for the status type selection 
 * @param {select} selector an optional given dropdown
 * @returns the created select element
 */
function CreateAndPopulateStatusSelector(selector=null) {

    if(!selector) var selector = document.createElement("select");

    for(let i = 0; i<statusTypes.length; i++) {
        selector.options[selector.options.length] = new Option(statusTypes[i].label, statusTypes[i].id);
    }

    return selector;
}

/**
 * Creates and / or populates a new dropdown field for the diagram type selection 
 * @param {select} selector an optional given dropdown (from add new diagramm control)
 * @returns the created select element
 */
function CreateAndPopulateDiagrammSelector(selector=null) {

    if(!selector) var selector = document.createElement("select");

    for(let i = 0; i<diagrammTypes.length; i++) {
        selector.options[selector.options.length] = new Option(diagrammTypes[i].label, diagrammTypes[i].id);
    }

    return selector;
}

/**
 * Fetch or update all test execution data to be reported
 * Triggered when testplan and / or testrun is changed and on startup
 * Data is stored in global reportdata
 */
function GetTestExecutionsForTestRun() {

    //If a valid testrun is selected get all test executions for this testrun
    if(runSelector.value != "-1") {
        var TestExecutions = util.KiwiBaseData.TestExecution.filter(function (te) {
            return te.run == runSelector.value;
        });
    
        var ResultSet = [];

        //For all test executions of the selected testrun get all additional information of underlying testcases
        for(let i = 0; i < TestExecutions.length; i++) {

            var tc_temp = util.KiwiBaseData.TestCase.find(obj => obj.id === parseInt(TestExecutions[i].case));
            var tc = JSON.parse(JSON.stringify(tc_temp));
            tc["actual_duration"] = TestExecutions[i].actual_duration;
            tc["assignee"] = TestExecutions[i].assignee;
            tc["assignee__username"] = TestExecutions[i].assignee__username;
            tc["build"] = TestExecutions[i].build;
            tc["build__name"] = TestExecutions[i].build__name;
            tc["actual_duration"] = TestExecutions[i].actual_duration;
            tc["start_date"] = TestExecutions[i].start_date;
            tc["status"] = TestExecutions[i].status;
            tc["status__name"] = TestExecutions[i].status__name;
            tc["stop_date"] = TestExecutions[i].stop_date;
            tc["tested_by"] = TestExecutions[i].tested_by;
            tc["tested_by__username"] = TestExecutions[i].tested_by__username;
            tc["comments"] = TestExecutions[i].comments;

            ResultSet.push(tc);
        }

        reportData["testexecutions"] = ResultSet;
    }
}

/**
 * Fetch or update all bug data to be reported
 * Triggered when testplan and / or testrun is changed and on startup
 * Data is stored in global reportdata
 */
function GetErrorsForTestRun() {

    //If a valid testrun is selected get all test executions for this testrun
    if(runSelector.value != "-1") {
        var TestExecutions = util.KiwiBaseData.TestExecution.filter(function (te) {
            return te.run == runSelector.value;
        });
    
        var ResultSet = [];

        //For all bugs in Kiwi TCMS get the triggering test execution and all additional information of underlying testcases
        for(let i = 0; i < util.KiwiBaseData.Bug.length; i++) 
        {
            var bug = util.KiwiBaseData.Bug[i];
            var te_temp = TestExecutions.find(obj => obj.id == bug.executions);
            if(te_temp != null) {
                var tc_temp = util.KiwiBaseData.TestCase.find(obj => obj.id == te_temp.case);
                bug["tester"] = te_temp["tested_by__username"]
                bug["priority"] = tc_temp["priority__value"];
                bug["category"] = tc_temp["category"];
                bug["category__name"] = tc_temp["category__name"];
                bug["testcase_text"] = tc_temp["text"];
                bug["comments"] = te_temp["comments"];
                bug["priority__value"] = tc_temp["priority__value"];

                if(bug["severity__name"] == null) {
                    bug["severity__name"] = "To be classified";
                }

                if(bug["status"] == true) {
                    bug["status"] = "Unsolved";
                }
                else {
                    bug["status"] = "Solved";
                }

                ResultSet.push(bug);
            }
        } 

        reportData["bugs"] = ResultSet;
    }
}

/**
 * Aggregating simple kpi, for example count all test executions statuses
 * @param {string} statusType type of data to be reported (test|error)
 * @param {string} field field to be analyzed e. g. "assignee__username"
 * @returns Object containing count for desired field
 */
function GetMetricsFromData(statusType, field) {

    var result = {};

    //Get data source depending on statustype
    var source;
    if(statusType == "test") {
        source = reportData["testexecutions"];
    }
    else {
        source = reportData["bugs"];
    }

    //Count occurences of selected field in data source
    if(source.length > 0) {          
        for(var i = 0; i < source.length; i++) {
            if(result[source[i][field]] == null) {
                result[source[i][field]] = 1;
            }
            else {
                result[source[i][field]]++;
            }
        }
    }

    return result;
}

/**
 * Aggregating and grouping kpi by two selected fields, for example count all test objects by status
 * @param {string} fieldA group field
 * @param {string} fieldB field to be grouped
 * @returns resulting array containing the grouped data
 */
function GetGroupedMetricsFromData(statusType, fieldA, fieldB) {

    var result = {};

    //Get data source depending on statustype
    var source;
    if(statusType == "test") {
        source = reportData["testexecutions"];
    }
    else {
        source = reportData["bugs"];
    }

    if(source.length > 0) {

        //Initially: Get all testobjects
        for (var i = 0; i < source.length; i++) {

            if(result[source[i][fieldA]] == null) {
                result[source[i][fieldA]] = {};
            }
        }

        for(let field in result) {
            for (var i = 0; i < source.length; i++) {

                if(source[i][fieldA] == field) { 

                    if(result[field][source[i][fieldB]] == null) {
                        result[field][source[i][fieldB]] = 1;
                    }
                    else {
                        result[field][source[i][fieldB]]++;
                    }
                }
    
            }
        }      
    }

    return result;
}

/**
 * Function to parse grouped metrics for processing and drawing a groped chart tyoe
 * @param {json} the previously aggregated kpis to be displayed 
 * @returns a datasets object with labels and datasets as shown in chart.js (https://www.chartjs.org/docs/latest/samples/bar/stacked.html)
 */
function ParseStackedChartData(json) {

    var datasets = [];
    var labels = Object.keys(json);
    var data_labels = [];

    for(var i = 0; i < labels.length; i++) {
        var data = Object.keys(json[labels[i]]);
        for(var j = 0; j < data.length; j ++) {

            if(!data_labels.includes(data[j])) {
                data_labels.push(data[j]);
            }
        }
    }

    for(var i = 0; i < data_labels.length; i ++) {
        var data = [];
        for(var j = 0; j < labels.length; j ++) {    
            {
                if(json[labels[j]][data_labels[i]] == null)
                    data.push(0);
                else {                 
                    data.push(json[labels[j]][data_labels[i]])
                }
            }
        }
        var dataset = {
            "label": data_labels[i],
            "data": data,
        }

        datasets.push(dataset);
    }

    var stacked_data = {
        "labels": labels,
        "datasets": datasets 
    }
    return stacked_data;

} 

/**
 * Dynamicaly create the chart container with buttons to adjust the chart type and remove the chart
 * Stores the chart in the global charts container with the generated uuid 
 * @param {string} statusType specifies the type of status to be displayed (test|error)
 * @param {string} chartType specifies the chart.js chart type to be used (bar|line|pie)
 * @param {string} field specifies the data field to be analyzed
 * @param {string} groupField specifies an additional field type for aggregation
 */
function CreateChartContainer(statusType, chartType, field, groupField) {
    
    //Create unique chart id as there can be multiple charts at the same time
    var chart_id = uuidv4();

    //create the chart dom container div with chart id
    var chartContainer = document.createElement("div");
    chartContainer.setAttribute("class", "col-sm-3");
    chartContainer.setAttribute("id", chart_id);

    var label_container = document.createElement("div");
    var label = document.createElement("h4");
    var title;
    if(groupField == "nogroup") {
        title = "Count " + statusTypes.find(obj => obj.id === statusType).label + " by " 
            + fieldTypes[statusType].find(obj => obj.id === field).label;
    }
    else {
        title = "Count " + statusTypes.find(obj => obj.id === statusType).label + " by " 
            + fieldTypes[statusType].find(obj => obj.id === field).label + " and " 
            + fieldTypes[statusType].find(obj => obj.id === groupField).label;
    }

    label.innerHTML = title;
    label_container.appendChild(label);
    chartContainer.appendChild(label_container);

    //create and set the chart type selector
    var chart_typeselector = CreateAndPopulateDiagrammSelector();
    chart_typeselector.setAttribute("class", "steil-plugin-reporter-viz-button");
    chart_typeselector.value = chartType;
    chart_typeselector.chart_id = chart_id;
    chartContainer.appendChild(chart_typeselector);

    //create the discard chart button which on click removes it from the canvas and the global charts container
    var btn_deleteChart = document.createElement("button");
    //Translate Language
    btn_deleteChart.innerHTML = "Remove";
    btn_deleteChart.value = chart_id;
    btn_deleteChart.setAttribute("class", "btn btn-warning steil-plugin-reporter-viz-button");
    btn_deleteChart.addEventListener("click", function(e) {
        document.getElementById(e.target.value).remove();
        delete charts[e.target.value];
        PostDashboardChangeEvent();
    })
    chartContainer.appendChild(btn_deleteChart);

    var btn_downloadChart = document.createElement("button");
    //Translate Language
    btn_downloadChart.innerHTML = "Export";
    btn_downloadChart.value = chart_id;
    btn_downloadChart.setAttribute("class", "btn btn-primary steil-plugin-reporter-viz-button");
    btn_downloadChart.addEventListener("click", function(e) {

        var a = document.createElement('a');
        a.href = charts[e.target.value].chart.toBase64Image();
        a.download = charts[chart_id].title + '.png';
        a.click();

    })
    chartContainer.appendChild(btn_downloadChart);

    //Initially get the data to be displayed in the chart and draw chart
    var chart, chartData;

    //Distinguish between simple chart or stacked charts
    if(groupField == "nogroup") {
        chartData = GetMetricsFromData(statusType, field);
        chart = DrawChart(chartContainer, chartType, Object.keys(chartData), Object.values(chartData), false);
    }
    else {
        chartData = ParseStackedChartData(GetGroupedMetricsFromData(statusType, field, groupField));
        chart = DrawChart(chartContainer, chartType, chartData.labels, chartData.datasets, true);
    }

    //Add event listeners for the created dropdowns to update the chart on runtime
    chart_typeselector.addEventListener("change", function(e) {
        UpdateChart(e.target.chart_id);
    });

    //Add the created charts to the global chart container and add it to the canvas
    charts[chart_id] = {"chart": chart, "statusType": statusType, "field": field, "typeSelector": chart_typeselector, "title": label.innerHTML};

    domBody.appendChild(chartContainer);
    PostDashboardChangeEvent();
}

/**
 * Dynamicaly create the table container with buttons to remove the table
 * Stores the table in the global datatables container with the generated uuid 
 * @param {string} statusType specifies the type of status to be displayed (test|error)
 * @param {string} field specifies the data field to be analyzed
 * @param {string} groupField specifies an additional field type for aggregation
 */
function CreateTableContainer(statusType, field, groupField) {
    
    //Create unique table id as there can be multiple table at the same time
    var table_container_id = uuidv4();
    var title;
    if(groupField == "nogroup") {
        title = "Count " + statusTypes.find(obj => obj.id === statusType).label + " by " 
            + fieldTypes[statusType].find(obj => obj.id === field).label;
    }
    else {
        title = "Count " + statusTypes.find(obj => obj.id === statusType).label + " by " 
            + fieldTypes[statusType].find(obj => obj.id === field).label + " and " 
            + fieldTypes[statusType].find(obj => obj.id === groupField).label;
    }

    //create the table dom container div with table id
    var tableContainer = document.createElement("div");
    tableContainer.setAttribute("class", "col-sm-3");
    tableContainer.setAttribute("id", table_container_id);

    var label_container = document.createElement("div");
    var label = document.createElement("h4");
    label.innerHTML = title;
    label_container.appendChild(label);
    tableContainer.appendChild(label_container);

    //create the remove table button which on click removes it from the canvas and the global datatables container
    var btn_deleteTable = document.createElement("button");
    //Translate Language
    btn_deleteTable.innerHTML = "Remove";
    btn_deleteTable.value = table_container_id;
    btn_deleteTable.setAttribute("class", "btn btn-warning steil-plugin-reporter-viz-button");
    btn_deleteTable.addEventListener("click", function(e) {
        document.getElementById(e.target.value).remove();

        var table = $('#'+datatables[e.target.value].datatable_id).DataTable();
        table.destroy();
        table = null;

        delete datatables[datatables[e.target.value].datatable_id];
        delete datatables[e.target.value];
        PostDashboardChangeEvent();
    })
    tableContainer.appendChild(btn_deleteTable);

    var btn_downloadTable = document.createElement("button");
    //Translate Language
    btn_downloadTable.innerHTML = "Export";
    btn_downloadTable.setAttribute("class", "btn btn-primary steil-plugin-reporter-viz-button");
    btn_downloadTable.addEventListener("click", function(e) {

        util.ExportDataTableToCSV(e.target.value);

    })
    tableContainer.appendChild(btn_downloadTable);

    //Create unique datatable container
    var datatable_id = uuidv4();
    btn_downloadTable.value = datatable_id;
    var table_wrapper = document.createElement("div");
    table_wrapper.setAttribute("id", datatable_id + "_wrapper");
    var table = document.createElement("table");
    table.setAttribute("id", datatable_id);
    table_wrapper.append(table);
    tableContainer.appendChild(table_wrapper);
    var body_data = [];

    //Initially get the data to be displayed in the table and draw table
    if(groupField == "nogroup") {
        var tableData = GetMetricsFromData(statusType, field);
        var headers = [fieldTypes[statusType].find(obj => obj.id === field).label, "Count " + fieldTypes[statusType].find(obj => obj.id === field).label];
        for(var i in tableData)
            body_data.push([i, tableData [i]]);
    }
    else {
        var tableData = JsonToBodyData(GetGroupedMetricsFromData(statusType, field, groupField));
        var headers = [fieldTypes[statusType].find(obj => obj.id === field).label, fieldTypes[statusType].find(obj => obj.id === groupField).label, "Count " + statusTypeSelector.options[statusTypeSelector.selectedIndex].text];
        body_data = tableData;
    }

    domBody.appendChild(tableContainer);
    var table = util.CreateDataTable(datatables, datatable_id, headers, body_data, true);

    //Add the created table to the global table container and add it to the canvas
    datatables[table_container_id] = {"datatable": table, "datatable_id": datatable_id, "title": title};
    PostDashboardChangeEvent();
}

/**
 * Updates a given chart by its id
 * Triggered when refreshing the whole dashboard and / or an individual chart dropdown is changed
 * @param {string} chart_id the specific chart id
 */
function UpdateChart(chart_id) {

    //get chart and configuration from global chart container
    var chartContainer = charts[chart_id];
    var chart = chartContainer.chart;
    
    //get new chart data after change
    var chartData = GetMetricsFromData(chartContainer.statusType, chartContainer.field);

    //refresh chart with updated or current chart data and configuration
    chartContainer.chart.config._config.type = chartContainer.typeSelector.value;
    chart.data.labels = Object.keys(chartData);
    chart.data.datasets[0].data = Object.values(chartData);

    chart.update();
}

/**
 * Update all currently drawn charts
 * Triggered when testplan and / or testrun is changed
 */
function RedrawDashboard() {

    for(let chart_id in charts) {
        UpdateChart(chart_id);
    }
}

/**
 * Dynamicaly draws a chart for given charttype and data using the chart.js framework
 * @param {string} container specifies the parant container to append the chart to
 * @param {string} type specifies the visualisation type (bar|pie|line)
 * @param {string[]} labels specifies the text tabels for the displayed data
 * @param {int[]} data specifies displayed data
 * @param {boolean} grouped specifies if the chart shall be grouped or not
 * @returns the chart.js chart object
 */
function DrawChart(container, type, labels, data, grouped) {
    
    var canvas = container.appendChild(document.createElement("canvas"));

    //Generate random color scheme to distinguish chart data
    var backgroundColors = [];
    var borderColors = [];
    for(let i = 0; i < data.length; i++) {
        var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255);
        backgroundColors.push(color + ",0.4)");
        borderColors.push(color);
    }

    var datasets = [{
        label: ["Count"],
        data: data,
        borderWidth: 1,
        backgroundColor: backgroundColors,
        borderColor: borderColors
    }];

    var displayLegend = grouped;
    if(type=="pie") displayLegend = true;

    if(grouped) {
        datasets = data;
    }

    var chart = new Chart(canvas, {
        type: type,
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: grouped
                },
                x: {
                    stacked: grouped
                }
            },
            plugins: {
                legend: {
                    display: displayLegend
                }
            }
        }
    });

    return chart;
}

/**
 * Creates a unique identifier for the created charts
 * Source: //https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
 * @returns a unique uuidv4
 */
function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

/**
 * Prepares the filtered Testcases and Executions or Errors with comments for exporting to CSV
 * @param {string} statusType specifies the statusType to be exported (test|error)
 * @returns string of formated exportdata
 */
function PrepareDataExport(statusType) {

    const csvRows = [];

    //Get data source depending on statustype
    var source;
    if(statusType == "test") {
        source = reportData["testexecutions"];
    }
    else {
        source = reportData["bugs"];
    }

    const headers = Object.keys(source[0]);
    csvRows.push(headers.join(';'));

    for (const row of source) {
        const values = headers.map(header => {
            const val = row[header]
            return `"${val}"`;
        });
 
        var comments = '"';
        for(var i = 0; i < row.comments.length; i++) {
            comments = comments + "[" + i + "]" + row.comments[i].user_name + " (" + row.comments[i].submit_date + ")" + ": " + row.comments[i].comment + "\n"; 
        }

        values[headers.indexOf("comments")] = comments + '"'; 
        csvRows.push(values.join(';'));
    }
    return csvRows.join('\n');
}

/**
 * Help-Function to parse json data into exportable table format 
 * @param {json} json the json data to be exported
 * @returns the json in a table format
 */
function JsonToBodyData(json) {

    var result = [];

    for(var key in json) {
        for (var key2 in json[key]) {
            result.push([key, key2, json[key][key2]]);
        }
    }

    return result;
}

/**
 * Caluclates the total, booked and remaining time estimates for the given testrun 
 * @returns a json object with total, booked and remaining times 
 */
function CalculateEstimates() {
    var estimates = {
        total: "00:00",
        booked: "00:00",
        remaining: "00:00",
    };

    //Configure these statuses at will, considering prefered test execution status for including and excluding estimates
    var completeExecutionStatus = ["PASSED", "WAIVED", "BLOCKED", "ERROR", "FAILED"];

    for(var i = 0;i < reportData["testexecutions"].length; i++) {

        var tc = reportData["testexecutions"][i];

        if(tc.expected_duration == null) {
            tc.expected_duration = "P4DT00H00M00S";
        }
        estimates.total = AddTimeStamps(estimates.total, tc.expected_duration);

        // Actual durations are not working correctly in Kiwi TCMS therefore the status shall be used for estimation
        // if(tc.actual_duration != null) {
        //     estimates.booked = AddTimeStamps(booked.total, tc.actual_duration);
        // }  

        if(completeExecutionStatus.includes(tc.status__name)) {
            estimates.booked = AddTimeStamps(estimates.booked, tc.expected_duration);
        }
        
    }

    estimates.remaining = SubtractTimeStamps(estimates.total, estimates.booked);

    return estimates;
}

/**
 * Help function to add two time stamps of string type (HH:MM)
 * @param {string} time1 initial time
 * @param {string} time2 time to be added
 * @returns the resulting time in HH:MM format
 */
function AddTimeStamps(time1, time2) {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = [parseInt(GetNumbersInBetween(time2,"T","H")), parseInt(GetNumbersInBetween(time2,"H","M"))];

    let minutes = minutes1 + minutes2;
    let additionalHours = Math.floor(minutes / 60);

    minutes = minutes % 60;

    let hours = hours1 + hours2 + additionalHours;

    const formatHours = hours.toString().padStart(2, '0');
    const formatMinutes = minutes.toString().padStart(2, '0');

    return `${formatHours}:${formatMinutes}`;
}

/**
 * Help function to subtract two time stamps of string type (HH:MM)
 * @param {string} time1 initial time
 * @param {string} time2 time to be subtracted
 * @returns the resulting time in HH:MM format
 */
function SubtractTimeStamps(time1, time2) {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);

    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;

    const differenceInMinutes = totalMinutes1 - totalMinutes2;

    const resultHours = Math.floor(differenceInMinutes / 60);
    const resultMinutes = differenceInMinutes % 60;

    const formattedResult = `${resultHours.toString().padStart(2, '0')}:${resultMinutes.toString().padStart(2, '0')}`;
    
    return formattedResult;
}

/**
 * Help Function to parse the time interval of the standard Kiwi TCMS time format
 * @param {string} text specifies the source text to be extracted
 * @param {string} startChar specifies the start delimiter of the text to be extracted
 * @param {string} endChar specifies the end delimiter of the text to be extracted
 * @returns the extracted characters as integers
 */
function GetNumbersInBetween(text, startChar, endChar) {
    const startIndex = text.indexOf(startChar);
    const endIndex = text.indexOf(endChar, startIndex + 1);

    // Check if both characters are present in the text
    if (startIndex === -1 || endIndex === -1) {
        console.error("Start or end character not found.");
        return null;
    }

    // Extract the part of the text between the two characters
    const extractedCharacters = text.substring(startIndex + 1, endIndex);
    return extractedCharacters;
}

/**
 * Function to reset the interface and empty out all created charts and tables
 */
function ResetInterface() {
    for (var chart in charts) {
        document.getElementById(chart).remove();
        delete charts[chart];
    }

    for (var datatable in datatables) {
        document.getElementById(e.target.value).remove();
        delete charts[e.target.value];
    }

    PostDashboardChangeEvent();
}

/**
 * This is used to display a message when no containers have been added to the canvas
 * Triggered when adding / discarding charts and / or datatables
 */
function PostDashboardChangeEvent() {
    if(Object.keys(charts).length > 0 || Object.keys(datatables).length > 0) {
        $('#reporter-no-content-placeholder')[0].style.visibility = "hidden";
        $('#reporter-no-content-placeholder')[0].style.position = "absolute";
    }
    else {
        $('#reporter-no-content-placeholder')[0].style.visibility = "visible";
        $('#reporter-no-content-placeholder')[0].style.position = "initial";
    }
}

/**
 * Creates a pdf export of the canvas dom element
 * This is not working correctly yet, possible motivation for open source community
 */
function CreatePDFExport() {

    window.jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    var elementHTML = document.getElementById("steil-plugin-reporter").innerHTML;

    doc.html(elementHTML, {
        callback: function(doc) {
            // Save the PDF
            doc.save('sample-document.pdf');
        },
        x: 15,
        y: 15,
        width: 1280, //target width in the PDF document
        windowWidth: 1280 //window width in CSS pixels
    });

}

//Reporter manual text to be displayed upon opening manual
const reporter_manual = `<table>
<tr style="margin-bottom: 10px">
  <th style="width: 50px"><p>Step</p></th>
  <th style="width: 850px"><p>Description</p></th>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>1</b></td>
  <td style="text-align:left"><p>In the tool bar section select the desired test plan and test run to report.</p></td>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>2</b></td>
  <td style="text-align:left">In the tool bar section select a chart and report type for the desired visualization type.</p></td>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>3</b></td>
  <td style="text-align:left"><p>In the tool bar section select a test case or test execution field to be reported.<br /><p style="color:red">Note: You can specify an optional group by field. Leave it "No Group" if you do not want to group the results.</p></p></td>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>4</b></td>
  <td style="text-align:left"><p>Add a title for the chart or table to be created.</p></td>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>5</b></td>
  <td style="text-align:left"><p>Press one of the buttons <b>Add as chart</b> or <b>Add as table</b> to add the visualization to the canvas.</p></td>
</tr>
<tr style="margin-bottom: 10px">
  <td style="vertical-align: top"><b>6</b></td>
  <td style="text-align:left"><p>Modify the created vizualizations by desire.</p></td>
</tr>
</table>`;