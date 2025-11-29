package com.augcvs.models;

import java.util.List;

public class ApiResponse<T> {
    private boolean success;
    private T data;
    private List<T> results;
    private String message;
    private int count;
    private Pagination pagination;
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public T getData() {
        return data;
    }
    
    public void setData(T data) {
        this.data = data;
    }
    
    public List<T> getResults() {
        return results;
    }
    
    public void setResults(List<T> results) {
        this.results = results;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public int getCount() {
        return count;
    }
    
    public void setCount(int count) {
        this.count = count;
    }
    
    public Pagination getPagination() {
        return pagination;
    }
    
    public void setPagination(Pagination pagination) {
        this.pagination = pagination;
    }
    
    public static class Pagination {
        private int page;
        private int limit;
        private int totalPages;
        private int totalResults;
        
        // Getters and Setters
        public int getPage() {
            return page;
        }
        
        public void setPage(int page) {
            this.page = page;
        }
        
        public int getLimit() {
            return limit;
        }
        
        public void setLimit(int limit) {
            this.limit = limit;
        }
        
        public int getTotalPages() {
            return totalPages;
        }
        
        public void setTotalPages(int totalPages) {
            this.totalPages = totalPages;
        }
        
        public int getTotalResults() {
            return totalResults;
        }
        
        public void setTotalResults(int totalResults) {
            this.totalResults = totalResults;
        }
    }
}
