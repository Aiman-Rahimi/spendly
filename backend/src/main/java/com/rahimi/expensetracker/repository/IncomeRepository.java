package com.rahimi.expensetracker.repository;

import com.rahimi.expensetracker.model.Income;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findByUserEmail(String email);
}
