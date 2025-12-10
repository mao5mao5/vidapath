package be.cytomine.service.airunner.dto;

import lombok.Data;
import java.util.List;

@Data
public class AIRunnerInfoResponse {
    private String name;
    private String description;
    private List<String> terms;
    private List<String> supportedImageFormats;
    private List<String> supportedSourceTypes;
    private List<String> supportedScopes;
    private List<String> supportedAlgorithmTypes;
}