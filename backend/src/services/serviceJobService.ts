import { supabaseAdmin } from '../config/supabase.js';
import {
  serviceJobPartSchema,
  serviceJobSchema,
  serviceJobStatusEnum,
  updateServiceJobSchema,
} from '../schemas/index.js';
import { ServiceJob, ServiceJobPart, ServiceJobStatus } from '../types/database.types.js';
import { logActivity } from './activityService.js';
import { recordInventoryTransaction } from './inventoryService.js';
import { getProductById } from './productService.js';

async function generateJobNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabaseAdmin
    .from('service_jobs')
    .select('id', { count: 'exact', head: true });

  const seq = (count || 0) + 1;
  return `MJ-${year}-${seq.toString().padStart(5, '0')}`;
}

export async function createServiceJob(
  input: unknown,
  userId?: string
): Promise<ServiceJob> {
  const validated = serviceJobSchema.parse(input);

  const jobNumber = await generateJobNumber();
  const finalCost = validated.final_cost || validated.estimated_cost || 0;
  const advancePaid = validated.advance_paid || 0;
  const remainingAmount = Math.max(0, finalCost - advancePaid);

  const { data, error } = await supabaseAdmin
    .from('service_jobs')
    .insert([
      {
        customer_id: validated.customer_id,
        job_number: jobNumber,
        device_type: validated.device_type,
        device_brand: validated.device_brand,
        device_model: validated.device_model,
        serial_number: validated.serial_number || null,
        customer_problem: validated.customer_problem,
        technician_notes: validated.technician_notes || null,
        diagnosis: validated.diagnosis || null,
        estimated_cost: validated.estimated_cost,
        final_cost: finalCost,
        advance_paid: advancePaid,
        remaining_amount: remainingAmount,
        status: 'received',
        priority: validated.priority,
        expected_date: validated.expected_date || null,
        assigned_to: validated.assigned_to || null,
        warranty_days: validated.warranty_days || 0,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(`Failed to create service job: ${error.message}`);

  await logActivity({
    user_id: userId,
    action: 'Service Job Created',
    entity_type: 'service_job',
    entity_id: data.id,
    metadata: {
      job_number: data.job_number,
      customer_id: data.customer_id,
      device: `${data.device_brand} ${data.device_model}`,
    },
  });

  return data as ServiceJob;
}

export async function getServiceJobById(id: string): Promise<ServiceJob | null> {
  const { data, error } = await supabaseAdmin
    .from('service_jobs')
    .select('*, customers(*), employees(*), service_job_parts(*, products(*))')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch service job: ${error.message}`);
  return data as ServiceJob | null;
}

export async function getServiceJobs(params?: {
  status?: ServiceJobStatus;
  customer_id?: string;
  device_type?: string;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<{ serviceJobs: ServiceJob[]; total: number }> {
  const limit = params?.limit || 50;
  const offset = params?.offset || 0;

  let query = supabaseAdmin
    .from('service_jobs')
    .select('*, customers(name, phone)', { count: 'exact' });

  if (params?.status) {
    query = query.eq('status', params.status);
  }

  if (params?.customer_id) {
    query = query.eq('customer_id', params.customer_id);
  }

  if (params?.device_type) {
    query = query.eq('device_type', params.device_type);
  }

  if (params?.query) {
    const q = `%${params.query}%`;
    query = query.or(`job_number.ilike.${q},device_brand.ilike.${q},device_model.ilike.${q},serial_number.ilike.${q}`);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to fetch service jobs: ${error.message}`);

  return {
    serviceJobs: (data as ServiceJob[]) || [],
    total: count || 0,
  };
}

export async function updateServiceJobStatus(
  jobId: string,
  status: ServiceJobStatus,
  technicianNotes?: string,
  finalCost?: number,
  userId?: string
): Promise<ServiceJob> {
  serviceJobStatusEnum.parse(status);

  const existing = await getServiceJobById(jobId);
  if (!existing) throw new Error(`Service job ${jobId} not found`);

  const updates: Record<string, unknown> = { status };

  if (technicianNotes !== undefined) {
    updates.technician_notes = technicianNotes;
  }

  if (finalCost !== undefined) {
    updates.final_cost = finalCost;
    updates.remaining_amount = Math.max(0, finalCost - existing.advance_paid);
  }

  if (status === 'ready' || status === 'delivered') {
    if (!existing.completed_date) {
      updates.completed_date = new Date().toISOString();
    }
  }

  if (status === 'delivered') {
    updates.delivered_date = new Date().toISOString();
    if (existing.warranty_days && existing.warranty_days > 0) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + existing.warranty_days);

      updates.warranty_start_date = startDate.toISOString().split('T')[0];
      updates.warranty_end_date = endDate.toISOString().split('T')[0];
    }
  }

  const { data, error } = await supabaseAdmin
    .from('service_jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update service job status: ${error.message}`);

  await logActivity({
    user_id: userId,
    action: 'Service Job Status Changed',
    entity_type: 'service_job',
    entity_id: jobId,
    metadata: {
      job_number: existing.job_number,
      previous_status: existing.status,
      new_status: status,
    },
  });

  return data as ServiceJob;
}

export async function addPartToServiceJob(
  input: {
    service_job_id: string;
    product_id: string;
    quantity: number;
    selling_price?: number;
  },
  userId?: string
): Promise<{ part: ServiceJobPart; serviceJob: ServiceJob }> {
  const validated = serviceJobPartSchema.parse(input);

  const job = await getServiceJobById(validated.service_job_id);
  if (!job) throw new Error(`Service job ${validated.service_job_id} not found`);

  const product = await getProductById(validated.product_id);
  if (!product) throw new Error(`Product ${validated.product_id} not found`);

  const unitSellingPrice = validated.selling_price ?? product.selling_price;
  const partTotalCost = unitSellingPrice * validated.quantity;

  // 1. Record inventory movement (reduces stock)
  await recordInventoryTransaction(
    {
      product_id: product.id,
      type: 'used_in_service',
      quantity: validated.quantity,
      reference_type: 'service_job',
      reference_id: job.id,
      notes: `Used in repair job ${job.job_number}`,
    },
    userId
  );

  // 2. Insert service job part
  const { data: part, error: partErr } = await supabaseAdmin
    .from('service_job_parts')
    .insert([
      {
        service_job_id: job.id,
        product_id: product.id,
        quantity: validated.quantity,
        unit_cost: product.purchase_price,
        selling_price: unitSellingPrice,
      },
    ])
    .select()
    .single();

  if (partErr) throw new Error(`Failed to add part to service job: ${partErr.message}`);

  // 3. Update Service Job final cost and remaining amount
  const newFinalCost = job.final_cost + partTotalCost;
  const newRemainingAmount = Math.max(0, newFinalCost - job.advance_paid);

  const { data: updatedJob, error: jobErr } = await supabaseAdmin
    .from('service_jobs')
    .update({
      final_cost: newFinalCost,
      remaining_amount: newRemainingAmount,
    })
    .eq('id', job.id)
    .select()
    .single();

  if (jobErr) throw new Error(`Failed to update service job cost: ${jobErr.message}`);

  return {
    part: part as ServiceJobPart,
    serviceJob: updatedJob as ServiceJob,
  };
}
