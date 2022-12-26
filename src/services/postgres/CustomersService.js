const { Pool } = require('pg');
const { db, queryMYSQL } = require('./../../connection/connection')
const uuid = require('uuid-random');
const NotFoundError = require('../../exceptions/NotFoundError');
const { validateUuid } = require('../../utils');

class CustomersService {
  constructor() {
    this._pool = new Pool();
  }

  async getCustomers(companyId, { page = 1, limit = 10, q = null }) {
    var recQuery = {
      text: `
        SELECT count(id) as total 
        FROM customers 
        WHERE 
          company_id = ? 
          ${q ? `AND (name LIKE '%${q}%' OR phone LIKE '%${q}%')` : ''}
      `, 
      values: [companyId]
    }
    const recordsQuery = await queryMYSQL(recQuery);
    const { total } = recordsQuery[0];

    const totalPages = Math.ceil(total / limit);
    const offsets = limit * (page - 1);

    const query = {
      text: `
        SELECT id, name, phone, description 
        FROM customers 
        WHERE company_id = ?
        ${q ? `AND (name LIKE '%${q}%' OR phone LIKE '%${q}%')` : ''}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
      values: [companyId, limit, offsets],
    };

    const rows  = await queryMYSQL(query);

    return {
      customers: rows,
      meta: {
        totalPages,
        total,
        page,
      },
    };
  }

  async getCustomerById(customerId) {
    validateUuid(customerId);

    const query = {
      text: 'SELECT name, phone, address, description FROM customers WHERE id = ?',
      values: [customerId],
    };

    const results = await queryMYSQL(query);

    if (results.length < 1) {
      throw new NotFoundError('Customer tidak ditemukan');
    }

    return results[0];
  }

  async addCustomer({
    name, phone, address, description, companyId,
  }) {
    const id = uuid();
    const query = {
      text: 'INSERT INTO customers(id, name, phone, address, description, company_id) VALUES (?, ?, ?, ?, ?, ?)',
      values: [id, name, phone, address, description, companyId],
    };

    await db.query(query.text, query.values);

    return id;
  }

  async updateCustomerById(customerId, {
    name, phone, address, description,
  }) {
    validateUuid(customerId);

    const query = {
      text: 'UPDATE customers SET name = ?, phone = ?, address = ?, description = ? WHERE id = ?',
      values: [name, phone, address, description, customerId],
    };

    await db.query(query.text, query.values);
  }

  async deleteCustomerById(customerId) {
    validateUuid(customerId);

    const query = {
      text: 'DELETE FROM customers WHERE id = ?',
      values: [customerId],
    };

    await db.query(query.text, query.values);
  }
}

module.exports = CustomersService;
