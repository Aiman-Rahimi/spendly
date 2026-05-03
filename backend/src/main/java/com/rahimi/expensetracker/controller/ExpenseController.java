package com.rahimi.expensetracker.controller;

import com.rahimi.expensetracker.model.Budget;
import com.rahimi.expensetracker.model.Expense;
import com.rahimi.expensetracker.model.User;
import com.rahimi.expensetracker.repository.BudgetRepository;
import com.rahimi.expensetracker.repository.ExpenseRepository;
import com.rahimi.expensetracker.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/budgets/{budgetId}/expenses")
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    public ExpenseController(ExpenseRepository expenseRepository,
                             BudgetRepository budgetRepository,
                             UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
    }

    // GET /api/budgets/{budgetId}/expenses
    @GetMapping
    public ResponseEntity<?> getExpensesByBudget(
            @PathVariable Long budgetId,
            @RequestHeader(value = "email", required = false) String email) {

        Optional<Budget> budgetOpt = budgetRepository.findById(budgetId);
        if (budgetOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Budget not found"));
        }

        Budget budget = budgetOpt.get();

        if (email != null && !email.isEmpty()) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
            if (!budget.getUser().getId().equals(userOpt.get().getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Not your budget"));
            }
        }

        List<Expense> expenses = expenseRepository.findByBudgetId(budgetId);
        return ResponseEntity.ok(expenses);
    }

    // POST /api/budgets/{budgetId}/expenses
    @PostMapping
    public ResponseEntity<?> createExpense(
            @PathVariable Long budgetId,
            @RequestBody Expense expenseRequest,
            @RequestHeader(value = "email", required = false) String email) {

        Optional<Budget> budgetOpt = budgetRepository.findById(budgetId);
        if (budgetOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Budget not found"));
        }
        Budget budget = budgetOpt.get();

        User user = null;
        if (email != null && !email.isEmpty()) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
            user = userOpt.get();

            if (!budget.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Not your budget"));
            }
        }

        expenseRequest.setBudget(budget);
        if (user != null) expenseRequest.setUser(user);
        if (expenseRequest.getDate() == null) {
            expenseRequest.setDate(LocalDate.now());
        }

        Expense saved = expenseRepository.save(expenseRequest);
        return ResponseEntity.status(201).body(saved);
    }

    // PUT /api/budgets/{budgetId}/expenses/{expenseId}
    @PutMapping("/{expenseId}")
    public ResponseEntity<?> updateExpense(
            @PathVariable Long budgetId,
            @PathVariable Long expenseId,
            @RequestBody Expense expenseRequest,
            @RequestHeader(value = "email", required = false) String email) {

        Optional<Expense> expenseOpt = expenseRepository.findById(expenseId);
        if (expenseOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Expense not found"));
        }

        Expense expense = expenseOpt.get();
        if (expense.getBudget() == null || !expense.getBudget().getId().equals(budgetId)) {
            return ResponseEntity.status(404).body(Map.of("message", "Expense not found in this budget"));
        }

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

    // DELETE /api/budgets/{budgetId}/expenses/{expenseId}
    @DeleteMapping("/{expenseId}")
    public ResponseEntity<?> deleteExpense(
            @PathVariable Long budgetId,
            @PathVariable Long expenseId,
            @RequestHeader(value = "email", required = false) String email) {

        Optional<Expense> expenseOpt = expenseRepository.findById(expenseId);
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

        expenseRepository.delete(expense);
        return ResponseEntity.ok(Map.of("message", "Expense deleted successfully"));
    }
}
