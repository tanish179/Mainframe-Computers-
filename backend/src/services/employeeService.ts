import { supabaseAdmin } from '../config/supabase.js';
import { employeeSchema } from '../schemas/index.js';
import { Employee } from '../types/database.types.js';
import { logActivity } from './activityService.js';

export async function createEmployee(input: unknown, userId?: string): Promise<Employee> {
  const validated = employeeSchema.parse(input);

  const { data, error } = await supabaseAdmin
    .from('employees')
    .insert([validated])
    .select()
    .single();

  if (error) throw new Error(`Failed to create employee: ${error.message}`);

  await logActivity({
    user_id: userId,
    action: 'Employee Created',
    entity_type: 'employee',
    entity_id: data.id,
    metadata: { name: data.name, role: data.role },
  });

  return data as Employee;
}

export async function getEmployees(status?: 'active' | 'inactive'): Promise<Employee[]> {
  let query = supabaseAdmin.from('employees').select('*');

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch employees: ${error.message}`);
  return (data as Employee[]) || [];
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const { data, error } = await supabaseAdmin
    .from('employees')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch employee: ${error.message}`);
  return data as Employee | null;
}
