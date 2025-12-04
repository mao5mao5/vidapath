package be.cytomine.controller.security;

import be.cytomine.controller.RestCytomineController;
import be.cytomine.domain.security.TemporaryAccessToken;
import be.cytomine.service.ModelService;
import be.cytomine.service.security.TemporaryAccessTokenService;
import be.cytomine.utils.JsonObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
public class RestTemporaryAccessTokenController extends RestCytomineController {

    private final TemporaryAccessTokenService temporaryAccessTokenService;

    // 移除@Override注解，因为父类方法的返回类型可能与子类实现不完全匹配
    public ModelService getModelService() {
        return temporaryAccessTokenService;
    }

    /**
     * 创建临时访问令牌
     */
    @PostMapping("/project/{projectId}/temporary_access_token.json")
    public ResponseEntity<String> add(
            @PathVariable Long projectId,
            @RequestBody JsonObject json
    ) {
        log.debug("REST request to save TemporaryAccessToken for project {}: {}", projectId, json);
        json.put("projectId", projectId);
        TemporaryAccessToken token = temporaryAccessTokenService.createToken(json);
        return responseSuccess(token);
    }

    /**
     * 删除临时访问令牌
     */
    @DeleteMapping("/temporary_access_token/{id}.json")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        log.debug("REST request to delete TemporaryAccessToken : {}", id);
        JsonObject json = JsonObject.of("id", id);
        TemporaryAccessToken token = (TemporaryAccessToken) temporaryAccessTokenService.retrieve(json);
        return responseSuccess(temporaryAccessTokenService.delete(token));
    }

    /**
     * 列出项目的所有临时访问令牌
     */
    @GetMapping("/project/{projectId}/temporary_access_token.json")
    public ResponseEntity<String> list(
            @PathVariable Long projectId
    ) {
        log.debug("REST request to list TemporaryAccessTokens for project {}", projectId);
        return responseSuccess(temporaryAccessTokenService.listByProject(projectId));
    }
}