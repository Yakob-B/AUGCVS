package com.augcvs.activities;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;

import androidx.appcompat.app.AppCompatActivity;

import com.augcvs.R;
import com.augcvs.api.ApiClient;
import com.augcvs.utils.TokenManager;

public class SplashActivity extends AppCompatActivity {
    
    private static final int SPLASH_DELAY = 2000; // 2 seconds
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);
        
        // Initialize ApiClient
        ApiClient.init(this);
        
        // Check if user is logged in after delay
        new Handler().postDelayed(() -> {
            TokenManager tokenManager = TokenManager.getInstance(this);
            
            Intent intent;
            if (tokenManager.isLoggedIn()) {
                // Navigate to appropriate dashboard based on role
                String role = tokenManager.getUserRole();
                intent = getDashboardIntent(role);
            } else {
                // Navigate to login
                intent = new Intent(this, LoginActivity.class);
            }
            
            startActivity(intent);
            finish();
        }, SPLASH_DELAY);
    }
    
    private Intent getDashboardIntent(String role) {
        if (role == null) {
            return new Intent(this, LoginActivity.class);
        }
        
        switch (role) {
            case "admin":
            case "superadmin":
                return new Intent(this, AdminDashboardActivity.class);
            case "registrar":
                return new Intent(this, RegistrarDashboardActivity.class);
            case "external":
            default:
                return new Intent(this, ExternalDashboardActivity.class);
        }
    }
}
