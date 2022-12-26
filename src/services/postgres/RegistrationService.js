const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { db } = require('./../../connection/connection')
const uuid = require('uuid-random');
const { createuuid } = require('./../../utils')
const InvariantError = require('../../exceptions/InvariantError');

class RegistrationService {
  constructor(userService) {
    this._pool = new Pool();
    this._userService = userService;
  }

  async registerStore({ name, email, password }) {
    await this._userService.verifyNewEmail({ email });

    const companyId = uuid();
    const officeId = uuid();
    const warehouseId = uuid();
    const unitId = uuid();
    const userid = createuuid();
    const categoryid = createuuid();
    const customerid = createuuid();
    const hashedPassword = await bcrypt.hash(password, 12);

    const createCompanyQuery = {
      text: 'INSERT INTO companies(id, name) VALUES (?, ?)',
      values: [companyId, name],
    };

    const createOfficeQuery = {
      text: 'INSERT INTO offices(id, name, company_id) VALUES (?, ?, ?)',
      values: [officeId, `office-${name}`, companyId],
    };

    const createWarehouseQuery = {
      text: 'INSERT INTO warehouses(id, name, office_id) VALUES (?, ?, ?)',
      values: [warehouseId, `warehouse-${name}`, officeId],
    };

    const createUserQuery = {
      text: 'INSERT INTO users(id, name, email, password, role, company_id) VALUES (?, ?, ?, ?, ?, ?)',
      values: [userid, name, email, hashedPassword, 'admin', companyId],
    };

    const createUnitQuery = {
      text: 'INSERT INTO units(id, name, company_id) VALUES (?, ?, ?)',
      values: [unitId, 'Buah', companyId],
    };

    const createCategoryQuery = {
      text: 'INSERT INTO categories(id, name, company_id) VALUES (?, ?, ?)',
      values: [categoryid,'Umum', companyId]
    };

    const createCustomerQuery = {
      text: 'INSERT INTO customers(id, name, phone, address, description, company_id) VALUES (?, ?, ?, ?, ?, ?)',
      values: [customerid, 'Pelanggan Umum', '', '-', '-', companyId]
    };

    // const client = await this._pool.connect();
    try {
      await db.beginTransaction();
      await db.query(createCompanyQuery.text, createCompanyQuery.values);
      await db.query(createOfficeQuery.text, createOfficeQuery.values);
      await db.query(createWarehouseQuery.text, createWarehouseQuery.values);
      await db.query(createUserQuery.text, createUserQuery.values);
      await db.query(createUnitQuery.text, createUnitQuery.values);
      await db.query(createCategoryQuery.text, createCategoryQuery.values);
      await db.query(createCustomerQuery.text, createCustomerQuery.values);
      await db.commit();
    } catch (err) {
      await db.rollback();
      throw new InvariantError(`Gagal melakukan registrasi: ${err.message}`);
    } 
  }
}

module.exports = RegistrationService;
