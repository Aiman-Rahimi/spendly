package com.rahimi.expensetracker.controller;

import com.rahimi.expensetracker.model.FixedExpense;
import com.rahimi.expensetracker.model.User;
import com.rahimi.expensetracker.repository.FixedExpenseRepository;
import com.rahimi.expensetracker.repository.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fixed-expenses")
public class FixedExpenseController {

    private final FixedExpenseRepository fixedExpenseRepository;
    private final UserRepository userRepository;

    public FixedExpenseController(FixedExpenseRepository fixedExpenseRepository, UserRepository userRepository) {
        this.fixedExpenseRepository = fixedExpenseRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<?> getFixedExpenses(@RequestHeader(value = "email", required = false) String email) {
        Optional<User> userOpt = getUser(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
        List<FixedExpense> items = fixedExpenseRepository.findByUserEmail(email);
        return ResponseEntity.ok(items);
    }

    @PostMapping
    public ResponseEntity<?> createFixedExpense(@RequestBody FixedExpense item, @RequestHeader(value = "email", required = false) String email) {
        Optional<User> userOpt = getUser(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
        item.setUser(userOpt.get());
        if (item.getRecurring() == null) item.setRecurring(true);
        return ResponseEntity.status(HttpStatus.CREATED).body(fixedExpenseRepository.save(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFixedExpense(@PathVariable Long id, @RequestBody FixedExpense request, @RequestHeader(value = "email", required = false) String email) {
        Optional<User> userOpt = getUser(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
        Optional<FixedExpense> itemOpt = fixedExpenseRepository.findById(id);
        if (itemOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Fixed expense not found"));
        FixedExpense item = itemOpt.get();
        if (!item.getUser().getId().equals(userOpt.get().getId())) return ResponseEntity.status(403).body(Map.of("message", "Not your fixed expense"));
        item.setName(request.getName());
        item.setAmount(request.getAmount());
        item.setCategory(request.getCategory());
        item.setDueDay(request.getDueDay());
        item.setRecurring(request.getRecurring());
        return ResponseEntity.ok(fixedExpenseRepository.save(item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFixedExpense(@PathVariable Long id, @RequestHeader(value = "email", required = false) String email) {
        Optional<User> userOpt = getUser(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
        Optional<FixedExpense> itemOpt = fixedExpenseRepository.findById(id);
        if (itemOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Fixed expense not found"));
        if (!itemOpt.get().getUser().getId().equals(userOpt.get().getId())) return ResponseEntity.status(403).body(Map.of("message", "Not your fixed expense"));
        fixedExpenseRepository.delete(itemOpt.get());
        return ResponseEntity.ok(Map.of("message", "Fixed expense deleted"));
    }

    private Optional<User> getUser(String email) {
        if (email == null || email.isBlank()) return Optional.empty();
        return userRepository.findByEmail(email);
    }
}
