package be.cytomine.domain.airunner;

import be.cytomine.domain.CytomineDomain;
import be.cytomine.utils.JsonObject;
import lombok.Getter;
import lombok.Setter;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Getter
@Setter
@Table(name = "ai_algorithm_job")
public class AIAlgorithmJob extends CytomineDomain {

    @Column(name = "session_id", nullable = false, unique = true)
    private String sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "airunner_id", nullable = false)
    private AIRunner airunner;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "image_id")
    private Long imageId;

    @Column(name = "parameters", columnDefinition = "text")
    private String parameters;

    @Column(name = "source", columnDefinition = "text")
    private String source;

    @Column(name = "image_server")
    private String imageServer;

    @Column(name = "status_code")
    private Integer statusCode;

    @Column(name = "status")
    private String status;

    @Column(name = "message", columnDefinition = "text")
    private String message;

    @Column(name = "data", columnDefinition = "text")
    private String data;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created", nullable = false)
    private Date created;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "updated")
    private Date updated;

    @PrePersist
    public void prePersist() {
        created = new Date();
        updated = new Date();
    }

    @PreUpdate
    public void preUpdate() {
        updated = new Date();
    }

    @Override
    public JsonObject toJsonObject() {
        JsonObject json = new JsonObject();
        json.put("id", getId());
        json.put("sessionId", getSessionId());
        json.put("airunnerId", getAirunner() != null ? getAirunner().getId() : null);
        json.put("projectId", getProjectId());
        json.put("imageId", getImageId());
        json.put("parameters", getParameters());
        json.put("source", getSource());
        json.put("imageServer", getImageServer());
        json.put("statusCode", getStatusCode());
        json.put("status", getStatus());
        json.put("message", getMessage());
        json.put("data", getData());
        json.put("created", getCreated());
        json.put("updated", getUpdated());
        return json;
    }
}