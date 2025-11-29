package com.augcvs.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.SearchView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.augcvs.R;
import com.augcvs.adapters.GraduateListAdapter;
import com.augcvs.api.ApiClient;
import com.augcvs.api.GraduateService;
import com.augcvs.models.ApiResponse;
import com.augcvs.models.Graduate;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class GraduateListActivity extends AppCompatActivity {
    
    private RecyclerView recyclerView;
    private GraduateListAdapter adapter;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    private SwipeRefreshLayout swipeRefresh;
    private SearchView searchView;
    
    private GraduateService graduateService;
    private int currentPage = 1;
    private boolean isSearching = false;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_graduate_list);
        
        // Initialize views
        recyclerView = findViewById(R.id.recycler_view);
        progressBar = findViewById(R.id.progress_bar);
        tvEmpty = findViewById(R.id.tv_empty);
        swipeRefresh = findViewById(R.id.swipe_refresh);
        searchView = findViewById(R.id.search_view);
        
        // Setup RecyclerView
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new GraduateListAdapter(this, this::openGraduateDetail);
        recyclerView.setAdapter(adapter);
        
        // Initialize API
        graduateService = ApiClient.createService(GraduateService.class);
        
        // Swipe to refresh
        swipeRefresh.setOnRefreshListener(this::loadGraduates);
        
        // Search functionality
        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                searchGraduates(query);
                return true;
            }
            
            @Override
            public boolean onQueryTextChange(String newText) {
                if (newText.isEmpty()) {
                    isSearching = false;
                    loadGraduates();
                }
                return false;
            }
        });
        
        // Load data
        loadGraduates();
    }
    
    private void loadGraduates() {
        setLoading(true);
        isSearching = false;
        
        graduateService.getGraduates(currentPage, 50).enqueue(new Callback<ApiResponse<Graduate>>() {
            @Override
            public void onResponse(Call<ApiResponse<Graduate>> call, Response<ApiResponse<Graduate>> response) {
                setLoading(false);
                swipeRefresh.setRefreshing(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    List<Graduate> graduates = response.body().getResults();
                    
                    if (graduates != null && !graduates.isEmpty()) {
                        adapter.setGraduates(graduates);
                        tvEmpty.setVisibility(View.GONE);
                        recyclerView.setVisibility(View.VISIBLE);
                    } else {
                        showEmpty();
                    }
                } else {
                    Toast.makeText(GraduateListActivity.this, 
                        "Failed to load graduates", 
                        Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<ApiResponse<Graduate>> call, Throwable t) {
                setLoading(false);
                swipeRefresh.setRefreshing(false);
                Toast.makeText(GraduateListActivity.this, 
                    "Network error: " + t.getMessage(), 
                    Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void searchGraduates(String query) {
        setLoading(true);
        isSearching = true;
        
        graduateService.searchGraduates(query).enqueue(new Callback<ApiResponse<Graduate>>() {
            @Override
            public void onResponse(Call<ApiResponse<Graduate>> call, Response<ApiResponse<Graduate>> response) {
                setLoading(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    List<Graduate> graduates = response.body().getResults();
                    
                    if (graduates != null && !graduates.isEmpty()) {
                        adapter.setGraduates(graduates);
                        tvEmpty.setVisibility(View.GONE);
                        recyclerView.setVisibility(View.VISIBLE);
                    } else {
                        showEmpty();
                        Toast.makeText(GraduateListActivity.this, 
                            "No graduates found", 
                            Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Toast.makeText(GraduateListActivity.this, 
                        "Search failed", 
                        Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<ApiResponse<Graduate>> call, Throwable t) {
                setLoading(false);
                Toast.makeText(GraduateListActivity.this, 
                    "Network error: " + t.getMessage(), 
                    Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void openGraduateDetail(Graduate graduate) {
        Intent intent = new Intent(this, GraduateDetailActivity.class);
        intent.putExtra("graduate_id", graduate.get_id());
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
        tvEmpty.setText(isSearching ? "No graduates found" : "No graduates yet");
    }
}
