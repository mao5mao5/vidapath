package be.cytomine.config.security;

import be.cytomine.domain.security.TemporaryAccessToken;
import be.cytomine.service.security.TemporaryAccessTokenService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Slf4j
public class TemporaryTokenFilter extends OncePerRequestFilter {

    private final TemporaryAccessTokenService temporaryAccessTokenService;

    public TemporaryTokenFilter(TemporaryAccessTokenService temporaryAccessTokenService) {
        this.temporaryAccessTokenService = temporaryAccessTokenService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // 首先检查是否已经有认证信息（如JWT认证）
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        // 从请求参数中获取临时访问令牌
        String accessToken = request.getParameter("access_token");
        if (accessToken == null || accessToken.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        // 验证临时访问令牌
        try {
            // 尝试从URI中提取项目ID
            Long projectId = extractProjectIdFromUri(request.getRequestURI());
            
            // 如果能从URI提取到项目ID，则验证特定项目的令牌
            if (projectId != null) {
                Optional<TemporaryAccessToken> tokenOpt = temporaryAccessTokenService.findByTokenKeyAndProjectId(accessToken, projectId);
                if (tokenOpt.isPresent() && temporaryAccessTokenService.isValidToken(accessToken, projectId)) {
                    // 创建临时认证对象
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            "temporary_user", 
                            null, 
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_TEMPORARY_USER"))
                    );
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("Temporary access token validated for project {}", projectId);
                }
            } else {
                // 如果无法从URI提取项目ID，则验证令牌是否存在且有效（不绑定特定项目）
                if (temporaryAccessTokenService.isValidToken(accessToken)) {
                    // 创建临时认证对象
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            "temporary_user", 
                            null, 
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_TEMPORARY_USER"))
                    );
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("Temporary access token validated without project binding");
                }
            }
        } catch (Exception e) {
            log.warn("Invalid temporary access token: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private Long extractProjectIdFromUri(String uri) {
        // 从URI中提取项目ID，支持多种路径格式：
        // 1. 前端路径: /project/103587/image/103600
        // 2. 后端API路径: /api/project/103587/imageinstance/103600.json
        try {
            String path = uri;
            if (path.startsWith("api/project/")) {
                String[] parts = path.substring("api/project/".length()).split("/");
                if (parts.length > 0) {
                    return Long.parseLong(parts[0]);
                }
            }
            else if (uri.startsWith("/api/")) {
                path = uri.substring("/api".length());
            }
            
            
        } catch (NumberFormatException e) {
            log.debug("Cannot extract project ID from URI: {}", uri);
        }
        return null;
    }
}