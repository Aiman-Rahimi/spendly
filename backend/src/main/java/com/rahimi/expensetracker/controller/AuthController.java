package com.rahimi.expensetracker.controller;

import com.rahimi.expensetracker.dto.LoginRequest;
import com.rahimi.expensetracker.dto.RegisterRequest;
import com.rahimi.expensetracker.model.User;
import com.rahimi.expensetracker.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        try {
            if (req.getPassword() == null || req.getPassword().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
            }
            User saved = userService.registerFromRequest(req.getName(), req.getEmail(), req.getPassword());
            return ResponseEntity.status(201).body(Map.of(
                "id", saved.getId(),
                "name", saved.getName() != null ? saved.getName() : "",
                "email", saved.getEmail()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(Map.of("message", e.getMessage()));
        }
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password required"));
        }
        Optional<User> userOpt = userService.login(req.getEmail(), req.getPassword());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
        User user = userOpt.get();
        return ResponseEntity.ok(Map.of(
            "id",    user.getId(),
            "name",  user.getName() != null ? user.getName() : "",
            "email", user.getEmail()
        ));
    }

    // POST /api/auth/google
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String name  = body.get("name");
        String uid   = body.get("uid");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        Optional<User> existing = userService.findByEmail(email);
        User user;
        if (existing.isPresent()) {
            user = existing.get();
            boolean changed = false;
            if (user.getName() == null && name != null) { user.setName(name); changed = true; }
            if (user.getGoogleUid() == null && uid != null) { user.setGoogleUid(uid); changed = true; }
            if (changed) user = userService.save(user);
        } else {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setGoogleUid(uid);
            user = userService.save(newUser);
        }

        return ResponseEntity.ok(Map.of(
            "id",    user.getId(),
            "name",  user.getName() != null ? user.getName() : "",
            "email", user.getEmail()
        ));
    }
}
