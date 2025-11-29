package com.augcvs.api;

import com.augcvs.models.AuthResponse;
import com.augcvs.models.LoginRequest;
import com.augcvs.models.RegisterRequest;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;

public interface AuthService {
    
    @POST("auth/login")
    Call<AuthResponse> login(@Body LoginRequest loginRequest);
    
    @POST("auth/register")
    Call<AuthResponse> register(@Body RegisterRequest registerRequest);
    
    @GET("auth/me")
    Call<AuthResponse> getCurrentUser();
}
