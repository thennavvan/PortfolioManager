package com.thrive.repo;

import com.thrive.entity.PortfolioSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PortfolioSnapshotRepo extends JpaRepository<PortfolioSnapshot, Long> {
    List<PortfolioSnapshot> findBySnapshotDateBetweenOrderBySnapshotDateAsc(LocalDateTime start, LocalDateTime end);
    
    @Query(value = "SELECT * FROM portfolio_snapshots ORDER BY snapshot_date DESC LIMIT 1", nativeQuery = true)
    PortfolioSnapshot findLatestSnapshot();
}
