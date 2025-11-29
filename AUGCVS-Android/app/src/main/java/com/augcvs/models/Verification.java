package com.augcvs.models;

public class Verification {
    private String _id;
    private String requestNumber;
    private Graduate graduate;
    private User requestedBy;
    private String status; // pending, approved, rejected
    private String purpose;
    private String notes;
    private String processedBy;
    private String createdAt;
    private String updatedAt;
    
    // Constructors
    public Verification() {}
    
    // Getters and Setters
    public String get_id() {
        return _id;
    }
    
    public void set_id(String _id) {
        this._id = _id;
    }
    
    public String getRequestNumber() {
        return requestNumber;
    }
    
    public void setRequestNumber(String requestNumber) {
        this.requestNumber = requestNumber;
    }
    
    public Graduate getGraduate() {
        return graduate;
    }
    
    public void setGraduate(Graduate graduate) {
        this.graduate = graduate;
    }
    
    public User getRequestedBy() {
        return requestedBy;
    }
    
    public void setRequestedBy(User requestedBy) {
        this.requestedBy = requestedBy;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getPurpose() {
        return purpose;
    }
    
    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public String getProcessedBy() {
        return processedBy;
    }
    
    public void setProcessedBy(String processedBy) {
        this.processedBy = processedBy;
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
    
    public String getStatusColor() {
        switch (status) {
            case "approved":
                return "#4CAF50"; // Green
            case "rejected":
                return "#F44336"; // Red
            case "pending":
            default:
                return "#FFC107"; // Yellow
        }
    }
}
