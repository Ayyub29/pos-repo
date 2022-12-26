const { Pool } = require('pg');
const uuid = require('uuid-random');
const { db, queryMYSQL } = require('./../../connection/connection')
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { validateUuid } = require('../../utils');

class PurchasesService {
  constructor() {
    this._pool = new Pool();
  }

  async createTransaction({
    date, invoice, description, amount, discount, items, userId, officeId,
  }) {
    try {
      await db.beginTransaction(); // transaction

      const purchaseId = uuid();
      const purchasesQuery = {
        text: `INSERT INTO 
                purchases(id, date, invoice, description, amount, discount, created_by, office_id)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        values: [purchaseId, date, invoice, description, amount, discount, userId, officeId],
      };

      await db.query(purchasesQuery.text, purchasesQuery.values);

      await items.map(async (item) => {
        var itemId = uuid()
        const rows = await queryMYSQL({text:`SELECT stock, purchase FROM stocks WHERE product_id = ?`, values: [item.productId]})
        console.log(rows)
        await db.query(`UPDATE stocks SET stock = '${+rows[0].stock + +item.quantity}', purchase = '${+rows[0].purchase + +item.quantity}' WHERE product_id = '${item.productId}'`);

        const itemQuery = {
          text: `INSERT INTO purchase_items(id, purchase_id, product_id, quantity, cost) VALUES ('${itemId}','${purchaseId}', '${item.productId}', '${item.quantity}', '${item.cost}')`,
        };

        await db.query(itemQuery.text);
      });

      await db.commit();

      return purchaseId;
    } catch (error) {
      await db.rollback();
      throw new InvariantError(`transaksi gagal: ${error.message}`);
    }
  }

  async getPurchases(companyId, { startDate, endDate, page = 1, q, limit = 20 }) {
    const recordsQuery = await queryMYSQL({text:`
      SELECT count(purchases.id) as total 
      FROM purchases
      WHERE 
        purchases.office_id = (SELECT id FROM offices WHERE company_id = ? LIMIT 1)
        ${q ? `AND invoice LIKE '%${q}%'` : ''}
      AND date BETWEEN '${startDate}' AND '${endDate}'
    `, values:[companyId]});

    const { total } = recordsQuery[0];

    const totalPages = Math.ceil(total / limit);
    const offsets = limit * (page - 1);

    const query = {
      text: `SELECT 
              purchases.id, invoice, date, amount,
              offices.name as office_name,
              users.name as creator
            FROM purchases 
            LEFT JOIN offices ON offices.id = purchases.office_id
            LEFT JOIN users ON users.id = purchases.created_by
            WHERE 
              purchases.office_id = (SELECT id FROM offices WHERE company_id = ? LIMIT 1)
              ${q ? `AND invoice LIKE '%${q}%'` : ''}
            AND date BETWEEN ? AND ?
            ORDER BY purchases.created_at DESC
            LIMIT ? OFFSET ?`,
      values: [companyId, startDate, endDate, limit, offsets],
    };

    const rows  = await queryMYSQL(query);

    return {
      purchases: rows,
      meta: {
        page,
        total,
        totalPages,
      },
    };
  }

  async getPurchaseById(purchaseId) {
    validateUuid(purchaseId);

    const query = {
      text: `SELECT 
                date, invoice, purchases.description, amount, discount, users.name as creator, offices.name as office_name 
              FROM purchases
              LEFT JOIN offices ON offices.id = purchases.office_id
              LEFT JOIN users ON users.id = purchases.created_by
              WHERE purchases.id = ?
              ORDER BY purchases.created_at DESC`,
      values: [purchaseId],
    };

    const results = await queryMYSQL(query);

    if (results.length < 1) {
      throw new NotFoundError('transaksi tidak ditemukan');
    }

    const itemsQuery = {
      text: `SELECT 
              products.id, products.code, products.name, quantity, purchase_items.cost
            FROM purchase_items
            LEFT JOIN products ON products.id = purchase_items.product_id
            WHERE purchase_id = ?`,
      values: [purchaseId],
    };

    const items = await queryMYSQL(itemsQuery);

    return {
      ...results[0],
      items: items,
    };
  }
}

module.exports = PurchasesService;
