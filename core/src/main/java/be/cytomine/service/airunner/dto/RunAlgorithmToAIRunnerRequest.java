package be.cytomine.service.airunner.dto;

import lombok.Data;
import java.util.List;

@Data
public class RunAlgorithmToAIRunnerRequest {
    private String session_id;
    private List<String> parameters;
    private String source;
    private String Image_server;
}