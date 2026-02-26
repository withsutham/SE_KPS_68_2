import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as GET_ALL, POST } from '@/app/api/profiles/route';
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Mock Supabase
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

const createMockRequest = (url, method = 'GET', body = null) => {
  const req = new NextRequest(url, { method, body: body ? JSON.stringify(body) : undefined });
  if (body) req.json = vi.fn().mockResolvedValue(body);
  return req;
};

describe('profiles API', () => {
  let mockSupabase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    };
    createAdminClient.mockResolvedValue(mockSupabase);
  });

  it('GET /api/profiles should return records', async () => {
    mockSupabase.select.mockResolvedValue({ data: [{ id: '123' }], error: null });

    const req = createMockRequest('http://localhost:3000/api/profiles');
    const response = await GET_ALL(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it('POST /api/profiles should create record using profile_id and user_type', async () => {
    mockSupabase.single.mockResolvedValue({ data: { id: '123' }, error: null });

    const req = createMockRequest('http://localhost:3000/api/profiles', 'POST', { profile_id: '123', user_type: 'customer' });
    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
  });
});
