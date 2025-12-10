package be.cytomine.repository.airunner;

import be.cytomine.domain.airunner.AIRunner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AIRunnerRepository extends JpaRepository<AIRunner, Long>, JpaSpecificationExecutor<AIRunner> {
    Optional<AIRunner> findByName(String name);
    boolean existsByName(String name);
}