from django.shortcuts import render,redirect, get_object_or_404
from .forms import RegisterForm , LoginForm
from django.contrib.auth import authenticate, login ,logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import Q,F
from .models import CustomUser, Message, FriendShip, Group, GroupMessage
from django.core.paginator import Paginator
from django.http import JsonResponse , HttpResponseForbidden
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
            chats =  Message.objects.filter(Q(sender=request.user,receiver=friend)|Q(sender=friend,receiver=request.user)).order_by('-timestamp')

            page_number = request.GET.get('page',1)
            paginator = Paginator(chats,20)
            page = paginator.get_page(page_number)

            if friend not in my_friends and request.user not in friend.friends.all():
                messages.error(request,'Please add the user before trying to message')
                return redirect('chat')
            
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                if friend not in my_friends and request.user not in friend.friends.all():
                    return HttpResponseForbidden({'error': 'You are not allowed to chat with this user.'}, status=403)

                message_data = [
                    {
                        'id': message.id,
                        'sender': message.sender.username,
                        'receiver': message.receiver.username,
                        'sender_first_name': message.sender.first_name,
                        'sender_last_name': message.sender.last_name,
                        'receiver_first_name': message.receiver.first_name,
                        'receiver_last_name': message.receiver.last_name,
                        'message': message.message,
                        'timestamp': message.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                    }
                    for message in page
                ]
                return JsonResponse({
                    'messages': message_data,
                    'has_next': page.has_next(),
                })            

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
            username = request.POST.get('username').strip()
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
            username = request.POST.get('username').strip()
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

        elif type == 'create_group' or type == 'join_group':
            messages.error(request,'Please create or join group from "My group" section. Thank you')

        elif type == 'noFriendMessage':
            friend = CustomUser.objects.get(id=request.GET.get('id'))
            friendship = FriendShip.objects.get(user=friend,friend=request.user)
            room_code = friendship.room_code

            request.user.friends.add(friend)
            reverse_friendship = FriendShip.objects.get(user=request.user,friend=friend)
            reverse_friendship.room_code = room_code
            reverse_friendship.save()
            messages.success(request,f"You accepted {friend.first_name} {friend.last_name}'s request.")

            from asgiref.sync import async_to_sync
            from channels.layers import get_channel_layer
            
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'room_{room_code}',
                {
                    'type': 'user_joined',
                    'message': f'{request.user.first_name.upper()} {request.user.last_name.upper()} has accepted {friend.first_name.upper()} {friend.last_name.upper()}\'s request.',
                }
            )

        return redirect('chat')

    return render(request,'chat.html',{
        'friends':all_friends,
        'my_friend_only':my_friends,
        'friend':friend,
        'room_code':room_code,
        'chat_type':'solo_chat',
        })

@login_required
def group_chat(request):
    my_groups = request.user.all_groups.all()
    group_id = request.GET.get('id')
    chats = group_code = group = None    

    if group_id:
        try:
            group = get_object_or_404(Group,id=group_id)
            group_code = group.group_code
            chats =  GroupMessage.objects.filter(group = group).order_by('-timestamp')
            page_number = request.GET.get('page',1)
            paginator = Paginator(chats,20)
            page = paginator.get_page(page_number)
            
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                message_data = [
                {
                    'id': message.id,
                    'sender': message.sender.username,
                    'sender_first_name': message.sender.first_name,
                    'sender_last_name': message.sender.last_name,
                    'message': message.message,
                    'timestamp': message.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                }
                for message in page
                ]
                return JsonResponse({
                    'messages': message_data,
                    'has_next': page.has_next(),
                })
            
        except Exception as e:
            messages.error(request,str(e))
            return redirect('group_chat')       

    if request.method == "POST":
        type = request.POST.get('post_type')

        if type == 'create_group':
            group_name = request.POST.get('groupname').strip()
            group_id = request.POST.get('groupId')
            group_code = str(uuid.uuid4())
            group = Group.objects.create(name=group_name,group_code=group_code,group_id=group_id)
            group.members.add(request.user)
            group.save()
            messages.success(request,'Successfully created')
            return redirect('group_chat')

        elif type == 'join_group':
            try:
                group = get_object_or_404(Group, group_id = request.POST.get('groupId').strip())
                if request.user not in group.members.all():
                    group.members.add(request.user)
                    group.save()
                    messages.success(request,'Successfully joined')
                    # Notify WebSocket consumers about the new user
                    from asgiref.sync import async_to_sync
                    from channels.layers import get_channel_layer
                    
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        f'room_{group.group_code}',
                        {
                            'type': 'user_joined',
                            'message': f'{request.user.first_name.upper()} {request.user.last_name.upper()} has joined the group',
                        }
                    )
                else:
                    messages.error(request,'already in the group')
            except Exception as e:
                if(str(e)) == 'No Group matches the given query.':
                    messages.error(request,'Invalid group name or id.')
                else: 
                    messages.error(request,f"Unexpected error occured : {str(e)}")
            
            return redirect('group_chat')

        elif type == 'add_friend' or type == 'delete_friend':
            messages.error(request,'Please add or delete friend from "My friend" section. Thank you')
            return redirect('group_chat')

            
    
    return render(request,'groupchat.html',{
        'my_groups':my_groups,
        'group':group,
        'room_code':group_code,
        'chat_type':'group_chat',
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