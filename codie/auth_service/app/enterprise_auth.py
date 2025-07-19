import os
import jwt
import httpx
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

# OAuth2 Configuration
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class SSOConfig(BaseModel):
    provider: str  # "google", "github", "azure", "okta"
    client_id: str
    client_secret: str
    redirect_uri: str
    scopes: List[str]
    auth_url: str
    token_url: str
    userinfo_url: str

class EnterpriseUser(BaseModel):
    id: str
    email: str
    username: str
    full_name: str
    organization: str
    role: str
    permissions: List[str]
    sso_provider: Optional[str] = None
    last_login: datetime
    is_active: bool = True

class SSOUserInfo(BaseModel):
    sub: str
    email: str
    name: str
    picture: Optional[str] = None
    organization: Optional[str] = None

class EnterpriseAuthService:
    def __init__(self):
        self.sso_configs = self._load_sso_configs()
        self.jwt_secret = os.getenv("JWT_SECRET_KEY")
        self.jwt_algorithm = "HS256"
        
    def _load_sso_configs(self) -> Dict[str, SSOConfig]:
        """Load SSO configurations from environment variables"""
        configs = {}
        
        # Google OAuth2
        if os.getenv("GOOGLE_CLIENT_ID"):
            configs["google"] = SSOConfig(
                provider="google",
                client_id=os.getenv("GOOGLE_CLIENT_ID"),
                client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
                redirect_uri=os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/auth/callback/google"),
                scopes=["openid", "email", "profile"],
                auth_url="https://accounts.google.com/o/oauth2/v2/auth",
                token_url="https://oauth2.googleapis.com/token",
                userinfo_url="https://www.googleapis.com/oauth2/v2/userinfo"
            )
        
        # GitHub OAuth2
        if os.getenv("GITHUB_CLIENT_ID"):
            configs["github"] = SSOConfig(
                provider="github",
                client_id=os.getenv("GITHUB_CLIENT_ID"),
                client_secret=os.getenv("GITHUB_CLIENT_SECRET"),
                redirect_uri=os.getenv("GITHUB_REDIRECT_URI", "http://localhost:3000/auth/callback/github"),
                scopes=["read:user", "user:email"],
                auth_url="https://github.com/login/oauth/authorize",
                token_url="https://github.com/login/oauth/access_token",
                userinfo_url="https://api.github.com/user"
            )
        
        # Azure AD
        if os.getenv("AZURE_CLIENT_ID"):
            configs["azure"] = SSOConfig(
                provider="azure",
                client_id=os.getenv("AZURE_CLIENT_ID"),
                client_secret=os.getenv("AZURE_CLIENT_SECRET"),
                redirect_uri=os.getenv("AZURE_REDIRECT_URI", "http://localhost:3000/auth/callback/azure"),
                scopes=["openid", "profile", "email"],
                auth_url=f"https://login.microsoftonline.com/{os.getenv('AZURE_TENANT_ID')}/oauth2/v2.0/authorize",
                token_url=f"https://login.microsoftonline.com/{os.getenv('AZURE_TENANT_ID')}/oauth2/v2.0/token",
                userinfo_url="https://graph.microsoft.com/v1.0/me"
            )
        
        return configs
    
    def get_sso_auth_url(self, provider: str, state: str = None) -> str:
        """Generate SSO authorization URL"""
        if provider not in self.sso_configs:
            raise HTTPException(status_code=400, detail=f"SSO provider {provider} not configured")
        
        config = self.sso_configs[provider]
        params = {
            "client_id": config.client_id,
            "redirect_uri": config.redirect_uri,
            "scope": " ".join(config.scopes),
            "response_type": "code"
        }
        
        if state:
            params["state"] = state
            
        if provider == "azure":
            params["response_mode"] = "query"
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{config.auth_url}?{query_string}"
    
    async def exchange_code_for_token(self, provider: str, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        if provider not in self.sso_configs:
            raise HTTPException(status_code=400, detail=f"SSO provider {provider} not configured")
        
        config = self.sso_configs[provider]
        
        async with httpx.AsyncClient() as client:
            token_data = {
                "client_id": config.client_id,
                "client_secret": config.client_secret,
                "code": code,
                "redirect_uri": config.redirect_uri,
                "grant_type": "authorization_code"
            }
            
            headers = {"Accept": "application/json"}
            if provider == "github":
                headers["Accept"] = "application/vnd.github.v3+json"
            
            response = await client.post(config.token_url, data=token_data, headers=headers)
            
            if response.status_code != 200:
                logger.error(f"Token exchange failed for {provider}: {response.text}")
                raise HTTPException(status_code=400, detail="Failed to exchange code for token")
            
            return response.json()
    
    async def get_user_info(self, provider: str, access_token: str) -> SSOUserInfo:
        """Get user information from SSO provider"""
        if provider not in self.sso_configs:
            raise HTTPException(status_code=400, detail=f"SSO provider {provider} not configured")
        
        config = self.sso_configs[provider]
        
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {access_token}"}
            
            if provider == "github":
                headers["Accept"] = "application/vnd.github.v3+json"
            
            response = await client.get(config.userinfo_url, headers=headers)
            
            if response.status_code != 200:
                logger.error(f"User info fetch failed for {provider}: {response.text}")
                raise HTTPException(status_code=400, detail="Failed to fetch user information")
            
            user_data = response.json()
            
            # Map provider-specific fields to standard format
            if provider == "google":
                return SSOUserInfo(
                    sub=user_data.get("id"),
                    email=user_data.get("email"),
                    name=user_data.get("name"),
                    picture=user_data.get("picture")
                )
            elif provider == "github":
                return SSOUserInfo(
                    sub=str(user_data.get("id")),
                    email=user_data.get("email"),
                    name=user_data.get("name") or user_data.get("login"),
                    picture=user_data.get("avatar_url")
                )
            elif provider == "azure":
                return SSOUserInfo(
                    sub=user_data.get("id"),
                    email=user_data.get("userPrincipalName"),
                    name=user_data.get("displayName"),
                    organization=user_data.get("organization")
                )
    
    def create_enterprise_token(self, user: EnterpriseUser) -> str:
        """Create JWT token for enterprise user"""
        payload = {
            "sub": user.id,
            "email": user.email,
            "username": user.username,
            "organization": user.organization,
            "role": user.role,
            "permissions": user.permissions,
            "sso_provider": user.sso_provider,
            "exp": datetime.utcnow() + timedelta(hours=24),
            "iat": datetime.utcnow()
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
    
    def verify_enterprise_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode enterprise JWT token"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
    
    async def get_current_enterprise_user(self, token: str = Depends(oauth2_scheme)) -> EnterpriseUser:
        """Get current enterprise user from token"""
        payload = self.verify_enterprise_token(token)
        
        # In a real implementation, you would fetch user from database
        # For now, we'll create a mock user from token payload
        user = EnterpriseUser(
            id=payload.get("sub"),
            email=payload.get("email"),
            username=payload.get("username"),
            full_name=payload.get("name", ""),
            organization=payload.get("organization", ""),
            role=payload.get("role", "user"),
            permissions=payload.get("permissions", []),
            sso_provider=payload.get("sso_provider"),
            last_login=datetime.utcnow(),
            is_active=True
        )
        
        return user

# Enterprise permissions and roles
ENTERPRISE_ROLES = {
    "admin": {
        "permissions": [
            "read:all", "write:all", "delete:all", "manage:users", 
            "manage:projects", "manage:system", "view:analytics"
        ]
    },
    "manager": {
        "permissions": [
            "read:all", "write:projects", "manage:team", "view:analytics"
        ]
    },
    "developer": {
        "permissions": [
            "read:projects", "write:code", "view:analytics"
        ]
    },
    "viewer": {
        "permissions": [
            "read:projects", "view:analytics"
        ]
    }
}

def check_permission(required_permission: str):
    """Decorator to check user permissions"""
    def permission_checker(user: EnterpriseUser = Depends(EnterpriseAuthService().get_current_enterprise_user)):
        if required_permission not in user.permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{required_permission}' required"
            )
        return user
    return permission_checker

def require_role(required_role: str):
    """Decorator to check user role"""
    def role_checker(user: EnterpriseUser = Depends(EnterpriseAuthService().get_current_enterprise_user)):
        if user.role != required_role and user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{required_role}' required"
            )
        return user
    return role_checker 