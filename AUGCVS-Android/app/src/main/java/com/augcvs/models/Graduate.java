package com.augcvs.models;

public class Graduate {
    private String _id;
    private String firstName;
    private String lastName;
    private String studentId;
    private String program;
    private String department;
    private String graduationDate;
    private String degreeType;
    
    // Constructors
    public Graduate() {}
    
    // Getters and Setters
    public String get_id() {
        return _id;
    }
    
    public void set_id(String _id) {
        this._id = _id;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getStudentId() {
        return studentId;
    }
    
    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }
    
    public String getProgram() {
        return program;
    }
    
    public void setProgram(String program) {
        this.program = program;
    }
    
    public String getDepartment() {
        return department;
    }
    
    public void setDepartment(String department) {
        this.department = department;
    }
    
    public String getGraduationDate() {
        return graduationDate;
    }
    
    public void setGraduationDate(String graduationDate) {
        this.graduationDate = graduationDate;
    }
    
    public String getDegreeType() {
        return degreeType;
    }
    
    public void setDegreeType(String degreeType) {
        this.degreeType = degreeType;
    }
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
