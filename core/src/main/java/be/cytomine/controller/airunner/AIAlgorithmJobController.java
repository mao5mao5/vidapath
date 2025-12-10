package be.cytomine.controller.airunner;

import be.cytomine.domain.airunner.AIAlgorithmJob;
import be.cytomine.domain.airunner.AIRunner;
import be.cytomine.exceptions.ObjectNotFoundException;
import be.cytomine.service.airunner.AIAlgorithmJobService;
import be.cytomine.service.airunner.AIRunnerService;
import be.cytomine.service.airunner.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AIAlgorithmJobController {

    private final AIAlgorithmJobService aiAlgorithmJobService;
    private final AIRunnerService airunnerService;

    /**
     * 获取所有AI算法任务列表
     * GET /api/ai-algorithm-jobs
     */
    @GetMapping("/ai-algorithm-jobs")
    public ResponseEntity<List<AIAlgorithmJob>> listAIAlgorithmJobs() {
        log.debug("Listing all AI algorithm jobs");
        
        List<AIAlgorithmJob> jobs = aiAlgorithmJobService.listAll();
        
        return ResponseEntity.ok(jobs);
    }

    /**
     * 获取特定AI算法任务信息
     * GET /api/ai-algorithm-jobs/{id}
     */
    @GetMapping("/ai-algorithm-jobs/{id}")
    public ResponseEntity<AIAlgorithmJob> getAIAlgorithmJob(@PathVariable Long id) {
        log.debug("Getting AI algorithm job with ID: {}", id);
        
        Optional<AIAlgorithmJob> job = aiAlgorithmJobService.findById(id);
        if (job.isPresent()) {
            return ResponseEntity.ok(job.get());
        } else {
            throw new ObjectNotFoundException("AI algorithm job not found with ID: " + id);
        }
    }

    /**
     * 运行AI算法
     * POST /api/run/algorithm
     */
    @PostMapping("/run/algorithm")
    public ResponseEntity<RunAlgorithmResponse> runAlgorithm(@RequestBody RunAlgorithmRequest request) {
        log.debug("Running AI algorithm with airunnerId: {}, projectId: {}, imageId: {}", 
                  request.getAirunnerId(), request.getProjectId(), request.getImageId());
        
        try {
            // 获取AI Runner信息
            AIRunner airunner = airunnerService.findById(request.getAirunnerId())
                    .orElseThrow(() -> new ObjectNotFoundException("AI Runner not found with ID: " + request.getAirunnerId()));
            
            // 调用服务执行算法
            RunAlgorithmResponse response = aiAlgorithmJobService.runAlgorithm(request, airunner);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (ObjectNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error running AI algorithm: ", e);
            throw new RuntimeException("Error running AI algorithm: " + e.getMessage());
        }
    }
}