package be.cytomine.repository.airunner;

import be.cytomine.domain.airunner.AIAlgorithmJob;
import be.cytomine.domain.airunner.AIRunner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AIAlgorithmJobRepository extends JpaRepository<AIAlgorithmJob, Long> {
    
    Optional<AIAlgorithmJob> findBySessionId(String sessionId);
    
    List<AIAlgorithmJob> findByAirunner(AIRunner airunner);
    
    List<AIAlgorithmJob> findByProjectId(Long projectId);
    
    List<AIAlgorithmJob> findByImageId(Long imageId);
}