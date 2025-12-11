package be.cytomine.controller.airunner;

import be.cytomine.controller.RestCytomineController;
import be.cytomine.domain.airunner.AIRunner;
import be.cytomine.exceptions.ObjectNotFoundException;
import be.cytomine.service.airunner.AIRunnerService;
import be.cytomine.utils.CommandResponse;
import be.cytomine.utils.JsonObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AIRunnerController extends RestCytomineController {

    private final AIRunnerService airunnerService;

    /**
     * 创建新的AI Runner
     * POST /api/airunners.json
     */
    @PostMapping("/airunners.json")
    public ResponseEntity<String> createAIRunner(@RequestBody JsonObject json) {
        log.debug("Creating new AI Runner: {}", json.get("name"));
        return this.add(airunnerService, json);
    }

    /**
     * 获取所有AI Runner列表
     * GET /api/airunners
     */
    @GetMapping("/airunners.json")
    public ResponseEntity<String> listAIRunners() {
        log.debug("Listing all AI Runners");
        
        List<AIRunner> airunners = airunnerService.listAll();
        
        return responseSuccess(airunners);
    }

    /**
     * 获取特定AI Runner信息
     * GET /api/airunners/{id}
     */
    @GetMapping("/airunners/{id}.json")
    public ResponseEntity<String> getAIRunner(@PathVariable Long id) {
        log.debug("Getting AI Runner with ID: {}", id);
        
        Optional<AIRunner> airunner = airunnerService.findById(id);
        if (airunner.isPresent()) {
            return responseSuccess(airunner.get());
        } else {
            return responseNotFound("AI Runner", id);
        }
    }

    /**
     * 更新AI Runner信息
     * PUT /api/airunners/{id}
     */
    @PutMapping("/airunners/{id}.json")
    public ResponseEntity<String> updateAIRunner(@PathVariable Long id, @RequestBody JsonObject json) {
        log.debug("Updating AI Runner with ID: {}", id);
        
        return this.update(airunnerService, json);
    }

    /**
     * 删除AI Runner
     * DELETE /api/airunners/{id}
     */
    @DeleteMapping("/airunners/{id}.json")
    public ResponseEntity<String> deleteAIRunner(@PathVariable Long id) {
        log.debug("Deleting AI Runner with ID: {}", id);

        try {
            CommandResponse result = airunnerService.delete(id);
            return responseSuccess(result);
        } catch (ObjectNotFoundException e) {
            return responseNotFound("AI Runner", id);
        }
    }

    /**
     * 从第三方runner获取信息并更新AIRunner记录
     * POST /api/fetch/airunners/{id}
     */
    @PostMapping("/fetch/airunners/{id}.json")
    public ResponseEntity<String> fetchAIRunnerInfo(@PathVariable Long id) {
        log.debug("Fetching AI Runner info with ID: {}", id);
        
        try {
            AIRunner updatedAIRunner = airunnerService.fetchRunnerInfo(id);
            return responseSuccess(updatedAIRunner);
        } catch (ObjectNotFoundException e) {
            return responseNotFound("AI Runner", id);
        }
    }
}