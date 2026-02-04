package com.thrive.repo;

import com.thrive.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AssetRepo extends JpaRepository<Asset, Long> {
    Optional<Asset> findBySymbol(String symbol);
}
