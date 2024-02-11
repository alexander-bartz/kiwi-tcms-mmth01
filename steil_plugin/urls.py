from os import path
from django.urls import re_path
from tcms.steil_plugin import views

#Parse client-side url call to return corresponding view
urlpatterns = [
    re_path(
        r"^$",
        views.Menu.as_view(),
        name="steil-plugin-menu",
    ),
    re_path(
        r"^importer/",
        views.Importer.as_view(),
        name="steil-plugin-importer",
    ),
    re_path(
        r"^reporter/",
        views.Reporter.as_view(),
        name="steil-plugin-reporter",
    ),
    re_path(
        r"^quickstarter/",
        views.Quickstarter.as_view(),
        name="steil-plugin-quickstarter",
    ),
]
