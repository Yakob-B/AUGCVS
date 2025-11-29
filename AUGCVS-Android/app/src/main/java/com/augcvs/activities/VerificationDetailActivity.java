package com.augcvs.activities;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.augcvs.R;
import com.augcvs.api.ApiClient;
import com.augcvs.api.VerificationService;
import com.augcvs.models.ApiResponse;
import com.augcvs.models.Verification;
import com.augcvs.utils.TokenManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class VerificationDetailActivity extends AppCompatActivity {
    
    private TextView tvRequestNumber, tvStatus, tvGraduateName, tvStudentId, tvProgram, 
                     tvDepartment, tvPurpose, tvRequestedBy, tvDate, tvNotes;
    private LinearLayout layoutActions;
    private Button btnApprove, btnReject;
    private ProgressBar progressBar;
    
    private VerificationService verificationService;
    private String verificationId;
    private String userRole;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_verification_detail);
        
        // Get verification ID from intent
        verificationId = getIntent().getStringExtra("verification_id");
        
        if (verificationId == null) {
            Toast.makeText(this, "Invalid verification", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        
        // Initialize views
        tvRequestNumber = findViewById(R.id.tv_request_number);
        tvStatus = findViewById(R.id.tv_status);
        tvGraduateName = findViewById(R.id.tv_graduate_name);
        tvStudentId = findViewById(R.id.tv_student_id);
        tvProgram = findViewById(R.id.tv_program);
        tvDepartment = findViewById(R.id.tv_department);
        tvPurpose = findViewById(R.id.tv_purpose);
        tvRequestedBy = findViewById(R.id.tv_requested_by);
        tvDate = findViewById(R.id.tv_date);
        tvNotes = findViewById(R.id.tv_notes);
        layoutActions = findViewById(R.id.layout_actions);
        btnApprove = findViewById(R.id.btn_approve);
        btnReject = findViewById(R.id.btn_reject);
        progressBar = findViewById(R.id.progress_bar);
        
        // Initialize API
        verificationService = ApiClient.createService(VerificationService.class);
        userRole = TokenManager.getInstance(this).getUserRole();
        
        // Set button listeners
        btnApprove.setOnClickListener(v -> showProcessDialog("approved"));
        btnReject.setOnClickListener(v -> showProcessDialog("rejected"));
        
        // Load verification details
        loadVerificationDetails();
    }
    
    private void loadVerificationDetails() {
        progressBar.setVisibility(View.VISIBLE);
        
        verificationService.getVerification(verificationId).enqueue(new Callback<ApiResponse<Verification>>() {
            @Override
            public void onResponse(Call<ApiResponse<Verification>> call, Response<ApiResponse<Verification>> response) {
                progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    Verification verification = response.body().getData();
                    displayVerificationDetails(verification);
                } else {
                    Toast.makeText(VerificationDetailActivity.this, 
                        "Failed to load verification details", 
                        Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<ApiResponse<Verification>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(VerificationDetailActivity.this, 
                    "Network error: " + t.getMessage(), 
                    Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void displayVerificationDetails(Verification verification) {
        tvRequestNumber.setText("Request #" + verification.getRequestNumber());
        tvStatus.setText(verification.getStatus().toUpperCase());
        tvStatus.setTextColor(Color.parseColor(verification.getStatusColor()));
        
        if (verification.getGraduate() != null) {
            tvGraduateName.setText(verification.getGraduate().getFullName());
            tvStudentId.setText(verification.getGraduate().getStudentId());
            tvProgram.setText(verification.getGraduate().getProgram());
            tvDepartment.setText(verification.getGraduate().getDepartment());
        }
        
        tvPurpose.setText(verification.getPurpose());
        
        if (verification.getRequestedBy() != null) {
            tvRequestedBy.setText(verification.getRequestedBy().getFullName() + 
                " (" + verification.getRequestedBy().getOrganization() + ")");
        }
        
        tvDate.setText(verification.getCreatedAt());
        
        if (verification.getNotes() != null && !verification.getNotes().isEmpty()) {
            tvNotes.setText(verification.getNotes());
            tvNotes.setVisibility(View.VISIBLE);
        } else {
            tvNotes.setVisibility(View.GONE);
        }
        
        // Show action buttons only for registrars/admins and pending verifications
        if (("registrar".equals(userRole) || "admin".equals(userRole)) && 
            "pending".equals(verification.getStatus())) {
            layoutActions.setVisibility(View.VISIBLE);
        } else {
            layoutActions.setVisibility(View.GONE);
        }
    }
    
    private void showProcessDialog(String status) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle(status.equals("approved") ? "Approve Verification" : "Reject Verification");
        
        // Create input for notes
        final EditText input = new EditText(this);
        input.setHint("Notes (optional)");
        input.setLines(3);
        builder.setView(input);
        
        builder.setPositiveButton("Confirm", (dialog, which) -> {
            String notes = input.getText().toString().trim();
            processVerification(status, notes);
        });
        
        builder.setNegativeButton("Cancel", (dialog, which) -> dialog.cancel());
        builder.show();
    }
    
    private void processVerification(String status, String notes) {
        progressBar.setVisibility(View.VISIBLE);
        layoutActions.setVisibility(View.GONE);
        
        VerificationService.ProcessRequest request = new VerificationService.ProcessRequest(status, notes);
        
        verificationService.processVerification(verificationId, request)
            .enqueue(new Callback<ApiResponse<Verification>>() {
                @Override
                public void onResponse(Call<ApiResponse<Verification>> call, Response<ApiResponse<Verification>> response) {
                    progressBar.setVisibility(View.GONE);
                    
                    if (response.isSuccessful() && response.body() != null) {
                        Toast.makeText(VerificationDetailActivity.this, 
                            "Verification " + status + " successfully!", 
                            Toast.LENGTH_LONG).show();
                        loadVerificationDetails(); // Reload to show updated status
                    } else {
                        layoutActions.setVisibility(View.VISIBLE);
                        Toast.makeText(VerificationDetailActivity.this, 
                            "Failed to process verification", 
                            Toast.LENGTH_SHORT).show();
                    }
                }
                
                @Override
                public void onFailure(Call<ApiResponse<Verification>> call, Throwable t) {
                    progressBar.setVisibility(View.GONE);
                    layoutActions.setVisibility(View.VISIBLE);
                    Toast.makeText(VerificationDetailActivity.this, 
                        "Network error: " + t.getMessage(), 
                        Toast.LENGTH_SHORT).show();
                }
            });
    }
}
