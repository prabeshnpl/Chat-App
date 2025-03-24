from django.shortcuts import render,redirect, get_object_or_404
from .forms import RegisterForm , LoginForm
from django.contrib.auth import authenticate, login ,logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import Q,F
from .models import CustomUser, Message, FriendShip
import uuid
# Create your views here.
@login_required()
def chat(request):
    my_friends = request.user.friends.all()
    not_my_friend = request.user.friend_set.all()
    all_friends = my_friends.union(not_my_friend)
    room_code = chats = friend =  None
    receiver_id = request.GET.get('id')

    if receiver_id:
        try:
            friend = get_object_or_404(CustomUser,id=receiver_id)
            friendship = get_object_or_404(FriendShip,user=request.user,friend=friend)
            room_code = friendship.room_code
            chats =  Message.objects.filter(Q(sender=request.user,receiver=friend)|Q(sender=friend,receiver=request.user))
            if friend not in my_friends and request.user not in friend.friends.all():
                messages.error(request,'Please add the user before trying to message')
                return redirect('chat')

        except Exception as e:
            if str(e) == 'No CustomUser matches the given query.':
                messages.error(request,'User doesn\'t exist')
                return redirect('chat')
            elif "No FriendShip matches the given query." in str(e):
                pass
            elif "Field 'id' expected a number" in str(e):
                messages.error(request,"Invalid Id")
                return redirect('chat')
            else:
                messages.error(request,str(e))
            
    if request.method == "POST":
        type = request.POST.get('post_type')

        if type == 'add_friend':
            username = request.POST.get('username')
            try:
                user = get_object_or_404(CustomUser,username=username)

                if user in request.user.friends.all():
                    messages.error(request,'Already friends or Request already sent!')
                else:
                    this_room_code = None
                    request.user.friends.add(user)
                    if request.user in user.friends.all():
                        this_friendship = FriendShip.objects.get(user = user , friend = request.user)
                        this_room_code = this_friendship.room_code
                    else:    
                        # uuid4 to create unique id
                        this_room_code = str(uuid.uuid4())
                    if FriendShip.objects.filter(user=request.user,friend=user).exists():
                        this_friend = FriendShip.objects.get(user=request.user,friend=user)
                        this_friend.room_code = this_room_code
                        this_friend.save()
                    else:
                        FriendShip.objects.create(user=request.user,friend=user,room_code = room_code)
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
                
                if FriendShip.objects.filter(user=request.user, friend=user).exists():
                    FriendShip.objects.get(user=request.user, friend=user).delete()
                    message = 'User removed from your friend list.'

                if FriendShip.objects.filter(user=user, friend=request.user).exists():
                    FriendShip.objects.get(user=user, friend=request.user).delete()
                    message += ' You have been removed from the user\'s friend list.'

                if message:
                    Message.objects.filter(Q(sender=request.user, receiver=user) | Q(sender=user, receiver=request.user)).delete()
                    messages.success(request,message)

            except Exception as e:
                if str(e) == 'No CustomUser matches the given query.':
                    messages.error(request,'User doesn\'t exist')
                else:messages.error(request,str(e))

        elif type == 'add_group':
            groupname = request.POST.groupname
            

        return redirect('chat')

    return render(request,'chat.html',{
        'friends':all_friends,
        'my_friend_only':my_friends,
        'chats':chats,
        'friend':friend,
        'room_code':room_code,
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