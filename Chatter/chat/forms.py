from django import forms
from .models import CustomUser

class RegisterForm(forms.ModelForm):
    confirm_password = forms.CharField(max_length=64,required=True,widget=forms.PasswordInput(attrs={
        "id":"confirm-password",
        "class":"form-control",
        "placeholder":"Confirm your password",
    }))
    class Meta:
        model = CustomUser
        fields = ['first_name','last_name','username','email','password']
        widgets = {
            'first_name':forms.TextInput(attrs={
                "id":"register-first-name",
                'class':"form-control",
                'placeholder':"First name"
            }),
            'last_name':forms.TextInput(attrs={
                "id":"register-last-name",
                "class":"form-control",
                "placeholder":"Last name",
            }),
            'username':forms.TextInput(attrs={
                "id":"register-username", 
                "class":"form-control",
                "placeholder":"Your username",
            }),
            'email':forms.EmailInput(attrs={
                "id":"register-email",
                "class":"form-control",
                "placeholder":"Your email address"
            }),
            'password':forms.PasswordInput(attrs={
                 "id":"register-password",
                 "class":"form-control",
                 "placeholder":"Create a password", 
            }),
        }

    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        self.fields['username'].required = True
        self.fields['password'].required = True
        self.fields['email'].required = True
        self.fields['first_name'].required = True
        self.fields['last_name'].required = True

    def save(self,commit=True):
        user = super().save(commit=False)
        password = self.cleaned_data.get('password')
        if password :
            user.set_password(password)
        if commit:
            user.save()
        return user


class LoginForm(forms.Form):
    username = forms.CharField(max_length=64, required=True, widget=forms.TextInput(attrs={
        "id":"login-username", 
        "class":"form-control",
        "placeholder":"Your username",
    }))

    password = forms.CharField(max_length=64,required=True,widget=forms.PasswordInput(attrs={
        "id":"login-password", 
        "class":"form-control",
        "placeholder":"Your password",
    }))
