package com.augcvs.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.augcvs.R;
import com.augcvs.adapters.MessageAdapter;
import com.augcvs.api.ApiClient;
import com.augcvs.api.ChatService;
import com.augcvs.models.Message;
import com.augcvs.utils.SocketManager;
import com.augcvs.utils.TokenManager;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ChatActivity extends AppCompatActivity implements SocketManager.MessageListener {
    
    private RecyclerView recyclerView;
    private MessageAdapter adapter;
    private EditText etMessage;
    private ImageButton btnSend;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    
    private ChatService chatService;
    private SocketManager socketManager;
    private String conversationId;
    private String otherUserName;
    private String currentUserId;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat);
        
        // Get data from intent
        conversationId = getIntent().getStringExtra("conversation_id");
        otherUserName = getIntent().getStringExtra("other_user_name");
        
        if (conversationId == null) {
            Toast.makeText(this, "Invalid conversation", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        
        // Set title
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(otherUserName);
        }
        
        // Initialize views
        recyclerView = findViewById(R.id.recycler_view);
        etMessage = findViewById(R.id.et_message);
        btnSend = findViewById(R.id.btn_send);
        progressBar = findViewById(R.id.progress_bar);
        tvEmpty = findViewById(R.id.tv_empty);
        
        // Setup RecyclerView
        LinearLayoutManager layoutManager = new LinearLayoutManager(this);
        layoutManager.setStackFromEnd(true);
        recyclerView.setLayoutManager(layoutManager);
        
        currentUserId = TokenManager.getInstance(this).getUserId();
        adapter = new MessageAdapter(this, currentUserId);
        recyclerView.setAdapter(adapter);
        
        // Initialize API and Socket
        chatService = ApiClient.createService(ChatService.class);
        socketManager = SocketManager.getInstance(this);
        socketManager.setMessageListener(this);
        socketManager.connect();
        
        // Send button
        btnSend.setOnClickListener(v -> sendMessage());
        
        // Load messages
        loadMessages();
        
        // Mark as read
        socketManager.markAsRead(conversationId);
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        if (!socketManager.isConnected()) {
            socketManager.connect();
        }
    }
    
    private void loadMessages() {
        progressBar.setVisibility(View.VISIBLE);
        
        chatService.getMessages(conversationId).enqueue(new Callback<List<Message>>() {
            @Override
            public void onResponse(Call<List<Message>> call, Response<List<Message>> response) {
                progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    List<Message> messages = response.body();
                    
                    if (messages != null && !messages.isEmpty()) {
                        adapter.setMessages(messages);
                        tvEmpty.setVisibility(View.GONE);
                        recyclerView.setVisibility(View.VISIBLE);
                        recyclerView.scrollToPosition(messages.size() - 1);
                    } else {
                        tvEmpty.setVisibility(View.VISIBLE);
                        recyclerView.setVisibility(View.GONE);
                    }
                } else {
                    Toast.makeText(ChatActivity.this, 
                        "Failed to load messages", 
                        Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<List<Message>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(ChatActivity.this, 
                    "Network error: " + t.getMessage(), 
                    Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void sendMessage() {
        String content = etMessage.getText().toString().trim();
        
        if (content.isEmpty()) {
            return;
        }
        
        // Send via Socket.IO for real-time
        socketManager.sendMessage(conversationId, content);
        
        // Clear input
        etMessage.setText("");
        
        // Also send via API as backup
        ChatService.MessageRequest request = new ChatService.MessageRequest(content);
        chatService.sendMessage(conversationId, request).enqueue(new Callback() {
            @Override
            public void onResponse(Call call, Response response) {
                // Message sent successfully
            }
            
            @Override
            public void onFailure(Call call, Throwable t) {
                Toast.makeText(ChatActivity.this, 
                    "Failed to send message", 
                    Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    @Override
    public void onNewMessage(Message message) {
        runOnUiThread(() -> {
            adapter.addMessage(message);
            recyclerView.scrollToPosition(adapter.getItemCount() - 1);
            tvEmpty.setVisibility(View.GONE);
            recyclerView.setVisibility(View.VISIBLE);
            
            // Mark as read
            socketManager.markAsRead(conversationId);
        });
    }
    
    @Override
    public void onMessageRead(String conversationId) {
        // Handle message read status if needed
    }
}
