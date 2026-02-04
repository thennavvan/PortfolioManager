package com.thrive.repo;

import com.thrive.entity.PortfolioValueSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PortfolioValueSnapshotRepo extends JpaRepository<PortfolioValueSnapshot, Long> {
}
