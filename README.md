# Chatter - Real-Time Django Chat App

Chatter is a real-time chat web application built with Django, Django Channels, WebSockets, and Redis. It supports private and group messaging, voice messages, and free peer-to-peer voice calls using WebRTC.
- https://chat-app-vtpp.onrender.com/
  
## Features

- User authentication (login, registration)
- Private (one-to-one) chat
- Group chat
- Real-time messaging with WebSockets
- Voice message recording and playback
- Free peer-to-peer voice calls (WebRTC)
- Responsive UI with Bootstrap Icons
- Media file uploads (voice messages)
- Admin panel for user management

## Tech Stack

- **Backend:** Django, Django Channels, Redis
- **Frontend:** HTML, CSS, JavaScript, Bootstrap Icons
- **Real-Time:** WebSockets (Django Channels)
- **Voice Calls:** WebRTC (no paid third-party services)
- **Deployment:** Gunicorn, WhiteNoise, Render.com (example config included)

## Project Structure

```
Chatter/
├── chat/                # Django app for chat logic
│   ├── static/          # Static files (JS, CSS)
│   ├── templates/       # HTML templates
│   ├── consumers.py     # WebSocket consumers
│   ├── models.py        # Database models
│   ├── views.py         # Django views
│   └── ...
├── Chatter/             # Django project settings
│   ├── settings.py
│   ├── asgi.py
│   └── ...
├── media/               # Uploaded media (voice messages)
├── staticfiles/         # Collected static files for deployment
├── requirements.txt     # Python dependencies
├── render.yaml          # Render.com deployment config
└── manage.py
```

## Getting Started

### Prerequisites

- Python 3.10+
- Redis server (for Channels backend)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/chatter.git
   cd chatter/Chatter
   ```

2. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```

3. **Run Redis server** (make sure Redis is running on default port 6379).

4. **Apply migrations:**
   ```sh
   python manage.py migrate
   ```

5. **Create a superuser (optional):**
   ```sh
   python manage.py createsuperuser
   ```

6. **Collect static files:**
   ```sh
   python manage.py collectstatic
   ```

7. **Run the development server:**
   ```sh
   python manage.py runserver
   ```

8. **Start Django Channels worker** (for production, use Daphne or Uvicorn):
   ```sh
   daphne Chatter.asgi:application
   ```

### Deployment

- See [`render.yaml`](Chatter/render.yaml) for an example Render.com deployment configuration.
- Static files are served using WhiteNoise.

## Usage

- Register or log in.
- Add friends or join/create groups.
- Start chatting in real time.
- Send voice messages using the microphone icon.
- Start a free voice call using the call icon in chat.

## Voice Calls

- Peer-to-peer voice calls use WebRTC and public STUN/TURN servers.
- No paid third-party services required.
- Works in modern browsers with microphone access.


---

**Note:** For TURN server credentials, you may use free public servers or set up your own for production reliability.(I have used Xirsys for testing)
