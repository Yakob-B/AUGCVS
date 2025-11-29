package com.augcvs.api;

import com.augcvs.models.ApiResponse;
import com.augcvs.models.Verification;
import com.augcvs.models.VerificationRequest;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface VerificationService {
    
    // Get all verifications (admin/registrar)
    @GET("verifications")
    Call<ApiResponse<Verification>> getVerifications(
        @Query("page") int page,
        @Query("limit") int limit,
        @Query("status") String status
    );
    
    // Get my verification requests (external users)
    @GET("verifications/my-requests")
    Call<ApiResponse<Verification>> getMyVerifications();
    
    // Get single verification
    @GET("verifications/{id}")
    Call<ApiResponse<Verification>> getVerification(@Path("id") String id);
    
    // Submit verification request
    @POST("verifications")
    Call<ApiResponse<Verification>> submitVerification(@Body VerificationRequest request);
    
    // Process verification (approve/reject)
    @PUT("verifications/{id}/process")
    Call<ApiResponse<Verification>> processVerification(
        @Path("id") String id,
        @Body ProcessRequest processRequest
    );
    
    // Inner class for process request
    class ProcessRequest {
        private String status;
        private String notes;
        
        public ProcessRequest(String status, String notes) {
            this.status = status;
            this.notes = notes;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
        
        public String getNotes() {
            return notes;
        }
        
        public void setNotes(String notes) {
            this.notes = notes;
        }
    }
}
