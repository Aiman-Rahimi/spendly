package com.rahimi.expensetracker.controller;

import com.rahimi.expensetracker.model.Expense;
import com.rahimi.expensetracker.model.User;
import com.rahimi.expensetracker.repository.ExpenseRepository;
import com.rahimi.expensetracker.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseManagementController {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseManagementController(ExpenseRepository expenseRepository,
                                       UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    // GET /api/expenses  — returns all expenses for the authenticated user
    @GetMapping
    public ResponseEntity<?> getUserExpenses(
            @RequestHeader(value = "email", required = false) String email) {

        if (email == null || email.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Email header required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "User not found"));
        }

        List<Expense> expenses = expenseRepository.findByUserEmail(email);
        return ResponseEntity.ok(expenses);
    }

    // PUT /api/expenses/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateExpense(
            @PathVariable Long id,
            @RequestBody Expense expenseRequest,
            @RequestHeader(value = "email", required = false) String email) {

        Optional<Expense> expenseOpt = expenseRepository.findById(id);
        if (expenseOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Expense not found"));
        }

        Expense expense = expenseOpt.get();
        if (email != null && !email.isEmpty()) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
            if (expense.getUser() != null && !expense.getUser().getId().equals(userOpt.get().getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Not your expense"));
            }
        }

        expense.setDescription(expenseRequest.getDescription());
        expense.setAmount(expenseRequest.getAmount());
        expense.setDate(expenseRequest.getDate() != null ? expenseRequest.getDate() : LocalDate.now());

        return ResponseEntity.ok(expenseRepository.save(expense));
    }

    // DELETE /api/expenses/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(
            @PathVariable Long id,
            @RequestHeader(value = "email", required = false) String email) {

        Optional<Expense> expenseOpt = expenseRepository.findById(id);
        if (expenseOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Expense not found"));
        }

        Expense expense = expenseOpt.get();

        if (email != null && !email.isEmpty()) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
            if (expense.getUser() != null && !expense.getUser().getId().equals(userOpt.get().getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Not your expense"));
            }
        }

        expenseRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Expense deleted"));
    }
}
