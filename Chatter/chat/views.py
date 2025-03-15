from django.shortcuts import render,redirect, get_object_or_404
from .forms import RegisterForm , LoginForm
from django.contrib.auth import authenticate, login ,logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import CustomUser, Message
# Create your views here.
@login_required()
def chat(request):
    if request.method == "POST":
        type = request.POST.get('add_friend')
        if type == 'add_friend':
            username = request.POST.get('username')
            try:
                user = get_object_or_404(CustomUser,username=username)
                if user in request.user.friends.all():
                    messages.error(request,'Already friends or Request already sent!')
                else:
                    request.user.friends.add(user)
                    messages.success(request,'Request sent successfully')
                return redirect('chat')
            except Exception as e:
                if str(e) == 'No CustomUser matches the given query.':
                    messages.error(request,'User doesn\'t exist')
                    return redirect('chat')
            
    friends = request.user.friends.all()
    
    return render(request,'chat.html',{'friends':friends,})

def authentication(request):
    registerform = RegisterForm
    loginform = LoginForm
    if request.method == 'POST':
        if request.POST.get('form_type') == 'login':
            form = LoginForm(request.POST)
            if form.is_valid():            
                username = form.cleaned_data['username']
                password = form.cleaned_data['password']
                if username and password:
                    user = authenticate(username=username,password=password)
                    if user is not None:
                        messages.success(request,'Logged in successfully')
                        login(request,user)
                        next_url = request.GET.get('next', '/')
                        return redirect(next_url)
                    else:
                        messages.error(request,'Invalid credentials')
                else:
                    messages.error(request,'Username and Password Required')
            else:
                messages.error(request,'Invalid Form')
        
        elif request.POST.get('form_type') == 'register':
            form = RegisterForm(request.POST)
            print(request.POST)
            if form.is_valid():
                password = form.cleaned_data['password']
                confirm_password = form.cleaned_data['confirm_password']
                if password and confirm_password and password == confirm_password:
                    form.save()
                    messages.success(request,'Registration successful')
                    return redirect('login')
                else:
                    messages.error(request,'Password must be same')
            else:
                messages.error(request,form.errors)

             
    return render(request,'login.html',{'registerform':registerform,'loginform':loginform})

def logoutview(request):
    logout(request)
    return redirect('login')