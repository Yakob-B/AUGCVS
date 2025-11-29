package com.augcvs.api;

import com.augcvs.models.ApiResponse;
import com.augcvs.models.User;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface UserService {
    
    @GET("users")
    Call<ApiResponse<User>> getUsers(
        @Query("page") int page,
        @Query("limit") int limit
    );
    
    @GET("users/{id}")
    Call<ApiResponse<User>> getUser(@Path("id") String id);
}
