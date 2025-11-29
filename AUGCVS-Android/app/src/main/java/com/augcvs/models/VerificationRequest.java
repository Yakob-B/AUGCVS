package com.augcvs.models;

public class VerificationRequest {
    private String graduateId;
    private String purpose;
    
    public VerificationRequest(String graduateId, String purpose) {
        this.graduateId = graduateId;
        this.purpose = purpose;
    }
    
    public String getGraduateId() {
        return graduateId;
    }
    
    public void setGraduateId(String graduateId) {
        this.graduateId = graduateId;
    }
    
    public String getPurpose() {
        return purpose;
    }
    
    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }
}
