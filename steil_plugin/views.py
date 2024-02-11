from typing import Any
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from tcms.rpc.api import category
from tcms.rpc.api import classification
from tcms.rpc.api import component
from tcms.rpc.api import environment
from tcms.rpc.api import plantype
from tcms.rpc.api import product
from tcms.rpc.api import testcase
from tcms.rpc.api import testplan
from tcms.rpc.api import testrun
from tcms.rpc.api import version
from tcms.rpc.api import build
from tcms.rpc.api import priority
from tcms.rpc.api import testcasestatus
from tcms.rpc.api import testexecutionstatus
from tcms.rpc.api import testexecution
from tcms.rpc.api import user
import tcms.bugs.api 

@method_decorator(login_required, name="dispatch")
class Importer(TemplateView):
    template_name = "steil_plugin/importer.html"

    def get(self, request, *args, **kwargs):

        #Check if user is admin, otherwise return to start page
        if(request.user.is_staff):
            entities = GetAllBaseData()
            return render(request, self.template_name, {'basedata': entities})
            
        return HttpResponseRedirect("/")

@method_decorator(login_required, name="dispatch")
class Quickstarter(TemplateView):
    template_name = "steil_plugin/quickstarter.html"

    def get(self, request, *args, **kwargs):

        #Check if user is admin, otherwise return to start page
        if(request.user.is_staff):
            entities = GetAllBaseData()
            return render(request, self.template_name, {'basedata': entities})
        
        return HttpResponseRedirect("/")

@method_decorator(login_required, name="dispatch")
class Reporter(TemplateView): 
    template_name = "steil_plugin/reporter.html"

    def get_context_data(self, **kwargs: Any):

        entities = GetAllBaseData()

        return {
            "basedata" : entities
        }

@method_decorator(login_required, name="dispatch")
class Menu(TemplateView): 
    template_name = "steil_plugin/menu.html"

#Gets all neccessary kiwi tcms data for clientside validation und interaction
def GetAllBaseData():
    entities = {}

    r_bug = tcms.bugs.api.filter({})
    r_category = category.filter({})  
    r_classification = classification.filter({})
    r_component = component.filter({})
    r_environment = environment.filter({})
    r_plantype = plantype.filter({})
    r_product = product.filter({})
    r_testcase = testcase.filter({}) 
    r_testplan = testplan.filter({}) 
    r_testrun = testrun.filter({}) 
    r_version = version.filter({}) 
    r_build = build.filter({}) 
    r_priority = priority.filter({}) 
    r_testcasestatus = testcasestatus.filter({}) 
    r_testexecutionstatus = testexecutionstatus.filter({}) 
    r_testexecution = testexecution.filter({}) 
    r_user = user.filter({'is_active': True})

    for te in r_testexecution:
        te['comments'] = testexecution.get_comments(te['id'])
        
    entities["Bug"] = r_bug
    entities["Category"] = r_category
    entities["Classification"] = r_classification
    entities["Component"] = r_component
    entities["Environment"] = r_environment
    entities["PlanType"] = r_plantype
    entities["Product"] = r_product
    entities["TestCase"] = r_testcase
    entities["TestPlan"] = r_testplan
    entities["TestRun"] = r_testrun
    entities["Version"] = r_version
    entities["Build"] = r_build
    entities["Priority"] = r_priority
    entities["TestCaseStatus"] = r_testcasestatus
    entities["TestExecutionStatus"] = r_testexecutionstatus
    entities["TestExecution"] = r_testexecution
    entities["User"] = r_user

    return entities
