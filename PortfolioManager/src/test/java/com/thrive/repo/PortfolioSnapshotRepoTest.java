package com.thrive.repo;

import com.thrive.entity.PortfolioSnapshot;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class PortfolioSnapshotRepoTest {

    @Autowired
    private PortfolioSnapshotRepo snapshotRepo;

    @Test
    void findBySnapshotDateBetweenOrderBySnapshotDateAsc_ShouldReturnAscending() {
        LocalDateTime t1 = LocalDateTime.of(2024, 1, 1, 10, 0);
        LocalDateTime t2 = LocalDateTime.of(2024, 1, 2, 10, 0);
        LocalDateTime t3 = LocalDateTime.of(2024, 1, 3, 10, 0);

        snapshotRepo.save(new PortfolioSnapshot(100.0, 80.0, t2));
        snapshotRepo.save(new PortfolioSnapshot(90.0, 70.0, t1));
        snapshotRepo.save(new PortfolioSnapshot(110.0, 85.0, t3));

        List<PortfolioSnapshot> results = snapshotRepo.findBySnapshotDateBetweenOrderBySnapshotDateAsc(
                t1.minusHours(1),
                t3.plusHours(1)
        );

        assertEquals(3, results.size());
        assertEquals(t1, results.get(0).getSnapshotDate());
        assertEquals(t2, results.get(1).getSnapshotDate());
        assertEquals(t3, results.get(2).getSnapshotDate());
    }

    @Test
    void findLatestSnapshot_ShouldReturnMostRecentByDate() {
        LocalDateTime t1 = LocalDateTime.of(2024, 1, 1, 10, 0);
        LocalDateTime t2 = LocalDateTime.of(2024, 1, 2, 10, 0);
        LocalDateTime t3 = LocalDateTime.of(2024, 1, 3, 10, 0);

        snapshotRepo.save(new PortfolioSnapshot(90.0, 70.0, t1));
        snapshotRepo.save(new PortfolioSnapshot(100.0, 80.0, t2));
        snapshotRepo.save(new PortfolioSnapshot(110.0, 85.0, t3));

        PortfolioSnapshot latest = snapshotRepo.findLatestSnapshot();

        assertNotNull(latest);
        assertEquals(t3, latest.getSnapshotDate());
        assertEquals(110.0, latest.getTotalValue());
    }
}
