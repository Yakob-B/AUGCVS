package com.augcvs.adapters;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.RecyclerView;

import com.augcvs.R;
import com.augcvs.models.Verification;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class VerificationAdapter extends RecyclerView.Adapter<VerificationAdapter.ViewHolder> {
    
    private List<Verification> verifications;
    private Context context;
    private OnItemClickListener listener;
    
    public interface OnItemClickListener {
        void onItemClick(Verification verification);
    }
    
    public VerificationAdapter(Context context, OnItemClickListener listener) {
        this.context = context;
        this.verifications = new ArrayList<>();
        this.listener = listener;
    }
    
    public void setVerifications(List<Verification> verifications) {
        this.verifications = verifications;
        notifyDataSetChanged();
    }
    
    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_verification, parent, false);
        return new ViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Verification verification = verifications.get(position);
        
        holder.tvRequestNumber.setText("Request #" + verification.getRequestNumber());
        
        if (verification.getGraduate() != null) {
            holder.tvGraduateName.setText(verification.getGraduate().getFullName());
            holder.tvStudentId.setText("ID: " + verification.getGraduate().getStudentId());
        }
        
        holder.tvPurpose.setText(verification.getPurpose());
        holder.tvStatus.setText(verification.getStatus().toUpperCase());
        
        // Set status color
        int statusColor = Color.parseColor(verification.getStatusColor());
        holder.tvStatus.setTextColor(statusColor);
        
        // Format date
        if (verification.getCreatedAt() != null) {
            holder.tvDate.setText(formatDate(verification.getCreatedAt()));
        }
        
        holder.cardView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onItemClick(verification);
            }
        });
    }
    
    @Override
    public int getItemCount() {
        return verifications.size();
    }
    
    private String formatDate(String dateString) {
        try {
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault());
            SimpleDateFormat outputFormat = new SimpleDateFormat("MMM dd, yyyy", Locale.getDefault());
            Date date = inputFormat.parse(dateString);
            return outputFormat.format(date);
        } catch (Exception e) {
            return dateString;
        }
    }
    
    static class ViewHolder extends RecyclerView.ViewHolder {
        CardView cardView;
        TextView tvRequestNumber;
        TextView tvGraduateName;
        TextView tvStudentId;
        TextView tvPurpose;
        TextView tvStatus;
        TextView tvDate;
        
        ViewHolder(View itemView) {
            super(itemView);
            cardView = itemView.findViewById(R.id.card_view);
            tvRequestNumber = itemView.findViewById(R.id.tv_request_number);
            tvGraduateName = itemView.findViewById(R.id.tv_graduate_name);
            tvStudentId = itemView.findViewById(R.id.tv_student_id);
            tvPurpose = itemView.findViewById(R.id.tv_purpose);
            tvStatus = itemView.findViewById(R.id.tv_status);
            tvDate = itemView.findViewById(R.id.tv_date);
        }
    }
}
