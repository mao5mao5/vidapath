package be.cytomine.service.airunner.dto;

import lombok.Data;

@Data
public class AlgorithmResultRequest {
    private String session_id;
    private String status;
    private String data;
}