package com.augcvs.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.augcvs.R;
import com.augcvs.adapters.GraduateAdapter;
import com.augcvs.api.ApiClient;
import com.augcvs.api.GraduateService;
import com.augcvs.api.VerificationService;
import com.augcvs.models.ApiResponse;
import com.augcvs.models.Graduate;
import com.augcvs.models.Verification;
import com.augcvs.models.VerificationRequest;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SubmitVerificationActivity extends AppCompatActivity {
    
    private EditText etSearch, etPurpose;
    private Button btnSearch, btnSubmit;
    private RecyclerView recyclerView;
    private ProgressBar progressBar;
    
    private GraduateAdapter adapter;
    private GraduateService graduateService;
    private VerificationService verificationService;
    private Graduate selectedGraduate;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_submit_verification);
        
        // Initialize views
        etSearch = findViewById(R.id.et_search);
        etPurpose = findViewById(R.id.et_purpose);
        btnSearch = findViewById(R.id.btn_search);
        btnSubmit = findViewById(R.id.btn_submit);
        recyclerView = findViewById(R.id.recycler_view);
        progressBar = findViewById(R.id.progress_bar);
        
        // Setup RecyclerView
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new GraduateAdapter(this, this::onGraduateSelected);
        recyclerView.setAdapter(adapter);
        
        // Initialize API
        graduateService = ApiClient.createService(GraduateService.class);
        verificationService = ApiClient.createService(VerificationService.class);
        
        // Set listeners
        btnSearch.setOnClickListener(v -> searchGraduates());
        btnSubmit.setOnClickListener(v -> submitVerification());
        
        btnSubmit.setEnabled(false);
    }
    
    private void searchGraduates() {
        String query = etSearch.getText().toString().trim();
        
        if (query.isEmpty()) {
            etSearch.setError("Enter student ID or name");
            return;
        }
        
        progressBar.setVisibility(View.VISIBLE);
        
        graduateService.searchGraduates(query).enqueue(new Callback<ApiResponse<Graduate>>() {
            @Override
            public void onResponse(Call<ApiResponse<Graduate>> call, Response<ApiResponse<Graduate>> response) {
                progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    List<Graduate> graduates = response.body().getResults();
                    
                    if (graduates != null && !graduates.isEmpty()) {
                        adapter.setGraduates(graduates);
                        recyclerView.setVisibility(View.VISIBLE);
                    } else {
                        Toast.makeText(SubmitVerificationActivity.this, 
                            "No graduates found", 
                            Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Toast.makeText(SubmitVerificationActivity.this, 
                        "Search failed", 
                        Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<ApiResponse<Graduate>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(SubmitVerificationActivity.this, 
                    "Network error: " + t.getMessage(), 
                    Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void onGraduateSelected(Graduate graduate) {
        selectedGraduate = graduate;
        adapter.setSelectedGraduate(graduate);
        btnSubmit.setEnabled(true);
        
        Toast.makeText(this, 
            "Selected: " + graduate.getFullName(), 
            Toast.LENGTH_SHORT).show();
    }
    
    private void submitVerification() {
        if (selectedGraduate == null) {
            Toast.makeText(this, "Please select a graduate", Toast.LENGTH_SHORT).show();
            return;
        }
        
        String purpose = etPurpose.getText().toString().trim();
        
        if (purpose.isEmpty()) {
            etPurpose.setError("Purpose is required");
            return;
        }
        
        progressBar.setVisibility(View.VISIBLE);
        btnSubmit.setEnabled(false);
        
        VerificationRequest request = new VerificationRequest(selectedGraduate.get_id(), purpose);
        
        verificationService.submitVerification(request).enqueue(new Callback<ApiResponse<Verification>>() {
            @Override
            public void onResponse(Call<ApiResponse<Verification>> call, Response<ApiResponse<Verification>> response) {
                progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    Toast.makeText(SubmitVerificationActivity.this, 
                        "Verification request submitted successfully!", 
                        Toast.LENGTH_LONG).show();
                    finish();
                } else {
                    btnSubmit.setEnabled(true);
                    Toast.makeText(SubmitVerificationActivity.this, 
                        "Failed to submit request", 
                        Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<ApiResponse<Verification>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                btnSubmit.setEnabled(true);
                Toast.makeText(SubmitVerificationActivity.this, 
                    "Network error: " + t.getMessage(), 
                    Toast.LENGTH_SHORT).show();
            }
        });
    }
}
