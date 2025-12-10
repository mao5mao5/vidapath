package be.cytomine.service.airunner;

import be.cytomine.domain.airunner.AIAlgorithmJob;
import be.cytomine.domain.airunner.AIRunner;
import be.cytomine.domain.CytomineDomain;
import be.cytomine.exceptions.ObjectNotFoundException;
import be.cytomine.repository.airunner.AIAlgorithmJobRepository;
import be.cytomine.service.ModelService;
import be.cytomine.service.airunner.dto.*;
import be.cytomine.utils.JsonObject;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.transaction.Transactional;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class AIAlgorithmJobService extends ModelService {

    private final AIAlgorithmJobRepository aiAlgorithmJobRepository;
    private final AIRunnerService airunnerService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Class currentDomain() {
        return AIAlgorithmJob.class;
    }

    @Override
    public CytomineDomain createFromJSON(JsonObject json) {
        return new AIAlgorithmJob().buildDomainFromJson(json, getEntityManager());
    }

    /**
     * 创建一个新的AI算法任务
     * @param airunnerId AI Runner ID
     * @param projectId 项目ID (可选)
     * @param imageId 图像ID (可选)
     * @param parameters 参数列表
     * @param source 图像或文件夹路径
     * @param imageServer 图像服务器地址
     * @return 创建的任务对象
     */
    public AIAlgorithmJob createJob(Long airunnerId, Long projectId, Long imageId, 
                                   String parameters, String source, String imageServer) {
        // 获取AI Runner信息
        Optional<AIRunner> airunnerOpt = airunnerService.findById(airunnerId);
        if (!airunnerOpt.isPresent()) {
            throw new ObjectNotFoundException("AI Runner not found with ID: " + airunnerId);
        }
        
        // 创建任务对象
        AIAlgorithmJob job = new AIAlgorithmJob();
        job.setSessionId(UUID.randomUUID().toString());
        job.setAirunner(airunnerOpt.get());
        job.setProjectId(projectId);
        job.setImageId(imageId);
        job.setParameters(parameters);
        job.setSource(source);
        job.setImageServer(imageServer);
        job.setCreated(new Date());
        job.setUpdated(new Date());
        
        // 保存到数据库
        return aiAlgorithmJobRepository.save(job);
    }

    /**
     * 更新任务状态
     * @param job 任务对象
     * @param statusCode 状态码
     * @param status 状态
     * @param message 消息
     * @return 更新后的任务对象
     */
    public AIAlgorithmJob updateJobStatus(AIAlgorithmJob job, Integer statusCode, String status, String message) {
        job.setStatusCode(statusCode);
        job.setStatus(status);
        job.setMessage(message);
        job.setUpdated(new Date());
        
        return aiAlgorithmJobRepository.save(job);
    }

    /**
     * 更新任务的算法结果数据
     * @param job 任务对象
     * @param data 算法结果数据（JSON格式）
     * @return 更新后的任务对象
     */
    public AIAlgorithmJob updateJobData(AIAlgorithmJob job, String data) {
        job.setData(data);
        job.setUpdated(new Date());
        
        return aiAlgorithmJobRepository.save(job);
    }

    /**
     * 运行AI算法
     * @param request 运行算法请求
     * @param airunner AI Runner信息
     * @return 运行算法响应
     */
    public RunAlgorithmResponse runAlgorithm(RunAlgorithmRequest request, AIRunner airunner) {
        try {
            // 根据imageId或projectId获取source路径
            String sourcePath = getSourcePath(request.getImageId(), request.getProjectId());
            
            // 创建AI算法任务记录
            String parametersJson = objectMapper.writeValueAsString(request.getParameters());
            AIAlgorithmJob job = createJob(
                    request.getAirunnerId(),
                    request.getProjectId(),
                    request.getImageId(),
                    parametersJson,
                    sourcePath,
                    "..." // Image server URL placeholder
            );

            // 构造向AI Runner发送的请求
            RunAlgorithmToAIRunnerRequest runnerRequest = new RunAlgorithmToAIRunnerRequest();
            runnerRequest.setSession_id(job.getSessionId());
            runnerRequest.setParameters(request.getParameters());
            runnerRequest.setSource(sourcePath);
            runnerRequest.setImage_server("..."); // Image server URL placeholder

            // 发送POST请求到AI Runner
            String runnerUrl = airunner.getRunnerAddress();
            if (!runnerUrl.endsWith("/")) {
                runnerUrl += "/";
            }
            runnerUrl += "run/algorithm";

            log.info("Sending request to AI Runner at: {}", runnerUrl);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<RunAlgorithmToAIRunnerRequest> entity = new HttpEntity<>(runnerRequest, headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<RunAlgorithmResponse> responseEntity = restTemplate.postForEntity(
                    runnerUrl, 
                    entity, 
                    RunAlgorithmResponse.class
            );

            // 更新任务状态
            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
                RunAlgorithmResponse runnerResponse = responseEntity.getBody();
                updateJobStatus(
                        job,
                        runnerResponse.getStatusCode(),
                        runnerResponse.getStatus(),
                        runnerResponse.getMessage()
                );
                
                return runnerResponse;
            } else {
                // 处理错误响应
                updateJobStatus(
                        job,
                        responseEntity.getStatusCode().value(),
                        "Error",
                        "Failed to get response from AI Runner"
                );
                
                throw new RuntimeException("Failed to get response from AI Runner, status code: " + responseEntity.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Error running AI algorithm: ", e);
            throw new RuntimeException("Error running AI algorithm: " + e.getMessage(), e);
        }
    }

    /**
     * 根据imageId或projectId获取source路径
     * @param imageId 图像ID
     * @param projectId 项目ID
     * @return source路径
     */
    private String getSourcePath(Long imageId, Long projectId) {
        // 这里需要根据imageId或projectId获取实际的source路径
        // 目前返回占位符值
        if (imageId != null) {
            return "Image URI PATH for image ID: " + imageId;
        } else if (projectId != null) {
            return "NAS folder path for project ID: " + projectId;
        } else {
            return "Unknown source";
        }
    }

    public Optional<AIAlgorithmJob> findById(Long id) {
        return aiAlgorithmJobRepository.findById(id);
    }

    public Optional<AIAlgorithmJob> findBySessionId(String sessionId) {
        return aiAlgorithmJobRepository.findBySessionId(sessionId);
    }

    public List<AIAlgorithmJob> listAll() {
        return aiAlgorithmJobRepository.findAll();
    }

    public List<AIAlgorithmJob> listByAirunner(AIRunner airunner) {
        return aiAlgorithmJobRepository.findByAirunner(airunner);
    }

    public List<AIAlgorithmJob> listByProjectId(Long projectId) {
        return aiAlgorithmJobRepository.findByProjectId(projectId);
    }

    public List<AIAlgorithmJob> listByImageId(Long imageId) {
        return aiAlgorithmJobRepository.findByImageId(imageId);
    }
}