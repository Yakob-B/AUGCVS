package com.augcvs.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.RecyclerView;

import com.augcvs.R;
import com.augcvs.models.Graduate;

import java.util.ArrayList;
import java.util.List;

public class GraduateAdapter extends RecyclerView.Adapter<GraduateAdapter.ViewHolder> {
    
    private List<Graduate> graduates;
    private Context context;
    private OnItemClickListener listener;
    private Graduate selectedGraduate;
    
    public interface OnItemClickListener {
        void onItemClick(Graduate graduate);
    }
    
    public GraduateAdapter(Context context, OnItemClickListener listener) {
        this.context = context;
        this.graduates = new ArrayList<>();
        this.listener = listener;
    }
    
    public void setGraduates(List<Graduate> graduates) {
        this.graduates = graduates;
        notifyDataSetChanged();
    }
    
    public void setSelectedGraduate(Graduate graduate) {
        this.selectedGraduate = graduate;
        notifyDataSetChanged();
    }
    
    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_graduate, parent, false);
        return new ViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Graduate graduate = graduates.get(position);
        
        holder.tvName.setText(graduate.getFullName());
        holder.tvStudentId.setText("ID: " + graduate.getStudentId());
        holder.tvProgram.setText(graduate.getProgram());
        holder.tvDepartment.setText(graduate.getDepartment());
        
        // Highlight selected graduate
        if (selectedGraduate != null && selectedGraduate.get_id().equals(graduate.get_id())) {
            holder.cardView.setCardBackgroundColor(context.getResources().getColor(R.color.purple_200));
        } else {
            holder.cardView.setCardBackgroundColor(context.getResources().getColor(R.color.white));
        }
        
        holder.cardView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onItemClick(graduate);
            }
        });
    }
    
    @Override
    public int getItemCount() {
        return graduates.size();
    }
    
    static class ViewHolder extends RecyclerView.ViewHolder {
        CardView cardView;
        TextView tvName;
        TextView tvStudentId;
        TextView tvProgram;
        TextView tvDepartment;
        
        ViewHolder(View itemView) {
            super(itemView);
            cardView = itemView.findViewById(R.id.card_view);
            tvName = itemView.findViewById(R.id.tv_name);
            tvStudentId = itemView.findViewById(R.id.tv_student_id);
            tvProgram = itemView.findViewById(R.id.tv_program);
            tvDepartment = itemView.findViewById(R.id.tv_department);
        }
    }
}
