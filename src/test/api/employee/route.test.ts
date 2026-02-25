import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as GET_ALL, POST } from '@/app/api/employee/route';
import { GET as GET_ONE, PUT, DELETE } from '@/app/api/employee/[id]/route';
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

describe('employee API', () => {
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

  it('GET /api/employee should return records', async () => {
    mockSupabase.select.mockResolvedValue({ data: [{ id: '123' }], error: null });
    // Specifically for users API which uses auth.admin
    mockSupabase.auth.admin.listUsers.mockResolvedValue({ data: { users: [{ id: '123' }] }, error: null });

    const req = createMockRequest('http://localhost:3000/api/employee');
    const response = await GET_ALL(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it('POST /api/employee should create record', async () => {
    mockSupabase.single.mockResolvedValue({ data: { id: '123' }, error: null });

    const req = createMockRequest('http://localhost:3000/api/employee', 'POST', { name: 'Test' });
    const response = await POST(req);
    const json = await response.json();

    // Profiles returns 201, typical CRUD returns 201.
    expect([200, 201]).toContain(response.status);
    expect(json.success).toBe(true);
  });

  it('GET /api/employee/[id] should return a single record', async () => {
    mockSupabase.single.mockResolvedValue({ data: { id: '123' }, error: null });
    mockSupabase.auth.admin.getUserById.mockResolvedValue({ data: { user: { id: '123' } }, error: null });

    const req = createMockRequest('http://localhost:3000/api/employee/123');
    const response = await GET_ONE(req, { params: Promise.resolve({ id: '123' }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it('PUT /api/employee/[id] should update record', async () => {
    mockSupabase.single.mockResolvedValue({ data: { id: '123' }, error: null });

    const req = createMockRequest('http://localhost:3000/api/employee/123', 'PUT', { name: 'Updated' });
    const response = await PUT(req, { params: Promise.resolve({ id: '123' }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it('DELETE /api/employee/[id] should delete record', async () => {
    mockSupabase.eq.mockResolvedValue({ error: null });

    const req = createMockRequest('http://localhost:3000/api/employee/123', 'DELETE');
    const response = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });
});
