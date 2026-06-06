const normalizePath = (path: string): string =>
  path.startsWith('/') ? path : `/${path}`;

export const apiClient = {
  get: (path: string, options?: RequestInit) => 
    fetch(normalizePath(path), { ...options, method: 'GET' }),
    
  post: (path: string, body: unknown, options?: RequestInit) =>
    fetch(normalizePath(path), {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    }),
    
  put: (path: string, body: unknown, options?: RequestInit) =>
    fetch(normalizePath(path), {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    }),
    
  patch: (path: string, body: unknown, options?: RequestInit) =>
    fetch(normalizePath(path), {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    }),
    
  delete: (path: string, options?: RequestInit) =>
    fetch(normalizePath(path), { ...options, method: 'DELETE' }),
};

export const apiFetch = (path: string, options?: RequestInit): Promise<Response> => {
  return fetch(normalizePath(path), options);
};
