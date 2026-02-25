import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as GET_ALL, POST } from '@/app/api/users/route';
import { GET as GET_ONE, PUT, DELETE } from '@/app/api/users/[id]/route';
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

describe('users API', () => {
  let mockSupabase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      auth: {
        admin: {
          getUserById: vi.fn(),
          listUsers: vi.fn(),
        }
      }
    };
    createAdminClient.mockResolvedValue(mockSupabase);
  });

  it('GET /api/users should return records', async () => {
    mockSupabase.select.mockResolvedValue({ data: [{ id: '123' }], error: null });
    // Specifically for users API which uses auth.admin
    mockSupabase.auth.admin.listUsers.mockResolvedValue({ data: { users: [{ id: '123' }] }, error: null });

    const req = createMockRequest('http://localhost:3000/api/users');
    const response = await GET_ALL(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });

  

  it('GET /api/users/[id] should return a single record', async () => {
    mockSupabase.single.mockResolvedValue({ data: { id: '123' }, error: null });
    mockSupabase.auth.admin.getUserById.mockResolvedValue({ data: { user: { id: '123' } }, error: null });

    const req = createMockRequest('http://localhost:3000/api/users/123');
    const response = await GET_ONE(req, { params: Promise.resolve({ id: '123' }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });

  
});
