package com.augcvs.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class TokenManager {
    private static TokenManager instance;
    private SharedPreferences prefs;
    
    private TokenManager(Context context) {
        prefs = context.getSharedPreferences(Constants.PREF_NAME, Context.MODE_PRIVATE);
    }
    
    public static synchronized TokenManager getInstance(Context context) {
        if (instance == null) {
            instance = new TokenManager(context.getApplicationContext());
        }
        return instance;
    }
    
    // Save token
    public void saveToken(String token) {
        prefs.edit().putString(Constants.KEY_TOKEN, token).apply();
    }
    
    // Get token
    public String getToken() {
        return prefs.getString(Constants.KEY_TOKEN, null);
    }
    
    // Check if user is logged in
    public boolean isLoggedIn() {
        return getToken() != null;
    }
    
    // Save user data
    public void saveUserData(String userId, String role, String name, String email) {
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(Constants.KEY_USER_ID, userId);
        editor.putString(Constants.KEY_USER_ROLE, role);
        editor.putString(Constants.KEY_USER_NAME, name);
        editor.putString(Constants.KEY_USER_EMAIL, email);
        editor.apply();
    }
    
    // Get user role
    public String getUserRole() {
        return prefs.getString(Constants.KEY_USER_ROLE, null);
    }
    
    // Get user ID
    public String getUserId() {
        return prefs.getString(Constants.KEY_USER_ID, null);
    }
    
    // Get user name
    public String getUserName() {
        return prefs.getString(Constants.KEY_USER_NAME, null);
    }
    
    // Get user email
    public String getUserEmail() {
        return prefs.getString(Constants.KEY_USER_EMAIL, null);
    }
    
    // Clear all data (logout)
    public void clearAll() {
        prefs.edit().clear().apply();
    }
}
