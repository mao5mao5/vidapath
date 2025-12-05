package be.cytomine.repository.security;

import be.cytomine.domain.security.TemporaryAccessToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface TemporaryAccessTokenRepository extends JpaRepository<TemporaryAccessToken, Long> {
    
    @Query("SELECT t FROM TemporaryAccessToken t JOIN FETCH t.user WHERE t.tokenKey = ?1")
    Optional<TemporaryAccessToken> findByTokenKey(String tokenKey);
    
    @Query("SELECT t FROM TemporaryAccessToken t JOIN FETCH t.user WHERE t.tokenKey = ?1 AND t.projectId = ?2")
    Optional<TemporaryAccessToken> findByTokenKeyAndProjectId(String tokenKey, Long projectId);
    
    List<TemporaryAccessToken> findAllByProjectId(Long projectId);
    
    @Modifying
    @Query("DELETE FROM TemporaryAccessToken t WHERE t.expiryDate < ?1")
    int deleteByExpiryDateBefore(Date date);
}