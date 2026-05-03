package com.rahimi.expensetracker.repository;

import com.rahimi.expensetracker.model.Budget;
import com.rahimi.expensetracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUser(User user);
    List<Budget> findByUserId(Long userId);
}
