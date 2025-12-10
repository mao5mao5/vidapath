package be.cytomine.controller.airunner;

import be.cytomine.domain.airunner.AIRunner;
import be.cytomine.exceptions.ObjectNotFoundException;
import be.cytomine.service.airunner.AIRunnerService;
import be.cytomine.utils.CommandResponse;
import be.cytomine.utils.JsonObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AIRunnerController {

    private final AIRunnerService airunnerService;

    /**
     * 创建新的AI Runner
     * POST /api/airunners
     */
    @PostMapping("/airunners")
    public ResponseEntity<Map<String, Object>> createAIRunner(@RequestBody JsonObject json) {
        log.debug("Creating new AI Runner: {}", json.get("name"));
        
        // 保存AI Runner
        CommandResponse response = airunnerService.add(json);
        
        return new ResponseEntity<>(response.getData(), HttpStatus.CREATED);
    }

    /**
     * 获取所有AI Runner列表
     * GET /api/airunners
     */
    @GetMapping("/airunners")
    public ResponseEntity<List<AIRunner>> listAIRunners() {
        log.debug("Listing all AI Runners");
        
        List<AIRunner> airunners = airunnerService.listAll();
        
        return ResponseEntity.ok(airunners);
    }

    /**
     * 获取特定AI Runner信息
     * GET /api/airunners/{id}
     */
    @GetMapping("/airunners/{id}")
    public ResponseEntity<AIRunner> getAIRunner(@PathVariable Long id) {
        log.debug("Getting AI Runner with ID: {}", id);
        
        Optional<AIRunner> airunner = airunnerService.findById(id);
        if (airunner.isPresent()) {
            return ResponseEntity.ok(airunner.get());
        } else {
            throw new ObjectNotFoundException("AI Runner not found with ID: " + id);
        }
    }

    /**
     * 更新AI Runner信息
     * PUT /api/airunners/{id}
     */
    @PutMapping("/airunners/{id}")
    public ResponseEntity<Map<String, Object>> updateAIRunner(@PathVariable Long id, @RequestBody JsonObject json) {
        log.debug("Updating AI Runner with ID: {}", id);
        
        Optional<AIRunner> existingAIRunner = airunnerService.findById(id);
        if (existingAIRunner.isPresent()) {
            json.put("id", id);
            CommandResponse response = airunnerService.edit(json, false);
            return ResponseEntity.ok(response.getData());
        } else {
            throw new ObjectNotFoundException("AI Runner not found with ID: " + id);
        }
    }

    /**
     * 删除AI Runner
     * DELETE /api/airunners/{id}
     */
    @DeleteMapping("/airunners/{id}")
    public ResponseEntity<Void> deleteAIRunner(@PathVariable Long id) {
        log.debug("Deleting AI Runner with ID: {}", id);
        
        Optional<AIRunner> airunner = airunnerService.findById(id);
        if (airunner.isPresent()) {
            JsonObject json = airunner.get().toJsonObject();
            airunnerService.destroy(json, false);
            return ResponseEntity.noContent().build();
        } else {
            throw new ObjectNotFoundException("AI Runner not found with ID: " + id);
        }
    }

    /**
     * 从第三方runner获取信息并更新AIRunner记录
     * POST /api/fetch/airunners/{id}
     */
    @PostMapping("/fetch/airunners/{id}")
    public ResponseEntity<AIRunner> fetchAIRunnerInfo(@PathVariable Long id) {
        log.debug("Fetching AI Runner info with ID: {}", id);
        
        try {
            AIRunner updatedAIRunner = airunnerService.fetchRunnerInfo(id);
            return ResponseEntity.ok(updatedAIRunner);
        } catch (ObjectNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching AI Runner info: ", e);
            throw new RuntimeException("Error fetching AI Runner info: " + e.getMessage());
        }
    }
}