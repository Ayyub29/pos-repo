const { Pool } = require('pg');
const uuid = require('uuid-random');
const NotFoundError = require('../../exceptions/NotFoundError');
const { db, queryMYSQL } = require('./../../connection/connection')
const { validateUuid } = require('../../utils');

class CategoriesService {
  constructor() {
    this._pool = new Pool();
  }

  async getCategories(companyId, { page = 1, limit = 10, q = null }) {
    var recQuery = {
      text: `
          SELECT count(id) as total 
          FROM categories 
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
        SELECT id, name, description 
        FROM categories 
        WHERE company_id = ?
        ${q !== null ? `AND name LIKE '%${q}%'` : ''}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
      values: [companyId, limit, offsets],
    };

    const rows  = await queryMYSQL(query);

    return {
      categories: rows,
      meta: {
        totalPages,
        total,
        page,
      },
    };
  }

  async getCategoryById(categoryId) {
    validateUuid(categoryId);

    const query = {
      text: 'SELECT name, description FROM categories WHERE id = ?',
      values: [categoryId],
    };

    const results = await queryMYSQL(query);

    if (results.length < 1) {
      throw new NotFoundError('Category tidak ditemukan');
    }

    return results[0];
  }

  async addCategory({ name, description, companyId }) {
    const id = uuid();
    const query = {
      text: 'INSERT INTO categories(id, name, description, company_id) VALUES (?, ?, ?, ?)',
      values: [id, name, description, companyId],
    };

    await db.query(query.text, query.values);

    return id;
  }

  async updateCategoryById(categoryId, { name, description }) {
    validateUuid(categoryId);

    const query = {
      text: 'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      values: [name, description, categoryId],
    };

    await db.query(query.text, query.values);
  }

  async deleteCategoryById(categoryId) {
    validateUuid(categoryId);

    const query = {
      text: 'DELETE FROM categories WHERE id = ?',
      values: [categoryId],
    };

    await db.query(query.text, query.values);
  }
}

module.exports = CategoriesService;
