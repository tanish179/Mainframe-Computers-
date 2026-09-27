import { describe, expect, it } from 'vitest';
import {
  customerSchema,
  expenseSchema,
  paymentSchema,
  productSchema,
  saleSchema,
  serviceJobSchema,
} from '../src/schemas/index.js';

describe('Zod Validation Schemas', () => {
  it('validates a valid customer payload', () => {
    const valid = {
      name: 'Rahul Patil',
      phone: '9876543210',
      email: 'rahul@example.com',
      address: 'Shahupuri, Kolhapur',
    };
    expect(customerSchema.parse(valid)).toEqual({
      ...valid,
      status: 'active',
    });
  });

  it('rejects invalid customer phone number', () => {
    const invalid = {
      name: 'Short Phone',
      phone: '123',
    };
    expect(() => customerSchema.parse(invalid)).toThrow();
  });

  it('validates product creation payload', () => {
    const product = {
      name: 'Kingston 8GB DDR4 RAM',
      category: 'RAM',
      sku: 'RAM-KNG-8GB',
      brand: 'Kingston',
      model: 'KVR26N19S8/8',
      purchase_price: 1800,
      selling_price: 2400,
      stock_quantity: 15,
      minimum_stock_level: 3,
    };
    expect(productSchema.parse(product)).toEqual({
      ...product,
      status: 'active',
    });
  });

  it('rejects negative stock quantity', () => {
    const invalid = {
      name: 'Bad Stock Product',
      category: 'SSD',
      sku: 'SSD-BAD-01',
      brand: 'Samsung',
      model: '970 EV',
      purchase_price: 3000,
      selling_price: 4500,
      stock_quantity: -5,
    };
    expect(() => productSchema.parse(invalid)).toThrow();
  });

  it('validates service job payload', () => {
    const job = {
      customer_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      device_type: 'Laptop',
      device_brand: 'Dell',
      device_model: 'Inspiron 15',
      customer_problem: 'Display flickering and power port loose',
      estimated_cost: 2500,
      advance_paid: 500,
    };
    const parsed = serviceJobSchema.parse(job);
    expect(parsed.device_type).toBe('Laptop');
    expect(parsed.priority).toBe('normal');
  });

  it('validates sale creation with items', () => {
    const sale = {
      customer_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      items: [
        {
          product_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
          quantity: 2,
          unit_price: 1500,
        },
      ],
      discount: 100,
    };
    const parsed = saleSchema.parse(sale);
    expect(parsed.items.length).toBe(1);
  });

  it('validates expense creation', () => {
    const expense = {
      category: 'Internet',
      description: 'Fiber Broadband Monthly Bill',
      amount: 1199,
      payment_method: 'UPI',
    };
    const parsed = expenseSchema.parse(expense);
    expect(parsed.status).toBe('paid');
  });
});
