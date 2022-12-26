const { Pool } = require('pg');
const { db, queryMYSQL } = require('./../../connection/connection')
class GeneralService {
  constructor() {
    this._pool = new Pool();
  }

  async dashboardSummary(companyId) {
    const saleTodayCount = await queryMYSQL(
      {
        text: `SELECT COUNT(id) as sale_count FROM sales WHERE office_id = (SELECT id FROM offices WHERE company_id = ? LIMIT 1) AND date = CURRENT_DATE`,
        values: [companyId]
      }
    );

    const purchaseTodayCount = await queryMYSQL(
      {
        text: `SELECT COUNT(id) as purchase_count FROM purchases WHERE office_id = (SELECT id FROM offices WHERE company_id = ? LIMIT 1) AND date = CURRENT_DATE`,
        values: [companyId]
      }
    );

    const saleYesterdayCount = await queryMYSQL({text:
      `SELECT COUNT(id) as sale_count FROM sales WHERE office_id = (SELECT id FROM offices WHERE company_id = ? LIMIT 1) AND date = CURRENT_DATE - 1`,
      values: [companyId]
    });

    const purchaseYesterdayCount = await queryMYSQL({text:
      `SELECT COUNT(id) as purchase_count FROM purchases WHERE office_id = (SELECT id FROM offices WHERE company_id = ? LIMIT 1) AND date = CURRENT_DATE - 1`,
      values:[companyId]
    });

    const totalSales = await queryMYSQL({text:`
      SELECT SUM(amount) as sale_total FROM sales WHERE office_id = (SELECT id FROM offices WHERE company_id = ? LIMIT 1)
    `, values:[companyId]});

    const totalPurchases = await queryMYSQL({text:`
      SELECT SUM(amount) as purchase_total FROM purchases WHERE office_id = (SELECT id FROM offices WHERE company_id = ? LIMIT 1)
    `, values:[companyId]});

    const graphSale = await queryMYSQL({text:
      `SELECT COUNT(date), date 
      FROM sales
      WHERE office_id = (SELECT id FROM offices WHERE company_id = ? LIMIT 1) AND date BETWEEN CURRENT_DATE - 7 AND CURRENT_DATE
      GROUP BY date`, values: [companyId]}
    );

    const graphPurchase = await queryMYSQL({text:
      `SELECT COUNT(date), date 
      FROM purchases
      WHERE office_id = (SELECT id FROM offices WHERE company_id = ? LIMIT 1) AND date BETWEEN CURRENT_DATE - 7 AND CURRENT_DATE
      GROUP BY date `, values: [companyId]}
    );

    console.log(saleTodayCount, purchaseTodayCount, saleYesterdayCount, purchaseYesterdayCount, totalSales, totalPurchases, graphSale, graphPurchase)
    const grownSale = (+saleYesterdayCount[0].sale_count - +saleTodayCount[0].sale_count)
      / +saleYesterdayCount[0].sale_count;
    const grownPurchase = (+purchaseYesterdayCount[0].purchase_count
      - +purchaseTodayCount[0].purchase_count)
      / +purchaseYesterdayCount[0].purchase_count;

    return {
      saleCount: saleTodayCount[0].sale_count,
      purchaseCount: purchaseTodayCount[0].purchase_count,
      saleYesterdayCount: saleYesterdayCount[0].sale_count,
      purchaseYesterdayCount: purchaseYesterdayCount[0].purchase_count,
      grownSale,
      grownPurchase,
      graphSale: graphSale,
      graphPurchase: graphPurchase,
      totalSales: totalSales[0].sale_total,
      totalPurchases: totalPurchases[0].purchase_total,
    };
  }
}

module.exports = GeneralService;
