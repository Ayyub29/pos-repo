const { Pool } = require('pg');
const uuid = require('uuid-random');
const { db, queryMYSQL } = require('./../../connection/connection')
const { validateUuid } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class ProductsService {
  constructor() {
    this._pool = new Pool();
  }

  async getProducts(companyId, {
    page = 1, q = null, withStock = false, withCategory = false, categoryId, limit = 10,
  }) {
    var recQuery = {
      text: `
          SELECT count(id) as total 
          FROM products 
          WHERE 
            company_id = ?
            ${q ? `AND (name LIKE '%${q}%' OR code LIKE '%${q}%')` : ''}
        `,
      values: [companyId]
    }
    const recordsQuery = await queryMYSQL(recQuery);

    const { total } = recordsQuery[0];

    const totalPages = Math.ceil(total / limit);
    const offsets = limit * (page - 1);

    const query = {
      text: `SELECT 
              products.id, products.code, products.name, products.description, price, cost
              ${withStock === 'true' ? ', stock, sale, purchase' : ''}
              ${withCategory === 'true' ? ', categories.name as category_name' : ''}
            FROM products
            ${withStock === 'true' ? 'LEFT JOIN stocks ON stocks.product_id = products.id' : ''}
            ${withCategory === 'true' ? 'LEFT JOIN categories ON categories.id = products.category_id' : ''}
            WHERE products.company_id = ?
            ${categoryId ? `AND categories.id = '${categoryId}'` : ''}
            ${q ? `AND (products.name LIKE '%${q}%' OR products.code LIKE '%${q}%')` : ''}
            ORDER BY products.created_at DESC
            LIMIT ? OFFSET ?`,
      values: [companyId, limit, offsets],
    };

    const rows = await queryMYSQL(query);

    return {
      products: rows,
      meta: {
        totalPages,
        total,
        page,
      },
    };
  }

  async getProductById({ productId, companyId }) {
    validateUuid(productId);

    const query = {
      text: `SELECT 
              products.code, products.name, products.description, price, cost, cost_average, 
              categories.name as category_name,
              categories.id as category_id,
              stocks.stock
            FROM products
            LEFT JOIN stocks ON stocks.product_id = products.id
            LEFT JOIN categories ON categories.id = products.category_id
            WHERE products.id = ? AND products.company_id = ?`,
      values: [productId, companyId],
    };

    const result = await queryMYSQL(query);

    if (result.length < 1) {
      throw new NotFoundError('Product tidak ditemukan');
    }

    return result[0];
  }

  async addProduct({
    code, name, description, price, cost, stock, categoryId, companyId,
  }) {
    const productId = uuid();
    const stockId = uuid();
    const unitQuery = {
      text: `SELECT id as unitId FROM units WHERE company_id = ? LIMIT 1`,
      values: [companyId]
    }
    const officeQuery = {
      text: ` SELECT id as warehouseId FROM warehouses WHERE office_id = 
                (SELECT id FROM offices WHERE company_id = ? LIMIT 1) 
              LIMIT 1`,
      values: [companyId]
    }
    var  unitRows  = await queryMYSQL(unitQuery)
    var { unitId } = unitRows[0]
    var warehouseRows = await queryMYSQL(officeQuery)
    var { warehouseId } = warehouseRows[0]

    const productQuery = {
      text: `INSERT INTO products(id, code, name, description, price, cost, category_id, company_id, unit_id)
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values: [productId, code, name, description, price, cost, categoryId, companyId, unitId],
    };

    // update stock default warehouse default office
    const stockQuery = {
      text: `INSERT INTO 
              stocks(id, product_id, stock, warehouse_id, sale, purchase)
            VALUES 
              (?, ?, ?, ?, 0, 0)`,
      values: [stockId, productId, stock, warehouseId],
    };

    // const client = await this._pool.connect();

    try {
      await db.beginTransaction();
      await db.query(productQuery.text, productQuery.values);
      await db.query(stockQuery.text, stockQuery.values);
      await db.commit();
    } catch (err) {
      await db.rollback();
      throw new InvariantError(`Product gagal ditambahkan: ${err.message}`);
    } 

    return productId;
  }

  async updateProductById(productId, {
    code, name, description, price, cost, stock, categoryId,
  }) {
    validateUuid(productId);

    const productQuery = {
      text: `UPDATE products SET 
              code = ?, name = ?, description = ?, price = ?, 
              cost = ?, category_id = ?
            WHERE id = ?`,
      values: [code, name, description, price, cost, categoryId, productId],
    };

    // update stock all warehouses
    const stockQuery = {
      text: 'UPDATE stocks SET stock = ? WHERE product_id = ?',
      values: [stock, productId],
    };

    try {
      await db.beginTransaction();
      await db.query(productQuery.text, productQuery.values);
      await db.query(stockQuery.text, stockQuery.values);
      await db.commit();
    } catch (err) {
      await db.rollback();
      throw new InvariantError('Product gagal diubah');
    }
  }

  async deleteProductById(productId) {
    validateUuid(productId);
    const query = {
      text: 'DELETE FROM products WHERE id = ?',
      values: [productId],
    };

    const result = await queryMYSQL(query);

    if (result.length < 1) {
      throw new NotFoundError('Product tidak ditemukan');
    }
  }
}

module.exports = ProductsService;
