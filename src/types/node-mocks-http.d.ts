declare module 'node-mocks-http' {
  export interface RequestOptions {
    method?: string;
    url?: string;
    originalUrl?: string;
    baseUrl?: string;
    path?: string;
    params?: Record<string, any>;
    session?: Record<string, any>;
    cookies?: Record<string, any>;
    signedCookies?: Record<string, any>;
    headers?: Record<string, any>;
    body?: any;
    query?: Record<string, any>;
    files?: Record<string, any>;
  }

  export interface ResponseOptions {
    locals?: Record<string, any>;
    statusCode?: number;
    statusMessage?: string;
    headers?: Record<string, any>;
  }

  export interface MockResponse {
    _isEndCalled(): boolean;
    _getHeaders(): Record<string, any>;
    _getData(): any;
    _getStatusCode(): number;
    _getStatusMessage(): string;
    _isJSON(): boolean;
    _isUTF8(): boolean;
    _isDataLengthValid(): boolean;
    _getRedirectUrl(): string;
    _getRenderView(): string;
    _getRenderData(): any;
  }

  export interface Mocks {
    req: any;
    res: any & MockResponse;
  }

  export function createMocks(reqOptions?: RequestOptions, resOptions?: ResponseOptions): Mocks;
} 