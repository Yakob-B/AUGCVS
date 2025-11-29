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
import com.augcvs.models.Conversation;
import com.augcvs.utils.TokenManager;

import java.util.ArrayList;
import java.util.List;

public class ConversationAdapter extends RecyclerView.Adapter<ConversationAdapter.ViewHolder> {
    
    private List<Conversation> conversations;
    private Context context;
    private OnItemClickListener listener;
    private String currentUserId;
    
    public interface OnItemClickListener {
        void onItemClick(Conversation conversation);
    }
    
    public ConversationAdapter(Context context, OnItemClickListener listener) {
        this.context = context;
        this.conversations = new ArrayList<>();
        this.listener = listener;
        this.currentUserId = TokenManager.getInstance(context).getUserId();
    }
    
    public void setConversations(List<Conversation> conversations) {
        this.conversations = conversations;
        notifyDataSetChanged();
    }
    
    public void markAsRead(String conversationId) {
        for (int i = 0; i < conversations.size(); i++) {
            if (conversations.get(i).get_id().equals(conversationId)) {
                conversations.get(i).setUnreadCount(0);
                notifyItemChanged(i);
                break;
            }
        }
    }
    
    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_conversation, parent, false);
        return new ViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Conversation conversation = conversations.get(position);
        
        holder.tvName.setText(conversation.getOtherParticipantName(currentUserId));
        
        if (conversation.getLastMessage() != null) {
            holder.tvLastMessage.setText(conversation.getLastMessage().getContent());
            holder.tvLastMessage.setVisibility(View.VISIBLE);
        } else {
            holder.tvLastMessage.setVisibility(View.GONE);
        }
        
        if (conversation.getUnreadCount() > 0) {
            holder.tvUnreadBadge.setText(String.valueOf(conversation.getUnreadCount()));
            holder.tvUnreadBadge.setVisibility(View.VISIBLE);
            holder.tvName.setTextColor(context.getResources().getColor(R.color.purple_700));
        } else {
            holder.tvUnreadBadge.setVisibility(View.GONE);
            holder.tvName.setTextColor(context.getResources().getColor(android.R.color.black));
        }
        
        holder.cardView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onItemClick(conversation);
            }
        });
    }
    
    @Override
    public int getItemCount() {
        return conversations.size();
    }
    
    static class ViewHolder extends RecyclerView.ViewHolder {
        CardView cardView;
        TextView tvName;
        TextView tvLastMessage;
        TextView tvUnreadBadge;
        
        ViewHolder(View itemView) {
            super(itemView);
            cardView = itemView.findViewById(R.id.card_view);
            tvName = itemView.findViewById(R.id.tv_name);
            tvLastMessage = itemView.findViewById(R.id.tv_last_message);
            tvUnreadBadge = itemView.findViewById(R.id.tv_unread_badge);
        }
    }
}
