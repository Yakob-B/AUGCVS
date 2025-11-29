package com.augcvs.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import com.augcvs.R;
import com.augcvs.utils.TokenManager;

public class ExternalDashboardActivity extends AppCompatActivity {
    
    private TextView tvWelcome;
    private CardView cardVerifications, cardChat;
    private Button btnLogout;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_external_dashboard);
        
        tvWelcome = findViewById(R.id.tv_welcome);
        cardVerifications = findViewById(R.id.card_verifications);
        cardChat = findViewById(R.id.card_chat);
        btnLogout = findViewById(R.id.btn_logout);
        
        // Display user name
        TokenManager tokenManager = TokenManager.getInstance(this);
        tvWelcome.setText("Welcome, " + tokenManager.getUserName());
        
        // Navigate to verifications
        cardVerifications.setOnClickListener(v -> {
            startActivity(new Intent(this, VerificationListActivity.class));
        });
        
        // Navigate to chat
        cardChat.setOnClickListener(v -> {
            startActivity(new Intent(this, ChatListActivity.class));
        });
        
        // Logout button
        btnLogout.setOnClickListener(v -> logout());
    }
    
    private void logout() {
        TokenManager.getInstance(this).clearAll();
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
