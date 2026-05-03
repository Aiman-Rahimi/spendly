package com.rahimi.expensetracker.controller;

import com.rahimi.expensetracker.model.User;
import com.rahimi.expensetracker.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // GET /api/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "name", user.getName() != null ? user.getName() : "",
                    "email", user.getEmail()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/users/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody User updatedUser) {
        return userRepository.findById(id)
                .map(user -> {
                    if (updatedUser.getName() != null) user.setName(updatedUser.getName());
                    if (updatedUser.getEmail() != null) user.setEmail(updatedUser.getEmail());
                    User saved = userRepository.save(user);
                    return ResponseEntity.ok(Map.of(
                        "id", saved.getId(),
                        "name", saved.getName() != null ? saved.getName() : "",
                        "email", saved.getEmail()
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
