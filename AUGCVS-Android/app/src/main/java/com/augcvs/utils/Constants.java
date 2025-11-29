package com.augcvs.utils;

public class Constants {
    // API Configuration
    // TODO: Replace with your actual backend URL
    public static final String BASE_URL = "https://your-backend-url.com/api/";
    // For local testing: "http://10.0.2.2:5000/api/" (Android emulator)
    // For production: "https://augcvs-server.onrender.com/api/"
    
    // SharedPreferences Keys
    public static final String PREF_NAME = "AUGCVS_PREFS";
    public static final String KEY_TOKEN = "auth_token";
    public static final String KEY_USER_ID = "user_id";
    public static final String KEY_USER_ROLE = "user_role";
    public static final String KEY_USER_NAME = "user_name";
    public static final String KEY_USER_EMAIL = "user_email";
    
    // API Endpoints
    public static final String ENDPOINT_LOGIN = "auth/login";
    public static final String ENDPOINT_REGISTER = "auth/register";
    public static final String ENDPOINT_ME = "auth/me";
    public static final String ENDPOINT_GRADUATES = "graduates";
    public static final String ENDPOINT_VERIFICATIONS = "verifications";
    public static final String ENDPOINT_USERS = "users";
    public static final String ENDPOINT_CHATS = "chats";
    
    // User Roles
    public static final String ROLE_ADMIN = "admin";
    public static final String ROLE_REGISTRAR = "registrar";
    public static final String ROLE_EXTERNAL = "external";
    public static final String ROLE_SUPERADMIN = "superadmin";
    
    // Request Codes
    public static final int REQUEST_CODE_LOGIN = 1001;
    public static final int REQUEST_CODE_REGISTER = 1002;
}
