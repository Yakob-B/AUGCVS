package com.augcvs.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.augcvs.R;
import com.augcvs.adapters.VerificationAdapter;
import com.augcvs.api.ApiClient;
import com.augcvs.api.VerificationService;
import com.augcvs.models.ApiResponse;
import com.augcvs.models.Verification;
import com.augcvs.utils.TokenManager;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class VerificationListActivity extends AppCompatActivity {
    
    private RecyclerView recyclerView;
    private VerificationAdapter adapter;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    private SwipeRefreshLayout swipeRefresh;
    private FloatingActionButton fabAdd;
    
    private VerificationService verificationService;
    private String userRole;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_verification_list);
        
        // Initialize views
        recyclerView = findViewById(R.id.recycler_view);
        progressBar = findViewById(R.id.progress_bar);
        tvEmpty = findViewById(R.id.tv_empty);
        swipeRefresh = findViewById(R.id.swipe_refresh);
        fabAdd = findViewById(R.id.fab_add);
        
        // Setup RecyclerView
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new VerificationAdapter(this, this::openVerificationDetail);
        recyclerView.setAdapter(adapter);
        
        // Initialize API
        verificationService = ApiClient.createService(VerificationService.class);
        userRole = TokenManager.getInstance(this).getUserRole();
        
        // Show FAB only for external users
        if ("external".equals(userRole)) {
            fabAdd.setVisibility(View.VISIBLE);
            fabAdd.setOnClickListener(v -> {
                startActivity(new Intent(this, SubmitVerificationActivity.class));
            });
        } else {
            fabAdd.setVisibility(View.GONE);
        }
        
        // Swipe to refresh
        swipeRefresh.setOnRefreshListener(this::loadVerifications);
        
        // Load data
        loadVerifications();
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        loadVerifications();
    }
    
    private void loadVerifications() {
        setLoading(true);
        
        Call<ApiResponse<Verification>> call;
        
        if ("external".equals(userRole)) {
            // External users see only their requests
            call = verificationService.getMyVerifications();
        } else {
            // Admin/Registrar see all verifications
            call = verificationService.getVerifications(1, 50, null);
        }
        
        call.enqueue(new Callback<ApiResponse<Verification>>() {
            @Override
            public void onResponse(Call<ApiResponse<Verification>> call, Response<ApiResponse<Verification>> response) {
                setLoading(false);
                swipeRefresh.setRefreshing(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    List<Verification> verifications = response.body().getResults();
                    
                    if (verifications != null && !verifications.isEmpty()) {
                        adapter.setVerifications(verifications);
                        tvEmpty.setVisibility(View.GONE);
                        recyclerView.setVisibility(View.VISIBLE);
                    } else {
                        showEmpty();
                    }
                } else {
                    Toast.makeText(VerificationListActivity.this, 
                        "Failed to load verifications", 
                        Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<ApiResponse<Verification>> call, Throwable t) {
                setLoading(false);
                swipeRefresh.setRefreshing(false);
                Toast.makeText(VerificationListActivity.this, 
                    "Network error: " + t.getMessage(), 
                    Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void openVerificationDetail(Verification verification) {
        Intent intent = new Intent(this, VerificationDetailActivity.class);
        intent.putExtra("verification_id", verification.get_id());
        startActivity(intent);
    }
    
    private void setLoading(boolean isLoading) {
        if (isLoading) {
            progressBar.setVisibility(View.VISIBLE);
            recyclerView.setVisibility(View.GONE);
            tvEmpty.setVisibility(View.GONE);
        } else {
            progressBar.setVisibility(View.GONE);
        }
    }
    
    private void showEmpty() {
        recyclerView.setVisibility(View.GONE);
        tvEmpty.setVisibility(View.VISIBLE);
    }
}
