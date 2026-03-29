import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/operate_time/route';
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Mock Supabase
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

// Mock NextRequest json method
const createMockRequest = (url, method = 'GET', body = null) => {
  const req = new NextRequest(url, { method, body: body ? JSON.stringify(body) : undefined });
  if (body) req.json = vi.fn().mockResolvedValue(body);
  return req;
};

describe('operate_time API', () => {
  let mockSupabase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    };
    createAdminClient.mockResolvedValue(mockSupabase);
  });

  it('GET /api/operate_time should return the most recent record', async () => {
    mockSupabase.single.mockResolvedValue({ data: { operate_time_id: 1, open_time: '09:00', close_time: '20:00' }, error: null });

    const req = createMockRequest('http://localhost:3000/api/operate_time');
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.open_time).toBe('09:00');
  });

  it('GET /api/operate_time should handle no records found', async () => {
    mockSupabase.single.mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'No records found' } });

    const req = createMockRequest('http://localhost:3000/api/operate_time');
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toBe(null);
  });

  it('POST /api/operate_time should create record', async () => {
    mockSupabase.single.mockResolvedValue({ data: { operate_time_id: 2, open_time: '10:00', close_time: '21:00' }, error: null });

    const req = createMockRequest('http://localhost:3000/api/operate_time', 'POST', { open_time: '10:00', close_time: '21:00' });
    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.open_time).toBe('10:00');
  });
});
