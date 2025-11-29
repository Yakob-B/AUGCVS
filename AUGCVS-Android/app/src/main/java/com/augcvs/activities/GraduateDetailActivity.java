package com.augcvs.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.augcvs.R;
import com.augcvs.api.ApiClient;
import com.augcvs.api.GraduateService;
import com.augcvs.models.ApiResponse;
import com.augcvs.models.Graduate;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class GraduateDetailActivity extends AppCompatActivity {
    
    private TextView tvName, tvStudentId, tvProgram, tvDepartment, tvDegree, 
                     tvGraduationDate, tvEmail, tvPhone;
    private ProgressBar progressBar;
    
    private GraduateService graduateService;
    private String graduateId;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_graduate_detail);
        
        // Get graduate ID from intent
        graduateId = getIntent().getStringExtra("graduate_id");
        
        if (graduateId == null) {
            Toast.makeText(this, "Invalid graduate", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        
        // Initialize views
        tvName = findViewById(R.id.tv_name);
        tvStudentId = findViewById(R.id.tv_student_id);
        tvProgram = findViewById(R.id.tv_program);
        tvDepartment = findViewById(R.id.tv_department);
        tvDegree = findViewById(R.id.tv_degree);
        tvGraduationDate = findViewById(R.id.tv_graduation_date);
        tvEmail = findViewById(R.id.tv_email);
        tvPhone = findViewById(R.id.tv_phone);
        progressBar = findViewById(R.id.progress_bar);
        
        // Initialize API
        graduateService = ApiClient.createService(GraduateService.class);
        
        // Load graduate details
        loadGraduateDetails();
    }
    
    private void loadGraduateDetails() {
        progressBar.setVisibility(View.VISIBLE);
        
        graduateService.getGraduate(graduateId).enqueue(new Callback<ApiResponse<Graduate>>() {
            @Override
            public void onResponse(Call<ApiResponse<Graduate>> call, Response<ApiResponse<Graduate>> response) {
                progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    Graduate graduate = response.body().getData();
                    displayGraduateDetails(graduate);
                } else {
                    Toast.makeText(GraduateDetailActivity.this, 
                        "Failed to load graduate details", 
                        Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<ApiResponse<Graduate>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(GraduateDetailActivity.this, 
                    "Network error: " + t.getMessage(), 
                    Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void displayGraduateDetails(Graduate graduate) {
        tvName.setText(graduate.getFullName());
        tvStudentId.setText(graduate.getStudentId());
        tvProgram.setText(graduate.getProgram());
        tvDepartment.setText(graduate.getDepartment());
        
        if (graduate.getDegreeType() != null) {
            tvDegree.setText(graduate.getDegreeType());
        }
        
        if (graduate.getGraduationDate() != null) {
            tvGraduationDate.setText(graduate.getGraduationDate());
        }
        
        // Note: Email and phone might not be in the Graduate model
        // These are placeholders - adjust based on your actual model
        tvEmail.setText("N/A");
        tvPhone.setText("N/A");
    }
}
