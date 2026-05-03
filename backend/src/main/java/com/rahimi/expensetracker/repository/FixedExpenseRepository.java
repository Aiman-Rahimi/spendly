package com.rahimi.expensetracker.repository;

import com.rahimi.expensetracker.model.FixedExpense;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FixedExpenseRepository extends JpaRepository<FixedExpense, Long> {
    List<FixedExpense> findByUserEmail(String email);
}
