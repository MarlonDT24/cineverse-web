package com.cineverse.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Integer id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
}
