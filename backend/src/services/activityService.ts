import { supabaseAdmin } from '../config/supabase.js';
import { ActivityLog, AIAuditLog } from '../types/database.types.js';

export async function logActivity(params: {
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<ActivityLog | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('activity_logs')
      .insert([
        {
          user_id: params.user_id || null,
          action: params.action,
          entity_type: params.entity_type,
          entity_id: params.entity_id || null,
          metadata: params.metadata || {},
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Failed to insert activity log:', error.message);
      return null;
    }
    return data as ActivityLog;
  } catch (err) {
    console.error('Activity logging error:', err);
    return null;
  }
}

export async function logAIAudit(params: {
  user_id?: string | null;
  tool_name: string;
  input_params?: Record<string, unknown> | null;
  output_summary?: string | null;
  status: 'success' | 'failed' | 'blocked';
}): Promise<AIAuditLog | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('ai_audit_logs')
      .insert([
        {
          user_id: params.user_id || null,
          tool_name: params.tool_name,
          input_params: params.input_params || {},
          output_summary: params.output_summary || null,
          status: params.status,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Failed to insert AI audit log:', error.message);
      return null;
    }
    return data as AIAuditLog;
  } catch (err) {
    console.error('AI audit logging error:', err);
    return null;
  }
}

export async function getActivityLogs(limit = 50, offset = 0): Promise<ActivityLog[]> {
  const { data, error } = await supabaseAdmin
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to fetch activity logs: ${error.message}`);
  return data as ActivityLog[];
}
