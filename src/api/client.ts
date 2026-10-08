const API_BASE_URL = "/api/v1";

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

class ApiClient {
  private getAccessToken(): string | null {
    return localStorage.getItem("ccm_access_token");
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem("ccm_refresh_token");
  }

  setTokens(accessToken: string, refreshToken?: string) {
    localStorage.setItem("ccm_access_token", accessToken);
    if (refreshToken) {
      localStorage.setItem("ccm_refresh_token", refreshToken);
    }
  }

  clearTokens() {
    localStorage.removeItem("ccm_access_token");
    localStorage.removeItem("ccm_refresh_token");
    localStorage.removeItem("ccm_user");
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
    const token = this.getAccessToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If 401 Unauthorized, attempt refresh token rotation once
    if (response.status === 401 && this.getRefreshToken()) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${this.getAccessToken()}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      }
    }

    const json: ApiResponse<T> = await response.json().catch(() => ({
      success: false,
      error: { code: "NETWORK_ERROR", message: "Failed to parse response" },
    }));

    if (!response.ok || !json.success) {
      const errorMsg = json.error?.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      (err as any).code = json.error?.code || "API_ERROR";
      (err as any).status = response.status;
      (err as any).details = json.error?.details;
      throw err;
    }

    return json.data;
  }

  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (data.success && data.data?.accessToken) {
        this.setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }
    } catch {
      // Refresh failed
    }

    this.clearTokens();
    return false;
  }
}

export const apiClient = new ApiClient();
