package be.cytomine.service.airunner.dto;

import lombok.Data;
import java.util.List;

@Data
public class RunAlgorithmRequest {
    private Long airunnerId;
    private Long projectId;
    private Long imageId;
    private List<String> parameters;
}