package com.augcvs.utils;

import android.content.Context;
import android.util.Log;

import com.augcvs.models.Message;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.URISyntaxException;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public class SocketManager {
    
    private static final String TAG = "SocketManager";
    private static SocketManager instance;
    private Socket socket;
    private Context context;
    private MessageListener messageListener;
    
    public interface MessageListener {
        void onNewMessage(Message message);
        void onMessageRead(String conversationId);
    }
    
    private SocketManager(Context context) {
        this.context = context.getApplicationContext();
        initSocket();
    }
    
    public static synchronized SocketManager getInstance(Context context) {
        if (instance == null) {
            instance = new SocketManager(context);
        }
        return instance;
    }
    
    private void initSocket() {
        try {
            TokenManager tokenManager = TokenManager.getInstance(context);
            String token = tokenManager.getToken();
            
            if (token == null) {
                Log.e(TAG, "No token available for socket connection");
                return;
            }
            
            IO.Options options = new IO.Options();
            options.auth = new java.util.HashMap<>();
            ((java.util.HashMap<String, String>) options.auth).put("token", token);
            options.reconnection = true;
            options.reconnectionDelay = 1000;
            options.reconnectionAttempts = 5;
            
            socket = IO.socket(Constants.BASE_URL, options);
            
            socket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    Log.d(TAG, "Socket connected");
                    joinUserRoom();
                }
            });
            
            socket.on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    Log.d(TAG, "Socket disconnected");
                }
            });
            
            socket.on(Socket.EVENT_CONNECT_ERROR, new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    Log.e(TAG, "Socket connection error: " + args[0]);
                }
            });
            
            socket.on("newMessage", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    if (args.length > 0 && messageListener != null) {
                        try {
                            JSONObject data = (JSONObject) args[0];
                            Message message = parseMessage(data);
                            messageListener.onNewMessage(message);
                        } catch (Exception e) {
                            Log.e(TAG, "Error parsing message: " + e.getMessage());
                        }
                    }
                }
            });
            
            socket.on("messageRead", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    if (args.length > 0 && messageListener != null) {
                        try {
                            JSONObject data = (JSONObject) args[0];
                            String conversationId = data.getString("conversationId");
                            messageListener.onMessageRead(conversationId);
                        } catch (JSONException e) {
                            Log.e(TAG, "Error parsing messageRead: " + e.getMessage());
                        }
                    }
                }
            });
            
        } catch (URISyntaxException e) {
            Log.e(TAG, "Socket initialization error: " + e.getMessage());
        }
    }
    
    private Message parseMessage(JSONObject data) throws JSONException {
        Message message = new Message();
        message.set_id(data.optString("_id"));
        message.setSender(data.optString("sender"));
        message.setSenderName(data.optString("senderName"));
        message.setContent(data.optString("content"));
        message.setTimestamp(data.optString("timestamp"));
        message.setRead(data.optBoolean("read", false));
        return message;
    }
    
    private void joinUserRoom() {
        TokenManager tokenManager = TokenManager.getInstance(context);
        String userId = tokenManager.getUserId();
        String role = tokenManager.getUserRole();
        
        if (userId != null) {
            socket.emit("join", userId);
            Log.d(TAG, "Joined user room: " + userId);
            
            // If registrar, join registrar room
            if ("registrar".equals(role) || "admin".equals(role)) {
                socket.emit("joinRegistrarRoom");
                Log.d(TAG, "Joined registrar room");
            }
        }
    }
    
    public void connect() {
        if (socket != null && !socket.connected()) {
            socket.connect();
        }
    }
    
    public void disconnect() {
        if (socket != null && socket.connected()) {
            socket.disconnect();
        }
    }
    
    public void sendMessage(String conversationId, String content) {
        if (socket != null && socket.connected()) {
            try {
                JSONObject data = new JSONObject();
                data.put("conversationId", conversationId);
                data.put("content", content);
                socket.emit("sendMessage", data);
            } catch (JSONException e) {
                Log.e(TAG, "Error sending message: " + e.getMessage());
            }
        }
    }
    
    public void markAsRead(String conversationId) {
        if (socket != null && socket.connected()) {
            socket.emit("markAsRead", conversationId);
        }
    }
    
    public void setMessageListener(MessageListener listener) {
        this.messageListener = listener;
    }
    
    public boolean isConnected() {
        return socket != null && socket.connected();
    }
}
