package com.augcvs.adapters;

import android.content.Context;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.augcvs.R;
import com.augcvs.models.Message;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class MessageAdapter extends RecyclerView.Adapter<MessageAdapter.ViewHolder> {
    
    private List<Message> messages;
    private Context context;
    private String currentUserId;
    
    public MessageAdapter(Context context, String currentUserId) {
        this.context = context;
        this.currentUserId = currentUserId;
        this.messages = new ArrayList<>();
    }
    
    public void setMessages(List<Message> messages) {
        this.messages = messages;
        notifyDataSetChanged();
    }
    
    public void addMessage(Message message) {
        messages.add(message);
        notifyItemInserted(messages.size() - 1);
    }
    
    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_message, parent, false);
        return new ViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Message message = messages.get(position);
        boolean isMyMessage = message.getSender().equals(currentUserId);
        
        holder.tvMessage.setText(message.getContent());
        holder.tvTime.setText(formatTime(message.getTimestamp()));
        
        // Set alignment and background based on sender
        LinearLayout.LayoutParams params = (LinearLayout.LayoutParams) holder.messageContainer.getLayoutParams();
        
        if (isMyMessage) {
            params.gravity = Gravity.END;
            holder.messageContainer.setBackgroundResource(R.drawable.message_sent_bg);
            holder.tvMessage.setTextColor(context.getResources().getColor(android.R.color.white));
        } else {
            params.gravity = Gravity.START;
            holder.messageContainer.setBackgroundResource(R.drawable.message_received_bg);
            holder.tvMessage.setTextColor(context.getResources().getColor(android.R.color.black));
        }
        
        holder.messageContainer.setLayoutParams(params);
    }
    
    @Override
    public int getItemCount() {
        return messages.size();
    }
    
    private String formatTime(String timestamp) {
        try {
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault());
            SimpleDateFormat outputFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());
            Date date = inputFormat.parse(timestamp);
            return outputFormat.format(date);
        } catch (Exception e) {
            return "";
        }
    }
    
    static class ViewHolder extends RecyclerView.ViewHolder {
        LinearLayout messageContainer;
        TextView tvMessage;
        TextView tvTime;
        
        ViewHolder(View itemView) {
            super(itemView);
            messageContainer = itemView.findViewById(R.id.message_container);
            tvMessage = itemView.findViewById(R.id.tv_message);
            tvTime = itemView.findViewById(R.id.tv_time);
        }
    }
}
