import { api, ApiError } from '../api';
import { useAuthStore } from '../../store/auth.store';

// Helpers
function mockFetch(status: number, body: unknown, headers: Record<string, string> = {}) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
    headers: new Headers(headers),
  });
}

beforeEach(() => {
  useAuthStore.setState({ user: null, tokens: null, isAuthenticated: false, provider: null, isLoading: false });
});

describe('api.get — happy path', () => {
  it('returns parsed JSON on 200', async () => {
    mockFetch(200, { id: 'g1', name: 'Goa Trip' });
    const result = await api.get<{ id: string; name: string }>('/groups/g1');
    expect(result).toEqual({ id: 'g1', name: 'Goa Trip' });
  });

  it('sends Authorization header when access token exists', async () => {
    const { Storage } = await import('../../lib/storage');
    jest.spyOn(Storage, 'getSecure').mockResolvedValue('my.access.token');
    mockFetch(200, {});

    await api.get('/groups');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>)['Authorization']).toBe('Bearer my.access.token');
  });
});

describe('api.post — happy path', () => {
  it('serialises body as JSON', async () => {
    mockFetch(201, { id: 'e1' });
    await api.post('/expenses', { description: 'Dinner', totalAmount: 600 });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body as string)).toMatchObject({ description: 'Dinner', totalAmount: 600 });
  });
});

describe('api — error states', () => {
  it('throws ApiError with status code on non-2xx', async () => {
    mockFetch(404, { message: 'Group not found', code: 'NOT_FOUND' });
    await expect(api.get('/groups/missing')).rejects.toMatchObject({
      statusCode: 404,
      message: 'Group not found',
      code: 'NOT_FOUND',
    });
  });

  it('throws ApiError on 500 with fallback message', async () => {
    mockFetch(500, {});
    await expect(api.get('/groups')).rejects.toBeInstanceOf(ApiError);
  });

  it('returns undefined for 204 No Content', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: () => Promise.reject(new Error('no body')),
    });
    const result = await api.delete('/expenses/e1');
    expect(result).toBeUndefined();
  });

  it('attempts token refresh on 401 then retries', async () => {
    useAuthStore.setState({
      tokens: { accessToken: 'old', refreshToken: 'refresh.token', expiresAt: 0 },
      isAuthenticated: true,
      user: null,
      provider: null,
      isLoading: false,
    });

    // First call returns 401; refresh call returns new tokens; retry succeeds
    mockFetch(401, { message: 'Unauthorized' });
    mockFetch(200, { accessToken: 'new.token', refreshToken: 'new.refresh', expiresAt: Date.now() + 900000 });
    mockFetch(200, { id: 'g1' });

    const result = await api.get<{ id: string }>('/groups/g1');
    expect(result).toEqual({ id: 'g1' });
  });

  it('throws UNAUTHORIZED after failed token refresh', async () => {
    useAuthStore.setState({
      tokens: { accessToken: 'expired', refreshToken: 'also.expired', expiresAt: 0 },
      isAuthenticated: true,
      user: null,
      provider: null,
      isLoading: false,
    });

    mockFetch(401, { message: 'Unauthorized' });  // original request
    mockFetch(401, { message: 'Refresh failed' }); // refresh attempt

    await expect(api.get('/groups')).rejects.toMatchObject({ statusCode: 401, code: 'UNAUTHORIZED' });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
