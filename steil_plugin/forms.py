from django import forms

class CSVUploadForm(forms.Form):
    file = forms.FileField(required=True)
    text = forms.CharField(label="Textfeld", required=False)
    number = forms.IntegerField(label="Ganzzahl", required=True)

    def clean(self):
        cleaned_data = super().clean()
        file = cleaned_data.get("file")
        if not file.name.endswith(".csv"):
            raise forms.ValidationError(
                {
                    "file": ("Filetype not supported, the file must be a '.csv'"),
                }
            )
        return cleaned_data