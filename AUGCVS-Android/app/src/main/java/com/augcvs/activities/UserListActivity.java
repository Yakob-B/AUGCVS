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
import com.augcvs.adapters.UserAdapter;
import com.augcvs.api.ApiClient;
import com.augcvs.api.UserService;
import com.augcvs.models.ApiResponse;
import com.augcvs.models.User;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class UserListActivity extends AppCompatActivity {
    
    private RecyclerView recyclerView;
    private UserAdapter adapter;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    private SwipeRefreshLayout swipeRefresh;
    
    private UserService userService;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_list);
        
        // Initialize views
        recyclerView = findViewById(R.id.recycler_view);
        progressBar = findViewById(R.id.progress_bar);
        tvEmpty = findViewById(R.id.tv_empty);
        swipeRefresh = findViewById(R.id.swipe_refresh);
        
        // Setup RecyclerView
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new UserAdapter(this, this::openUserDetail);
        recyclerView.setAdapter(adapter);
        
        // Initialize API
        userService = ApiClient.createService(UserService.class);
        
        // Swipe to refresh
        swipeRefresh.setOnRefreshListener(this::loadUsers);
        
        // Load data
        loadUsers();
    }
    
    private void loadUsers() {
        setLoading(true);
        
        userService.getUsers(1, 100).enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(Call<ApiResponse<User>> call, Response<ApiResponse<User>> response) {
                setLoading(false);
                swipeRefresh.setRefreshing(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    List<User> users = response.body().getResults();
                    
                    if (users != null && !users.isEmpty()) {
                        adapter.setUsers(users);
                        tvEmpty.setVisibility(View.GONE);
                        recyclerView.setVisibility(View.VISIBLE);
                    } else {
                        showEmpty();
                    }
                } else {
                    Toast.makeText(UserListActivity.this, 
                        "Failed to load users", 
                        Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<ApiResponse<User>> call, Throwable t) {
                setLoading(false);
                swipeRefresh.setRefreshing(false);
                Toast.makeText(UserListActivity.this, 
                    "Network error: " + t.getMessage(), 
                    Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void openUserDetail(User user) {
        Intent intent = new Intent(this, UserDetailActivity.class);
        intent.putExtra("user_id", user.get_id());
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
