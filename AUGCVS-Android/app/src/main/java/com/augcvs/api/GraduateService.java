package com.augcvs.api;

import com.augcvs.models.ApiResponse;
import com.augcvs.models.Graduate;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface GraduateService {
    
    @GET("graduates")
    Call<ApiResponse<Graduate>> getGraduates(
        @Query("page") int page,
        @Query("limit") int limit
    );
    
    @GET("graduates/search")
    Call<ApiResponse<Graduate>> searchGraduates(
        @Query("query") String query
    );
    
    @GET("graduates/{id}")
    Call<ApiResponse<Graduate>> getGraduate(@Path("id") String id);
}
