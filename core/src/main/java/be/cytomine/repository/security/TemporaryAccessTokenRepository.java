package be.cytomine.repository.security;

import be.cytomine.domain.security.TemporaryAccessToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface TemporaryAccessTokenRepository extends JpaRepository<TemporaryAccessToken, Long> {
    
    @Query("SELECT t FROM TemporaryAccessToken t JOIN FETCH t.user WHERE t.tokenKey = :tokenKey")
    Optional<TemporaryAccessToken> findByTokenKey(@Param("tokenKey") String tokenKey);
    
    @Query(value = "SELECT * FROM temporary_access_token t WHERE t.token_key = :tokenKey AND (',' || t.project_ids || ',') LIKE ('%,' || :projectId || ',%')", nativeQuery = true)
    Optional<TemporaryAccessToken> findByTokenKeyAndProjectId(@Param("tokenKey") String tokenKey, @Param("projectId") Long projectId);
    
    @Query(value = "SELECT * FROM temporary_access_token t WHERE (',' || t.project_ids || ',') LIKE ('%,' || :projectId || ',%')", nativeQuery = true)
    List<TemporaryAccessToken> findAllByProjectId(@Param("projectId") Long projectId);
    
    @Modifying
    @Query("DELETE FROM TemporaryAccessToken t WHERE t.expiryDate < :date")
    int deleteByExpiryDateBefore(@Param("date") Date date);
}