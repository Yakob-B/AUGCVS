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
import com.augcvs.models.User;

import java.util.ArrayList;
import java.util.List;

public class UserAdapter extends RecyclerView.Adapter<UserAdapter.ViewHolder> {
    
    private List<User> users;
    private Context context;
    private OnItemClickListener listener;
    
    public interface OnItemClickListener {
        void onItemClick(User user);
    }
    
    public UserAdapter(Context context, OnItemClickListener listener) {
        this.context = context;
        this.users = new ArrayList<>();
        this.listener = listener;
    }
    
    public void setUsers(List<User> users) {
        this.users = users;
        notifyDataSetChanged();
    }
    
    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_user, parent, false);
        return new ViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        User user = users.get(position);
        
        holder.tvName.setText(user.getFullName());
        holder.tvEmail.setText(user.getEmail());
        holder.tvRole.setText(user.getRole().toUpperCase());
        
        if (user.getOrganization() != null && !user.getOrganization().isEmpty()) {
            holder.tvOrganization.setText(user.getOrganization());
            holder.tvOrganization.setVisibility(View.VISIBLE);
        } else {
            holder.tvOrganization.setVisibility(View.GONE);
        }
        
        // Set role color
        int roleColor;
        switch (user.getRole()) {
            case "superadmin":
            case "admin":
                roleColor = context.getResources().getColor(R.color.purple_700);
                break;
            case "registrar":
                roleColor = context.getResources().getColor(R.color.teal_700);
                break;
            default:
                roleColor = context.getResources().getColor(android.R.color.darker_gray);
                break;
        }
        holder.tvRole.setTextColor(roleColor);
        
        holder.cardView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onItemClick(user);
            }
        });
    }
    
    @Override
    public int getItemCount() {
        return users.size();
    }
    
    static class ViewHolder extends RecyclerView.ViewHolder {
        CardView cardView;
        TextView tvName;
        TextView tvEmail;
        TextView tvRole;
        TextView tvOrganization;
        
        ViewHolder(View itemView) {
            super(itemView);
            cardView = itemView.findViewById(R.id.card_view);
            tvName = itemView.findViewById(R.id.tv_name);
            tvEmail = itemView.findViewById(R.id.tv_email);
            tvRole = itemView.findViewById(R.id.tv_role);
            tvOrganization = itemView.findViewById(R.id.tv_organization);
        }
    }
}
