package com.augcvs.models;

import java.util.List;

public class Conversation {
    private String _id;
    private List<Participant> participants;
    private Message lastMessage;
    private int unreadCount;
    private String verificationRequest;
    private String createdAt;
    private String updatedAt;
    
    // Getters and Setters
    public String get_id() {
        return _id;
    }
    
    public void set_id(String _id) {
        this._id = _id;
    }
    
    public List<Participant> getParticipants() {
        return participants;
    }
    
    public void setParticipants(List<Participant> participants) {
        this.participants = participants;
    }
    
    public Message getLastMessage() {
        return lastMessage;
    }
    
    public void setLastMessage(Message lastMessage) {
        this.lastMessage = lastMessage;
    }
    
    public int getUnreadCount() {
        return unreadCount;
    }
    
    public void setUnreadCount(int unreadCount) {
        this.unreadCount = unreadCount;
    }
    
    public String getVerificationRequest() {
        return verificationRequest;
    }
    
    public void setVerificationRequest(String verificationRequest) {
        this.verificationRequest = verificationRequest;
    }
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getOtherParticipantName(String currentUserId) {
        if (participants != null) {
            for (Participant p : participants) {
                if (!p.getUserId().equals(currentUserId)) {
                    return p.getName();
                }
            }
        }
        return "Unknown";
    }
    
    public static class Participant {
        private String userId;
        private String name;
        
        public String getUserId() {
            return userId;
        }
        
        public void setUserId(String userId) {
            this.userId = userId;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
    }
}
