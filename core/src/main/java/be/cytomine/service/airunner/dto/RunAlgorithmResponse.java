package be.cytomine.service.airunner.dto;

import lombok.Data;

@Data
public class RunAlgorithmResponse {
    private String sessionId;
    private Integer statusCode;
    private String status;
    private String message;
    private Long projectId;
    private Long imageId;
}