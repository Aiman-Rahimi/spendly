package com.rahimi.expensetracker.controller;

import com.rahimi.expensetracker.model.Income;
import com.rahimi.expensetracker.model.User;
import com.rahimi.expensetracker.repository.IncomeRepository;
import com.rahimi.expensetracker.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/incomes")
public class IncomeController {

    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;

    public IncomeController(IncomeRepository incomeRepository, UserRepository userRepository) {
        this.incomeRepository = incomeRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<?> getIncomes(@RequestHeader(value = "email", required = false) String email) {
        Optional<User> userOpt = getUser(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
        List<Income> incomes = incomeRepository.findByUserEmail(email);
        return ResponseEntity.ok(incomes);
    }

    @PostMapping
    public ResponseEntity<?> createIncome(@RequestBody Income income, @RequestHeader(value = "email", required = false) String email) {
        Optional<User> userOpt = getUser(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
        income.setUser(userOpt.get());
        if (income.getReceivedDate() == null) income.setReceivedDate(LocalDate.now());
        if (income.getRecurring() == null) income.setRecurring(true);
        if (income.getType() == null || income.getType().isBlank()) income.setType("fixed");
        return ResponseEntity.status(HttpStatus.CREATED).body(incomeRepository.save(income));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateIncome(@PathVariable Long id, @RequestBody Income request, @RequestHeader(value = "email", required = false) String email) {
        Optional<User> userOpt = getUser(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
        Optional<Income> incomeOpt = incomeRepository.findById(id);
        if (incomeOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Income not found"));
        Income income = incomeOpt.get();
        if (!income.getUser().getId().equals(userOpt.get().getId())) return ResponseEntity.status(403).body(Map.of("message", "Not your income"));
        income.setName(request.getName());
        income.setAmount(request.getAmount());
        income.setType(request.getType());
        income.setRecurring(request.getRecurring());
        income.setReceivedDate(request.getReceivedDate() != null ? request.getReceivedDate() : LocalDate.now());
        return ResponseEntity.ok(incomeRepository.save(income));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIncome(@PathVariable Long id, @RequestHeader(value = "email", required = false) String email) {
        Optional<User> userOpt = getUser(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
        Optional<Income> incomeOpt = incomeRepository.findById(id);
        if (incomeOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Income not found"));
        if (!incomeOpt.get().getUser().getId().equals(userOpt.get().getId())) return ResponseEntity.status(403).body(Map.of("message", "Not your income"));
        incomeRepository.delete(incomeOpt.get());
        return ResponseEntity.ok(Map.of("message", "Income deleted"));
    }

    private Optional<User> getUser(String email) {
        if (email == null || email.isBlank()) return Optional.empty();
        return userRepository.findByEmail(email);
    }
}
