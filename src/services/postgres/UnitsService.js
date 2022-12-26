const { Pool } = require('pg');
const { db, queryMYSQL } = require('./../../connection/connection')
const uuid = require('uuid-random');
const NotFoundError = require('../../exceptions/NotFoundError');
const { validateUuid } = require('../../utils');

class UnitsService {
  constructor() {
    this._pool = new Pool();
  }

  async getUnits(companyId, { page = 1, q = null, limit = 10 }) {
    var recQuery = {
      text: `
        SELECT count(id) as total 
        FROM units 
        WHERE 
          company_id = ?
          ${q !== null ? `AND name LIKE '%${q}%'` : ''}
      `,
      values: [companyId]
    }
    const recordsQuery = await queryMYSQL(recQuery);
    const { total } = recordsQuery[0];

    const totalPages = Math.ceil(total / limit);
    const offsets = limit * (page - 1);

    const query = {
      text: `
          SELECT id, name, description FROM units WHERE company_id = ?
          ${q !== null ? `AND name LIKE '%${q}%'` : ''}
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?
        `,
      values: [companyId, limit, offsets],
    };

    const rows  = await queryMYSQL(query);

    return {
      units: rows,
      meta: {
        totalPages,
        total,
        page,
      },
    };
  }

  async getUnitById(unitId) {
    validateUuid(unitId);

    const query = {
      text: 'SELECT name, description FROM units WHERE id = ?',
      values: [unitId],
    };

    const results = await queryMYSQL(query);

    if (results.length < 1) {
      throw new NotFoundError('Unit tidak ditemukan');
    }

    return results[0];
  }

  async addUnit({ name, description, companyId }) {
    const id = uuid();
    const query = {
      text: 'INSERT INTO units(id, name, description, company_id) VALUES (?, ?, ?, ?)',
      values: [id, name, description, companyId],
    };

    await db.query(query.text, query.values);

    return id;
  }

  async updateUnitById(unitId, { name, description }) {
    validateUuid(unitId);

    const query = {
      text: 'UPDATE units SET name = ?, description = ? WHERE id = ?',
      values: [name, description, unitId],
    };

    await db.query(query.text, query.values);
  }

  async deleteUnitById(unitId) {
    validateUuid(unitId);

    const query = {
      text: 'DELETE FROM units WHERE id = ?',
      values: [unitId],
    };

    await db.query(query.text, query.values);
  }
}

module.exports = UnitsService;
