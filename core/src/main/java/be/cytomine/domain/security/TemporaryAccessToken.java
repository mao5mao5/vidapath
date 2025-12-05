package be.cytomine.domain.security;

import be.cytomine.domain.CytomineDomain;
import be.cytomine.utils.JsonObject;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter
@Setter
@Table(name = "temporary_access_token")
public class TemporaryAccessToken extends CytomineDomain {

    @NotNull
    @Column(name = "token_key", nullable = false)
    private String tokenKey;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @NotNull
    @Column(name = "expiry_date", nullable = false)
    private Date expiryDate;

    @Override
    public String toJSON() {
        return getDataFromDomain(this).toJsonString();
    }

    public static JsonObject getDataFromDomain(CytomineDomain domain) {
        TemporaryAccessToken token = (TemporaryAccessToken) domain;
        
        JsonObject json = new JsonObject();
        json.put("id", token.getId());
        json.put("tokenKey", token.getTokenKey());
        json.put("userId", token.getUser().getId());
        json.put("projectId", token.getProjectId());
        json.put("expiryDate", token.getExpiryDate().getTime());
        json.put("created", token.getCreated().getTime());
        return json;
    }

    @Override
    public CytomineDomain buildDomainFromJson(JsonObject json, EntityManager entityManager) {
        super.buildDomainFromJson(json, entityManager);
        this.tokenKey = json.getJSONAttrStr("tokenKey");
        this.user = (User) json.getJSONAttrDomain(entityManager, "user", new User(), true);
        this.projectId = json.getJSONAttrLong("projectId");
        this.expiryDate = json.getJSONAttrDate("expiryDate");
        return this;
    }
    
    @Override
    public JsonObject toJsonObject() {
        return getDataFromDomain(this);
    }
}