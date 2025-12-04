package be.cytomine.service.security;

import be.cytomine.domain.CytomineDomain;
import be.cytomine.domain.security.TemporaryAccessToken;
import be.cytomine.domain.security.User;
import be.cytomine.exceptions.ObjectNotFoundException;
import be.cytomine.repository.security.TemporaryAccessTokenRepository;
import be.cytomine.service.CurrentUserService;
import be.cytomine.service.ModelService;
import be.cytomine.service.security.SecurityACLService;
import be.cytomine.utils.CommandResponse;
import be.cytomine.utils.JsonObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TemporaryAccessTokenService extends ModelService {

    private final TemporaryAccessTokenRepository temporaryAccessTokenRepository;
    private final CurrentUserService currentUserService;
    private final SecurityACLService securityACLService;

    @Override
    public Class currentDomain() {
        return TemporaryAccessToken.class;
    }
    
    @Override
    public CytomineDomain createFromJSON(JsonObject json) {
        return new TemporaryAccessToken().buildDomainFromJson(json, getEntityManager());
    }

    public TemporaryAccessToken createToken(Long projectId, int hours) {
        User currentUser = currentUserService.getCurrentUser();
        
        TemporaryAccessToken token = new TemporaryAccessToken();
        token.setTokenKey(UUID.randomUUID().toString());
        token.setUser(currentUser);
        token.setProjectId(projectId);
        
        Date expiryDate = new Date(System.currentTimeMillis() + (hours * 60 * 60 * 1000L));
        token.setExpiryDate(expiryDate);
        
        saveDomain(token);
        return token;
    }

    public TemporaryAccessToken createToken(JsonObject json) {
        User currentUser = currentUserService.getCurrentUser();
        Integer expirationHours = json.getJSONAttrInteger("expirationHours", 24); // 默认24小时
        
        TemporaryAccessToken token = new TemporaryAccessToken();
        token.setTokenKey(UUID.randomUUID().toString());
        token.setUser(currentUser);
        token.setProjectId(json.getJSONAttrLong("projectId"));
        
        Date expiryDate = new Date(System.currentTimeMillis() + (expirationHours * 60 * 60 * 1000L));
        token.setExpiryDate(expiryDate);
        
        saveDomain(token);
        return token;
    }

    public Optional<TemporaryAccessToken> findByTokenKey(String tokenKey) {
        return temporaryAccessTokenRepository.findByTokenKey(tokenKey);
    }

    public Optional<TemporaryAccessToken> findByTokenKeyAndProjectId(String tokenKey, Long projectId) {
        return temporaryAccessTokenRepository.findByTokenKeyAndProjectId(tokenKey, projectId);
    }

    public boolean isValidToken(String tokenKey, Long projectId) {
        // 如果projectId为null，则认为令牌无效
        if (projectId == null) {
            return false;
        }
        
        Optional<TemporaryAccessToken> tokenOptional = findByTokenKeyAndProjectId(tokenKey, projectId);
        if (tokenOptional.isEmpty()) {
            return false;
        }
        
        TemporaryAccessToken token = tokenOptional.get();
        // 检查是否过期
        if (token.getExpiryDate().before(new Date())) {
            return false;
        }
        
        // 检查项目ID是否匹配
        return token.getProjectId().equals(projectId);
    }
    
    /**
     * 仅验证令牌本身的有效性（存在且未过期），不验证项目关联。
     *
     * @param tokenKey 令牌密钥
     * @return 令牌是否有效
     */
    public boolean isValidToken(String tokenKey) {
        Optional<TemporaryAccessToken> tokenOptional = findByTokenKey(tokenKey);
        if (tokenOptional.isEmpty()) {
            return false;
        }
        
        TemporaryAccessToken token = tokenOptional.get();
        // 检查是否过期
        return !token.getExpiryDate().before(new Date());
    }

    public List<TemporaryAccessToken> listByProject(Long projectId) {
        return temporaryAccessTokenRepository.findAllByProjectId(projectId);
    }

    public TemporaryAccessToken delete(TemporaryAccessToken token) {
        temporaryAccessTokenRepository.delete(token);
        return token;
    }
}