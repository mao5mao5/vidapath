package be.cytomine.service.airunner;

import be.cytomine.domain.airunner.AIRunner;
import be.cytomine.domain.CytomineDomain;
import be.cytomine.domain.command.AddCommand;
import be.cytomine.domain.command.DeleteCommand;
import be.cytomine.domain.command.Transaction;
import be.cytomine.domain.security.User;
import be.cytomine.exceptions.ObjectNotFoundException;
import be.cytomine.repository.airunner.AIRunnerRepository;
import be.cytomine.service.CurrentUserService;
import be.cytomine.service.ModelService;
import be.cytomine.service.airunner.dto.AIRunnerInfoResponse;
import be.cytomine.service.security.SecurityACLService;
import be.cytomine.utils.CommandResponse;
import be.cytomine.utils.JsonObject;
import be.cytomine.utils.Task;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.transaction.Transactional;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class AIRunnerService extends ModelService {

    @Autowired
    private CurrentUserService currentUserService;
    private final AIRunnerRepository airunnerRepository;

    @Override
    public Class currentDomain() {
        return AIRunner.class;
    }

    @Override
    public CytomineDomain createFromJSON(JsonObject json) {
        return new AIRunner().buildDomainFromJson(json, getEntityManager());
    }

    @Override
    public CommandResponse add(JsonObject jsonObject) {
        User currentUser = currentUserService.getCurrentUser();
        return executeCommand(new AddCommand(currentUser), null, jsonObject);
    }

    @Override
    public List<Object> getStringParamsI18n(CytomineDomain domain) {
        AIRunner airunner = (AIRunner) domain;
        return List.of(airunner.getId() != null ? airunner.getId().toString() : "null", airunner.getName());
    }

    public Optional<AIRunner> findById(Long id) {
        return airunnerRepository.findById(id);
    }

    public Optional<AIRunner> findByName(String name) {
        return airunnerRepository.findByName(name);
    }

    public List<AIRunner> listAll() {
        return airunnerRepository.findAll();
    }

    public boolean existsByName(String name) {
        return airunnerRepository.existsByName(name);
    }

    /**
     * Delete an AI Runner
     * @param id The ID of the AI Runner to delete
     */
    public CommandResponse delete(Long id) {
        Optional<AIRunner> airunnerOpt = airunnerRepository.findById(id);
        if (airunnerOpt.isPresent()) {
            User currentUser = currentUserService.getCurrentUser();
            JsonObject json = airunnerOpt.get().toJsonObject();
            return executeCommand(new DeleteCommand(currentUser, null), airunnerOpt.get(), json);
        } else {
            throw new ObjectNotFoundException("AI Runner not found with ID: " + id);
        }
    }

    /**
     * 从第三方runner获取信息并更新AIRunner记录
     * @param id AIRunner ID
     * @return 更新后的AIRunner对象
     */
    public AIRunner fetchRunnerInfo(Long id) {
        Optional<AIRunner> airunnerOpt = airunnerRepository.findById(id);
        if (!airunnerOpt.isPresent()) {
            throw new ObjectNotFoundException("AI Runner not found with ID: " + id);
        }

        AIRunner airunner = airunnerOpt.get();
        String runnerAddress = airunner.getRunnerAddress();
        
        try {
            // 构造请求URL
            String infoUrl = runnerAddress;
            if (!infoUrl.endsWith("/")) {
                infoUrl += "/";
            }
            infoUrl += "get/info";

            log.info("Fetching AI Runner info from: {}", infoUrl);

            // 发送GET请求获取runner信息
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<AIRunnerInfoResponse> response = restTemplate.exchange(
                    infoUrl,
                    HttpMethod.GET,
                    null,
                    AIRunnerInfoResponse.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                AIRunnerInfoResponse info = response.getBody();
                
                // 更新AIRunner对象
                airunner.setName(info.getName());
                airunner.setDescription(info.getDescription());
                airunner.setTermsList(info.getTerms());
                airunner.setSupportedImageFormatsList(info.getSupportedImageFormats());
                airunner.setSupportedSourceTypesList(info.getSupportedSourceTypes());
                airunner.setSupportedScopesList(info.getSupportedScopes());
                airunner.setSupportedAlgorithmTypesList(info.getSupportedAlgorithmTypes());
                airunner.setUpdated(new Date());

                // 保存更新后的对象
                return airunnerRepository.save(airunner);
            } else {
                throw new RuntimeException("Failed to fetch AI Runner info, status code: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Error fetching AI Runner info for ID: " + id, e);
            throw new RuntimeException("Error fetching AI Runner info: " + e.getMessage(), e);
        }
    }
}