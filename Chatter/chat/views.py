from django.shortcuts import render,redirect, get_object_or_404
from .forms import RegisterForm , LoginForm
from django.contrib.auth import authenticate, login ,logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import Q,F
from .models import CustomUser, Message
# Create your views here.
@login_required()
def chat(request):
    my_friends = request.user.friends.all()
    not_my_friend = request.user.friend_set.all()
    all_friends = my_friends.union(not_my_friend)
    chats = friend = None
    receiver_id = request.GET.get('id')
    if receiver_id:

        try:
            friend = get_object_or_404(CustomUser,id=receiver_id)
            chats =  Message.objects.filter(Q(sender=request.user,receiver=friend)|Q(sender=friend,receiver=request.user))
            if friend not in my_friends and request.user not in friend.friends.all():
                messages.error(request,'Please add the user before trying to message')
                return redirect('chat')

        except Exception as e:
            if str(e) == 'No CustomUser matches the given query.':
                messages.error(request,'User doesn\'t exist')
            elif "Field 'id' expected a number" in str(e):
                messages.error(request,"Invalid Id")
            else:messages.error(request,str(e))

    if request.method == "POST":
        type = request.POST.get('post_type')
        if type == 'add_friend':
            username = request.POST.get('username')
            try:
                user = get_object_or_404(CustomUser,username=username)

                if user in request.user.friends.all():
                    messages.error(request,'Already friends or Request already sent!')
                else:
                    request.user.friends.add(user)
                    messages.success(request,'Request sent successfully')

            except Exception as e:

                if str(e) == 'No CustomUser matches the given query.':
                    messages.error(request,'User doesn\'t exist')
                else:messages.error(request,str(e))

        elif type == 'delete_friend':
            username = request.POST.get('username')
            try:
                message = ''
                user = get_object_or_404(CustomUser,username = username)

                if user not in my_friends and request.user not in user.friends.all():
                    raise ValueError('No CustomUser matches the given query.')
                if user in my_friends:
                    print('yes user is my friend')
                    request.user.friends.remove(user)
                    message = 'User removed from your friend list.'
                if request.user in user.friends.all():
                    print('yes you are user\'s friend')
                    user.friends.remove(request.user)
                    message += 'You have been removed from the users friend list'
                if message:
                    Message.objects.filter(Q(sender=request.user, receiver=user) | Q(sender=user, receiver=request.user)).delete()
                    messages.success(request,message)

            except Exception as e:
                if str(e) == 'No CustomUser matches the given query.':
                    messages.error(request,'User doesn\'t exist')
                else:messages.error(request,str(e))


        elif type == 'add_message':
            message = request.POST.get('message')
            sender = request.user
            if friend not in my_friends:
                sender.friends.add(friend)
            Message.objects.create(message=message,sender=sender,receiver=friend)
            return render(request,'chat.html',{
                'friends':all_friends,
                'my_friend_only':my_friends,
                'chats':chats,
                'friend':friend,
            })
        
        return redirect('chat')

    return render(request,'chat.html',{
        'friends':all_friends,
        'my_friend_only':my_friends,
        'chats':chats,
        'friend':friend,
        })

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