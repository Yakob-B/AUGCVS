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
import com.augcvs.adapters.ConversationAdapter;
import com.augcvs.api.ApiClient;
import com.augcvs.api.ChatService;
import com.augcvs.models.ApiResponse;
import com.augcvs.models.Conversation;
import com.augcvs.models.Message;
import com.augcvs.utils.SocketManager;
import com.augcvs.utils.TokenManager;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ChatListActivity extends AppCompatActivity implements SocketManager.MessageListener {
    
    private RecyclerView recyclerView;
    private ConversationAdapter adapter;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    private SwipeRefreshLayout swipeRefresh;
    
    private ChatService chatService;
    private SocketManager socketManager;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat_list);
        
        // Initialize views
        recyclerView = findViewById(R.id.recycler_view);
        progressBar = findViewById(R.id.progress_bar);
        tvEmpty = findViewById(R.id.tv_empty);
        swipeRefresh = findViewById(R.id.swipe_refresh);
        
        // Setup RecyclerView
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ConversationAdapter(this, this::openChat);
        recyclerView.setAdapter(adapter);
        
        // Initialize API and Socket
        chatService = ApiClient.createService(ChatService.class);
        socketManager = SocketManager.getInstance(this);
        socketManager.setMessageListener(this);
        socketManager.connect();
        
        // Swipe to refresh
        swipeRefresh.setOnRefreshListener(this::loadConversations);
        
        // Load data
        loadConversations();
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        loadConversations();
        if (!socketManager.isConnected()) {
            socketManager.connect();
        }
    }
    
    @Override
    protected void onPause() {
        super.onPause();
        socketManager.disconnect();
    }
    
    private void loadConversations() {
        setLoading(true);
        
        chatService.getConversations().enqueue(new Callback<ApiResponse<Conversation>>() {
            @Override
            public void onResponse(Call<ApiResponse<Conversation>> call, Response<ApiResponse<Conversation>> response) {
                setLoading(false);
                swipeRefresh.setRefreshing(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    List<Conversation> conversations = response.body().getResults();
                    
                    if (conversations != null && !conversations.isEmpty()) {
                        adapter.setConversations(conversations);
                        tvEmpty.setVisibility(View.GONE);
                        recyclerView.setVisibility(View.VISIBLE);
                    } else {
                        showEmpty();
                    }
                } else {
                    Toast.makeText(ChatListActivity.this, 
                        "Failed to load conversations", 
                        Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<ApiResponse<Conversation>> call, Throwable t) {
                setLoading(false);
                swipeRefresh.setRefreshing(false);
                Toast.makeText(ChatListActivity.this, 
                    "Network error: " + t.getMessage(), 
                    Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void openChat(Conversation conversation) {
        Intent intent = new Intent(this, ChatActivity.class);
        intent.putExtra("conversation_id", conversation.get_id());
        intent.putExtra("other_user_name", conversation.getOtherParticipantName(
            TokenManager.getInstance(this).getUserId()
        ));
        startActivity(intent);
    }
    
    @Override
    public void onNewMessage(Message message) {
        runOnUiThread(() -> {
            // Refresh conversation list
            loadConversations();
        });
    }
    
    @Override
    public void onMessageRead(String conversationId) {
        runOnUiThread(() -> {
            adapter.markAsRead(conversationId);
        });
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
