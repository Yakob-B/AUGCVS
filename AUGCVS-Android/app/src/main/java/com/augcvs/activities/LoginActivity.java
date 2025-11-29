package com.augcvs.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.augcvs.R;
import com.augcvs.api.ApiClient;
import com.augcvs.api.AuthService;
import com.augcvs.models.AuthResponse;
import com.augcvs.models.LoginRequest;
import com.augcvs.utils.Constants;
import com.augcvs.utils.TokenManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {
    
    private EditText etEmail, etPassword;
    private Button btnLogin;
    private TextView tvRegister;
    private ProgressBar progressBar;
    
    private AuthService authService;
    private TokenManager tokenManager;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        
        // Initialize views
        etEmail = findViewById(R.id.et_email);
        etPassword = findViewById(R.id.et_password);
        btnLogin = findViewById(R.id.btn_login);
        tvRegister = findViewById(R.id.tv_register);
        progressBar = findViewById(R.id.progress_bar);
        
        // Initialize API and TokenManager
        authService = ApiClient.createService(AuthService.class);
        tokenManager = TokenManager.getInstance(this);
        
        // Set click listeners
        btnLogin.setOnClickListener(v -> handleLogin());
        tvRegister.setOnClickListener(v -> {
            startActivity(new Intent(LoginActivity.this, RegisterActivity.class));
        });
    }
    
    private void handleLogin() {
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        
        // Validation
        if (email.isEmpty()) {
            etEmail.setError("Email is required");
            etEmail.requestFocus();
            return;
        }
        
        if (password.isEmpty()) {
            etPassword.setError("Password is required");
            etPassword.requestFocus();
            return;
        }
        
        // Show loading
        setLoading(true);
        
        // Create login request
        LoginRequest loginRequest = new LoginRequest(email, password);
        
        // Make API call
        authService.login(loginRequest).enqueue(new Callback<AuthResponse>() {
            @Override
            public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                setLoading(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    AuthResponse authResponse = response.body();
                    
                    if (authResponse.isSuccess()) {
                        // Save token and user data
                        tokenManager.saveToken(authResponse.getToken());
                        tokenManager.saveUserData(
                            authResponse.getUser().get_id(),
                            authResponse.getUser().getRole(),
                            authResponse.getUser().getFullName(),
                            authResponse.getUser().getEmail()
                        );
                        
                        // Navigate to appropriate dashboard
                        navigateToDashboard(authResponse.getUser().getRole());
                    } else {
                        Toast.makeText(LoginActivity.this, 
                            authResponse.getMessage(), Toast.LENGTH_LONG).show();
                    }
                } else {
                    Toast.makeText(LoginActivity.this, 
                        "Login failed. Please check your credentials.", 
                        Toast.LENGTH_LONG).show();
                }
            }
            
            @Override
            public void onFailure(Call<AuthResponse> call, Throwable t) {
                setLoading(false);
                Toast.makeText(LoginActivity.this, 
                    "Network error: " + t.getMessage(), 
                    Toast.LENGTH_LONG).show();
            }
        });
    }
    
    private void navigateToDashboard(String role) {
        Intent intent;
        
        switch (role) {
            case Constants.ROLE_ADMIN:
            case Constants.ROLE_SUPERADMIN:
                intent = new Intent(this, AdminDashboardActivity.class);
                break;
            case Constants.ROLE_REGISTRAR:
                intent = new Intent(this, RegistrarDashboardActivity.class);
                break;
            case Constants.ROLE_EXTERNAL:
            default:
                intent = new Intent(this, ExternalDashboardActivity.class);
                break;
        }
        
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
    
    private void setLoading(boolean isLoading) {
        if (isLoading) {
            progressBar.setVisibility(View.VISIBLE);
            btnLogin.setEnabled(false);
        } else {
            progressBar.setVisibility(View.GONE);
            btnLogin.setEnabled(true);
        }
    }
}
