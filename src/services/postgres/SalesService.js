const { Pool } = require('pg');
const { db, queryMYSQL } = require('./../../connection/connection')
const uuid = require('uuid-random');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { validateUuid } = require('../../utils');
// const { default: db } = require('node-pg-migrate/dist/db');

class SalesService {
  constructor() {
    this._pool = new Pool();
  }

  async createTransaction({
    date, invoice, description, amount, discount, items, userId, officeId, customerId,
  }) {
    // check stock
    const stocksQuery = await queryMYSQL(
      { text: `SELECT product_id, stock, sale FROM stocks 
                WHERE product_id IN (${items.map((i) => `'${i.productId}'`).join()})`, 
        values: []
    });
    const stocks = stocksQuery;
    const itemsWithStock = items.map((item) => ({
      ...item,
      stock: stocks.find((sp) => sp.product_id === item.productId).stock,
      sale: stocks.find((sp) => sp.product_id === item.productId).sale,
    }));
    const checkStock = itemsWithStock
      .map((iws) => +iws.stock - +iws.quantity).every((i) => i >= 0);
    if (!checkStock) {
      throw new InvariantError('transaksi gagal: stock tidak cukup');
    }

    // const client = await this._pool.connect();
    try {
      await db.beginTransaction(); // transaction

      const saleId = uuid();
      
      const saleQuery = {
        text: `INSERT INTO 
                sales(id, date, invoice, description, amount, discount, created_by, office_id, customer_id)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        values: [saleId, date, invoice, description, amount, discount, userId, officeId, customerId],
      };

      const sale = await queryMYSQL(saleQuery);

      await itemsWithStock.map(async (item) => {
        var saleItemId = uuid();
        await db.query(`UPDATE stocks SET stock = '${+item.stock - +item.quantity}', sale = '${+item.sale + +item.quantity}' WHERE product_id = '${item.productId}'`);

        const itemQuery = {
          text: `INSERT INTO sale_items(id, sale_id, product_id, quantity, price) VALUES ('${saleItemId}', '${saleId}', '${item.productId}', '${item.quantity}', '${item.price}')`,
        };

        await db.query(itemQuery.text);
      });

      await db.commit();

      return saleId;
    } catch (error) {
      await db.rollback();
      throw new InvariantError(`transaksi gagal: ${error.message}`);
    }
  }

  async getSales(companyId, {
    startDate, endDate, page = 1, q = null, customerId, limit = 20,
  }) {
    const recordsQuery = await queryMYSQL({text:`
      SELECT count(sales.id) as total 
      FROM sales 
      ${customerId ? 'LEFT JOIN customers ON customers.id = sales.customer_id' : ''}
      WHERE 
        sales.office_id = (SELECT id FROM offices WHERE company_id = ? LIMIT 1)
      ${q ? `AND invoice LIKE '%${q}%'` : ''}
      ${customerId ? `AND customer_id = '${customerId}'` : ''}
      AND date BETWEEN '${startDate}' AND '${endDate}'
    `, values:[companyId]});

    const { total } = recordsQuery[0];

    const totalPages = Math.ceil(total / limit);
    const offsets = limit * (page - 1);

    const query = {
      text: `SELECT 
              sales.id, invoice, date, amount, 
              offices.name as office_name, 
              users.name as casier,
              customers.name as customer_name
            FROM sales 
            LEFT JOIN offices ON offices.id = sales.office_id
            LEFT JOIN users ON users.id = sales.created_by
            LEFT JOIN customers ON customers.id = sales.customer_id
            WHERE 
              sales.office_id = (SELECT id FROM offices WHERE company_id = ? LIMIT 1)
            ${q ? `AND invoice LIKE '%${q}%'` : ''}
            ${customerId ? `AND customer_id = '${customerId}'` : ''}
            AND date BETWEEN ? AND ?
            ORDER BY sales.created_at DESC
            LIMIT ? OFFSET ?
            `,
      values: [companyId, startDate, endDate, limit, offsets],
    };

    const rows = await queryMYSQL(query);

    return {
      sales: rows,
      meta: {
        page,
        total,
        totalPages,
      },
    };
  }

  async getSaleById(saleId) {
    validateUuid(saleId);

    const query = {
      text: `SELECT 
                date, invoice, sales.description, amount, discount, 
                users.name as casier, 
                offices.name as office_name,
                customers.id as customer_id, customers.name as customer_name
              FROM sales
              LEFT JOIN offices ON offices.id = sales.office_id
              LEFT JOIN users ON users.id = sales.created_by
              LEFT JOIN customers ON customers.id = sales.customer_id
              WHERE sales.id = ?`,
      values: [saleId],
    };

    const results = await queryMYSQL(query);

    if (results.length < 1) {
      throw new NotFoundError('transaksi tidak ditemukan');
    }

    const itemsQuery = {
      text: `SELECT 
              products.id, products.code, products.name, quantity, sale_items.price
            FROM sale_items
            LEFT JOIN products ON products.id = sale_items.product_id
            WHERE sale_id = ?`,
      values: [saleId],
    };

    const items = await queryMYSQL(itemsQuery);

    return {
      ...results[0],
      items: items,
    };
  }
}

module.exports = SalesService;
