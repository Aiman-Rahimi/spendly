package com.rahimi.expensetracker.controller;

import com.rahimi.expensetracker.model.Budget;
import com.rahimi.expensetracker.model.User;
import com.rahimi.expensetracker.repository.BudgetRepository;
import com.rahimi.expensetracker.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    public BudgetController(BudgetRepository budgetRepository, UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
    }

    // GET /api/budgets?userId=1  (used by Dashboard)
    // GET /api/budgets            (used by Budgets page, reads email header)
    @GetMapping
    public ResponseEntity<?> getBudgets(
            @RequestParam(required = false) Long userId,
            @RequestHeader(value = "email", required = false) String email) {

        User user = null;

        if (userId != null) {
            Optional<User> opt = userRepository.findById(userId);
            if (opt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
            user = opt.get();
        } else if (email != null && !email.isEmpty()) {
            Optional<User> opt = userRepository.findByEmail(email);
            if (opt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
            user = opt.get();
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        }

        List<Budget> budgets = budgetRepository.findByUser(user);
        return ResponseEntity.ok(budgets);
    }

    // GET /api/budgets/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getBudgetById(
            @PathVariable Long id,
            @RequestHeader(value = "email", required = false) String email) {

        Optional<Budget> budgetOpt = budgetRepository.findById(id);
        if (budgetOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Budget not found"));

        Budget budget = budgetOpt.get();

        // Verify ownership if email is provided
        if (email != null && !email.isEmpty()) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
            if (!budget.getUser().getId().equals(userOpt.get().getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Not your budget"));
            }
        }

        return ResponseEntity.ok(budget);
    }

    // POST /api/budgets
    @PostMapping
    public ResponseEntity<?> createBudget(@RequestBody Map<String, Object> body) {
        // Support both userId (Long) and email-based auth
        User user = null;

        Object userIdObj = body.get("userId");
        if (userIdObj != null) {
            Long userId = Long.parseLong(userIdObj.toString());
            Optional<User> opt = userRepository.findById(userId);
            if (opt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
            user = opt.get();
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "userId is required"));
        }

        Budget budget = new Budget();
        budget.setName((String) body.get("name"));
        budget.setIcon((String) body.get("icon"));
        budget.setUser(user);

        Object amountObj = body.get("amount");
        if (amountObj != null) {
            budget.setAmount(Double.parseDouble(amountObj.toString()));
        }

        Object monthObj = body.get("month");
        if (monthObj != null) budget.setMonth(Integer.parseInt(monthObj.toString()));

        Object yearObj = body.get("year");
        if (yearObj != null) budget.setYear(Integer.parseInt(yearObj.toString()));

        Budget saved = budgetRepository.save(budget);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /api/budgets/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBudget(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "email", required = false) String email) {

        Optional<Budget> budgetOpt = budgetRepository.findById(id);
        if (budgetOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Budget not found"));

        Budget budget = budgetOpt.get();
        if (email != null && !email.isEmpty()) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
            if (!budget.getUser().getId().equals(userOpt.get().getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Not your budget"));
            }
        }

        if (body.containsKey("name")) budget.setName((String) body.get("name"));
        if (body.containsKey("icon")) budget.setIcon((String) body.get("icon"));
        if (body.containsKey("amount")) budget.setAmount(Double.parseDouble(body.get("amount").toString()));
        if (body.containsKey("month")) budget.setMonth(Integer.parseInt(body.get("month").toString()));
        if (body.containsKey("year")) budget.setYear(Integer.parseInt(body.get("year").toString()));

        return ResponseEntity.ok(budgetRepository.save(budget));
    }

    // DELETE /api/budgets/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(
            @PathVariable Long id,
            @RequestHeader(value = "email", required = false) String email) {

        Optional<Budget> budgetOpt = budgetRepository.findById(id);
        if (budgetOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Budget not found"));

        Budget budget = budgetOpt.get();

        if (email != null && !email.isEmpty()) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
            if (!budget.getUser().getId().equals(userOpt.get().getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Not your budget"));
            }
        }

        budgetRepository.delete(budget);
        return ResponseEntity.ok(Map.of("message", "Budget deleted successfully"));
    }
}
