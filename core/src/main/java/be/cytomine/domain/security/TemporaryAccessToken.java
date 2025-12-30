package be.cytomine.domain.security;

import be.cytomine.domain.CytomineDomain;
import be.cytomine.utils.JsonObject;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.Arrays;
import java.util.List;

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
    @Column(name = "project_ids", nullable = false, length = 1000)
    private String projectIds; // 存储逗号分隔的项目ID列表

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
        json.put("projectIds", token.getProjectIds());
        json.put("expiryDate", token.getExpiryDate().getTime());
        json.put("created", token.getCreated().getTime());
        return json;
    }

    public List<Long> getProjectIdList() {
        if (projectIds == null || projectIds.isEmpty()) {
            return List.of();
        }
        return Arrays.stream(projectIds.split(","))
                .map(String::trim)
                .map(Long::valueOf)
                .toList();
    }

    /**
     * 检查给定的项目ID是否在令牌允许的项目ID列表中
     */
    public boolean containsProjectId(Long projectId) {
        if (projectIds == null || projectIds.isEmpty() || projectId == null) {
            return false;
        }
        
        String[] ids = projectIds.split(",");
        for (String id : ids) {
            if (id.trim().equals(projectId.toString())) {
                return true;
            }
        }
        return false;
    }

    @Override
    public CytomineDomain buildDomainFromJson(JsonObject json, EntityManager entityManager) {
        super.buildDomainFromJson(json, entityManager);
        this.tokenKey = json.getJSONAttrStr("tokenKey");
        this.user = (User) json.getJSONAttrDomain(entityManager, "user", new User(), true);
        
        // 处理单个项目ID或项目ID列表
        Object projectIdObj = json.get("projectId");
        if (projectIdObj instanceof Long) {
            this.projectIds = projectIdObj.toString();
        } else if (projectIdObj instanceof String) {
            this.projectIds = (String) projectIdObj;
        } else if (projectIdObj instanceof List) {
            List<?> projectIdList = (List<?>) projectIdObj;
            this.projectIds = String.join(",", projectIdList.stream()
                    .map(Object::toString)
                    .toArray(String[]::new));
        }
        
        this.expiryDate = json.getJSONAttrDate("expiryDate");
        return this;
    }
    
    @Override
    public JsonObject toJsonObject() {
        return getDataFromDomain(this);
    }
}