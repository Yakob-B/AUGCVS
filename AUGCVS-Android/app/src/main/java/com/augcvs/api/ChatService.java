package com.augcvs.api;

import com.augcvs.models.ApiResponse;
import com.augcvs.models.Conversation;
import com.augcvs.models.Message;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface ChatService {
    
    @GET("chat/conversations")
    Call<ApiResponse<Conversation>> getConversations();
    
    @GET("chat/conversations/{id}/messages")
    Call<List<Message>> getMessages(@Path("id") String conversationId);
    
    @POST("chat/conversations/{id}/messages")
    Call<ApiResponse<Message>> sendMessage(
        @Path("id") String conversationId,
        @Body MessageRequest request
    );
    
    class MessageRequest {
        private String content;
        
        public MessageRequest(String content) {
            this.content = content;
        }
        
        public String getContent() {
            return content;
        }
        
        public void setContent(String content) {
            this.content = content;
        }
    }
}
