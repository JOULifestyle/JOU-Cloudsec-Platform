// api.ts - API service to communicate with the backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Helper function to get headers with auth token
const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

// Helper to handle responses
const handleResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  let data: any = null;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized: Invalid or expired token. Please log in again.");
    } else if (response.status === 403) {
      throw new Error("Forbidden: You do not have permission to access this resource.");
    } else if (data?.error) {
      throw new Error(`Error: ${data.error}`);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  return data;
};

// ------------------ Dashboard ------------------ //
export const getDashboardStats = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

// ------------------ CSPM ------------------ //
export const scanCSPM = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/scan/cspm`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

export const scanCSPMMulti = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/scan/cspm-multi`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

// ------------------ CWPP ------------------ //
export const scanCWPP = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/scan/cwpp`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

// ------------------ Scan History ------------------ //
export const getScanHistory = async (token: string, scanType?: string) => {
  let url = `${API_BASE_URL}/results/history`;
  if (scanType) url += `?scan_type=${scanType}`;

  const response = await fetch(url, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

export const getUserScanHistory = async (token: string, scanType?: string) => {
  let url = `${API_BASE_URL}/results/history-multi`;
  if (scanType) url += `?scan_type=${scanType}`;

  const response = await fetch(url, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

// ------------------ AWS Account ------------------ //
export const storeAWSAccount = async (token: string, accountId: string, roleArn: string) => {
  const response = await fetch(`${API_BASE_URL}/aws-account`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ account_id: accountId, role_arn: roleArn }),
  });
  return handleResponse(response);
};

export const getAWSAccount = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/aws-account`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

// ------------------ Policy Violations ------------------ //
export const getPolicyViolations = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/policy/violations`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};
