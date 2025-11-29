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

public class GraduateListAdapter extends RecyclerView.Adapter<GraduateListAdapter.ViewHolder> {
    
    private List<Graduate> graduates;
    private Context context;
    private OnItemClickListener listener;
    
    public interface OnItemClickListener {
        void onItemClick(Graduate graduate);
    }
    
    public GraduateListAdapter(Context context, OnItemClickListener listener) {
        this.context = context;
        this.graduates = new ArrayList<>();
        this.listener = listener;
    }
    
    public void setGraduates(List<Graduate> graduates) {
        this.graduates = graduates;
        notifyDataSetChanged();
    }
    
    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_graduate_list, parent, false);
        return new ViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Graduate graduate = graduates.get(position);
        
        holder.tvName.setText(graduate.getFullName());
        holder.tvStudentId.setText("ID: " + graduate.getStudentId());
        holder.tvProgram.setText(graduate.getProgram());
        holder.tvDepartment.setText(graduate.getDepartment());
        
        if (graduate.getDegreeType() != null) {
            holder.tvDegree.setText(graduate.getDegreeType());
            holder.tvDegree.setVisibility(View.VISIBLE);
        } else {
            holder.tvDegree.setVisibility(View.GONE);
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
        TextView tvDegree;
        
        ViewHolder(View itemView) {
            super(itemView);
            cardView = itemView.findViewById(R.id.card_view);
            tvName = itemView.findViewById(R.id.tv_name);
            tvStudentId = itemView.findViewById(R.id.tv_student_id);
            tvProgram = itemView.findViewById(R.id.tv_program);
            tvDepartment = itemView.findViewById(R.id.tv_department);
            tvDegree = itemView.findViewById(R.id.tv_degree);
        }
    }
}
