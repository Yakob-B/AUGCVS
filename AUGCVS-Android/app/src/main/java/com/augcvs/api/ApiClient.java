package com.augcvs.api;

import android.content.Context;

import com.augcvs.utils.Constants;
import com.augcvs.utils.TokenManager;

import java.io.IOException;

import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiClient {
    private static Retrofit retrofit = null;
    private static Context appContext;
    
    public static void init(Context context) {
        appContext = context.getApplicationContext();
    }
    
    public static Retrofit getClient() {
        if (retrofit == null) {
            // Logging interceptor for debugging
            HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
            loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);
            
            // Auth interceptor to add token to headers
            Interceptor authInterceptor = new Interceptor() {
                @Override
                public Response intercept(Chain chain) throws IOException {
                    Request original = chain.request();
                    
                    // Get token from TokenManager
                    String token = TokenManager.getInstance(appContext).getToken();
                    
                    Request.Builder requestBuilder = original.newBuilder();
                    
                    // Add token if available
                    if (token != null && !token.isEmpty()) {
                        requestBuilder.header("Authorization", "Bearer " + token);
                    }
                    
                    requestBuilder.header("Content-Type", "application/json");
                    requestBuilder.method(original.method(), original.body());
                    
                    Request request = requestBuilder.build();
                    return chain.proceed(request);
                }
            };
            
            // Build OkHttpClient
            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(authInterceptor)
                    .addInterceptor(loggingInterceptor)
                    .build();
            
            // Build Retrofit instance
            retrofit = new Retrofit.Builder()
                    .baseUrl(Constants.BASE_URL)
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }
    
    // Get API service
    public static <S> S createService(Class<S> serviceClass) {
        return getClient().create(serviceClass);
    }
}
