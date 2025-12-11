package be.cytomine.domain.airunner;

import be.cytomine.domain.CytomineDomain;
import be.cytomine.utils.JsonObject;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.Setter;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "ai_runner")
public class AIRunner extends CytomineDomain {

    @Column(name = "runner_name", nullable = false)
    private String runnerName;

    @Column(name = "name", unique = true)
    private String name;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "terms", columnDefinition = "text")
    private String terms;

    @Column(name = "supported_image_formats", columnDefinition = "text")
    private String supportedImageFormats;

    @Column(name = "supported_source_types", columnDefinition = "text")
    private String supportedSourceTypes;

    @Column(name = "supported_scopes", columnDefinition = "text")
    private String supportedScopes;

    @Column(name = "supported_algorithm_types", columnDefinition = "text")
    private String supportedAlgorithmTypes;

    @Column(name = "runner_address", nullable = false)
    private String runnerAddress;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created")
    private Date created;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "updated")
    private Date updated;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @PrePersist
    public void prePersist() {
        created = new Date();
        updated = new Date();
    }

    @PreUpdate
    public void preUpdate() {
        updated = new Date();
    }

    // 将List转换为JSON字符串存储
    public void setTermsList(List<String> termsList) {
        try {
            this.terms = objectMapper.writeValueAsString(termsList);
        } catch (JsonProcessingException e) {
            this.terms = "[]";
        }
    }

    // 将存储的JSON字符串转换为List
    public List<String> getTermsList() {
        try {
            return objectMapper.readValue(this.terms, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    // 将List转换为JSON字符串存储
    public void setSupportedImageFormatsList(List<String> supportedImageFormatsList) {
        try {
            this.supportedImageFormats = objectMapper.writeValueAsString(supportedImageFormatsList);
        } catch (JsonProcessingException e) {
            this.supportedImageFormats = "[]";
        }
    }

    // 将存储的JSON字符串转换为List
    public List<String> getSupportedImageFormatsList() {
        try {
            return objectMapper.readValue(this.supportedImageFormats, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    // 将List转换为JSON字符串存储
    public void setSupportedSourceTypesList(List<String> supportedSourceTypesList) {
        try {
            this.supportedSourceTypes = objectMapper.writeValueAsString(supportedSourceTypesList);
        } catch (JsonProcessingException e) {
            this.supportedSourceTypes = "[]";
        }
    }

    // 将存储的JSON字符串转换为List
    public List<String> getSupportedSourceTypesList() {
        try {
            return objectMapper.readValue(this.supportedSourceTypes, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    // 将List转换为JSON字符串存储
    public void setSupportedScopesList(List<String> supportedScopesList) {
        try {
            this.supportedScopes = objectMapper.writeValueAsString(supportedScopesList);
        } catch (JsonProcessingException e) {
            this.supportedScopes = "[]";
        }
    }

    // 将存储的JSON字符串转换为List
    public List<String> getSupportedScopesList() {
        try {
            return objectMapper.readValue(this.supportedScopes, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    // 将List转换为JSON字符串存储
    public void setSupportedAlgorithmTypesList(List<String> supportedAlgorithmTypesList) {
        try {
            this.supportedAlgorithmTypes = objectMapper.writeValueAsString(supportedAlgorithmTypesList);
        } catch (JsonProcessingException e) {
            this.supportedAlgorithmTypes = "[]";
        }
    }

    // 将存储的JSON字符串转换为List
    public List<String> getSupportedAlgorithmTypesList() {
        try {
            return objectMapper.readValue(this.supportedAlgorithmTypes, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    @Override
    public JsonObject toJsonObject() {
        JsonObject json = new JsonObject();
        json.put("id", getId());
        json.put("runnerName", getRunnerName());
        json.put("name", getName());
        json.put("description", getDescription());
        json.put("terms", getTermsList());
        json.put("supportedImageFormats", getSupportedImageFormatsList());
        json.put("supportedSourceTypes", getSupportedSourceTypesList());
        json.put("supportedScopes", getSupportedScopesList());
        json.put("supportedAlgorithmTypes", getSupportedAlgorithmTypesList());
        json.put("runnerAddress", getRunnerAddress());
        json.put("created", getCreated());
        json.put("updated", getUpdated());
        return json;
    }
    
    @Override
    public CytomineDomain buildDomainFromJson(JsonObject json, EntityManager entityManager) {
        AIRunner airunner = this;
        airunner.id = json.getJSONAttrLong("id", null);
        airunner.runnerName = json.getJSONAttrStr("runnerName", true);
        airunner.name = json.getJSONAttrStr("name", true);
        airunner.description = json.getJSONAttrStr("description", false);
        airunner.runnerAddress = json.getJSONAttrStr("runnerAddress", true);
        
        // Handle list fields if present in JSON
        if (json.containsKey("terms") && json.get("terms") instanceof List) {
            airunner.setTermsList((List<String>) json.get("terms"));
        }
        
        if (json.containsKey("supportedImageFormats") && json.get("supportedImageFormats") instanceof List) {
            airunner.setSupportedImageFormatsList((List<String>) json.get("supportedImageFormats"));
        }
        
        if (json.containsKey("supportedSourceTypes") && json.get("supportedSourceTypes") instanceof List) {
            airunner.setSupportedSourceTypesList((List<String>) json.get("supportedSourceTypes"));
        }
        
        if (json.containsKey("supportedScopes") && json.get("supportedScopes") instanceof List) {
            airunner.setSupportedScopesList((List<String>) json.get("supportedScopes"));
        }
        
        if (json.containsKey("supportedAlgorithmTypes") && json.get("supportedAlgorithmTypes") instanceof List) {
            airunner.setSupportedAlgorithmTypesList((List<String>) json.get("supportedAlgorithmTypes"));
        }
        
        airunner.created = json.getJSONAttrDate("created");
        airunner.updated = json.getJSONAttrDate("updated");
        return airunner;
    }
}