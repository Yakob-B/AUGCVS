# AUGCVS Android App

Android application for the Ambo University Graduate Credential Verification System.

## 📱 Features

- **Authentication**: Login and Registration with JWT tokens
- **Role-Based Access**: Different dashboards for External Users, Registrars, and Admins
- **Auto-Login**: Persistent authentication using SharedPreferences
- **Material Design**: Modern UI with Material Components

## 🛠️ Tech Stack

- **Language**: Java
- **UI**: XML Layouts with Material Design
- **Networking**: Retrofit 2.9.0
- **JSON Parsing**: GSON
- **Architecture**: MVC Pattern

## 📋 Prerequisites

- Android Studio Arctic Fox or later
- Android SDK 24 (Android 7.0) or higher
- Java 8 or higher

## 🚀 Setup Instructions

### 1. Clone and Open Project

1. Open Android Studio
2. Select "Open an Existing Project"
3. Navigate to the `AUGCVS-Android` folder
4. Click "OK"

### 2. Configure Backend URL

Open `app/src/main/java/com/augcvs/utils/Constants.java` and update the `BASE_URL`:

```java
// For production
public static final String BASE_URL = "https://your-backend-url.com/api/";

// For local testing with emulator
public static final String BASE_URL = "http://10.0.2.2:5000/api/";

// For local testing with physical device
public static final String BASE_URL = "http://YOUR_COMPUTER_IP:5000/api/";
```

### 3. Sync Gradle

Android Studio should automatically sync Gradle files. If not:
- Click "File" → "Sync Project with Gradle Files"

### 4. Run the App

1. Connect an Android device or start an emulator
2. Click the "Run" button (green play icon)
3. Select your device
4. Wait for the app to install and launch

## 📁 Project Structure

```
app/src/main/java/com/augcvs/
├── activities/          # All activity classes
│   ├── SplashActivity.java
│   ├── LoginActivity.java
│   ├── RegisterActivity.java
│   ├── ExternalDashboardActivity.java
│   ├── RegistrarDashboardActivity.java
│   └── AdminDashboardActivity.java
├── api/                 # Retrofit API interfaces
│   ├── ApiClient.java
│   └── AuthService.java
├── models/              # Data models
│   ├── User.java
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   └── AuthResponse.java
└── utils/               # Utility classes
    ├── Constants.java
    └── TokenManager.java
```

## 🔐 Authentication Flow

1. **Splash Screen**: Checks if user is logged in
   - If yes → Navigate to appropriate dashboard
   - If no → Navigate to Login screen

2. **Login**: 
   - User enters email and password
   - App sends POST request to `/api/auth/login`
   - On success, saves JWT token and user data
   - Navigates to role-based dashboard

3. **Register**:
   - User fills registration form
   - App sends POST request to `/api/auth/register`
   - On success, navigates back to Login

## 📡 API Integration

The app uses Retrofit to communicate with the AUGCVS backend:

- **Login**: `POST /api/auth/login`
- **Register**: `POST /api/auth/register`
- **Get Current User**: `GET /api/auth/me`

All authenticated requests include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## 🎨 Customization

### Change App Colors

Edit `app/src/main/res/values/colors.xml`:

```xml
<color name="purple_700">#FF3700B3</color>
```

### Change App Name

Edit `app/src/main/res/values/strings.xml`:

```xml
<string name="app_name">AUGCVS</string>
```

## 🐛 Troubleshooting

### Network Error

- Ensure your backend is running
- Check the `BASE_URL` in `Constants.java`
- For emulator, use `10.0.2.2` instead of `localhost`
- For physical device, ensure device and computer are on the same network

### Build Errors

- Clean and rebuild: "Build" → "Clean Project" → "Rebuild Project"
- Invalidate caches: "File" → "Invalidate Caches / Restart"

## 📝 Next Steps

This is a foundation project with authentication implemented. To continue development:

1. **Add Verification Module**: Create activities for submitting and viewing verifications
2. **Add Graduate Management**: Implement graduate list and details
3. **Add Real-Time Chat**: Integrate Socket.IO for chat functionality
4. **Add User Management**: Admin screens for managing users

Refer to the [Android Development Roadmap](../ANDROID_ROADMAP.md) for detailed implementation steps.

## 📄 License

This project is part of the AUGCVS system developed for Ambo University.

## 👨‍💻 Developer

Built with ❤️ for Ambo University
