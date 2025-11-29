package com.augcvs.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.augcvs.R;
import com.augcvs.api.ApiClient;
import com.augcvs.api.UserService;
import com.augcvs.models.ApiResponse;
import com.augcvs.models.User;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class UserDetailActivity extends AppCompatActivity {
    
    private TextView tvName, tvEmail, tvRole, tvOrganization, tvEmailVerified;
    private ProgressBar progressBar;
    
    private UserService userService;
    private String userId;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_detail);
        
        // Get user ID from intent
        userId = getIntent().getStringExtra("user_id");
        
        if (userId == null) {
            Toast.makeText(this, "Invalid user", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        
        // Initialize views
        tvName = findViewById(R.id.tv_name);
        tvEmail = findViewById(R.id.tv_email);
        tvRole = findViewById(R.id.tv_role);
        tvOrganization = findViewById(R.id.tv_organization);
        tvEmailVerified = findViewById(R.id.tv_email_verified);
        progressBar = findViewById(R.id.progress_bar);
        
        // Initialize API
        userService = ApiClient.createService(UserService.class);
        
        // Load user details
        loadUserDetails();
    }
    
    private void loadUserDetails() {
        progressBar.setVisibility(View.VISIBLE);
        
        userService.getUser(userId).enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(Call<ApiResponse<User>> call, Response<ApiResponse<User>> response) {
                progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    User user = response.body().getData();
                    displayUserDetails(user);
                } else {
                    Toast.makeText(UserDetailActivity.this, 
                        "Failed to load user details", 
                        Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<ApiResponse<User>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(UserDetailActivity.this, 
                    "Network error: " + t.getMessage(), 
                    Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void displayUserDetails(User user) {
        tvName.setText(user.getFullName());
        tvEmail.setText(user.getEmail());
        tvRole.setText(user.getRole().toUpperCase());
        
        if (user.getOrganization() != null && !user.getOrganization().isEmpty()) {
            tvOrganization.setText(user.getOrganization());
        } else {
            tvOrganization.setText("N/A");
        }
        
        tvEmailVerified.setText(user.isEmailVerified() ? "Yes" : "No");
        tvEmailVerified.setTextColor(getResources().getColor(
            user.isEmailVerified() ? R.color.teal_700 : android.R.color.holo_red_dark
        ));
    }
}
