const { Pool } = require('pg');
const { queryMYSQL } = require('./../../connection/connection')
const bcrypt = require('bcrypt');
const uuid = require('uuid-random');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { validateUuid } = require('../../utils');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async verifyUserCredential(email, password) {
    const query = {
      text: 'SELECT id, company_id, password FROM users WHERE email = ?',
      values: [email],
    };
    const result = await queryMYSQL(query);

    if (!result.length) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    const { id, company_id: companyId, password: hashedPassword } = result[0];

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }
    return { id, companyId };
  }

  async verifyNewEmail({ email }) {
    const query = {
      text: 'SELECT id FROM users WHERE email = ?',
      values: [email],
    };

    const result = await queryMYSQL(query);

    if (result.rowCount >= 1) {
      throw new InvariantError('Email sudah digunakan');
    }
  }

  async addUser({
    name, email, password, companyId,
  }) {
    await this.verifyNewEmail({ email });

    const id = uuid();
    const hashedPassword = await bcrypt.hash(password, 12);

    const query = {
      text: 'INSERT INTO users(id, name, email, password, company_id, role) VALUES (?, ?, ?, ?, ?, ?)',
      values: [id, name, email, hashedPassword, companyId, 'kasir'],
    };

    await queryMYSQL(query);

    return id;
  }

  async getUsers(companyId, { page = 1, q = null, limit = 10 }) {
    const recQuery = {
      text: `
        SELECT count(id) as total 
        FROM users 
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
        SELECT id, name, email, role FROM users WHERE company_id = ?
        ${q !== null ? `AND name LIKE '%${q}%'` : ''}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
      values: [companyId, limit, offsets],
    };

    const rows  = await queryMYSQL(query);

    return {
      users: rows,
      meta: {
        totalPages,
        total,
        page,
      },
    };
  }

  async getUserById({ userId, companyId }) {
    validateUuid(userId);
    const query = {
      text: 'SELECT id, name, email, role FROM users WHERE id = ? AND company_id = ?',
      values: [userId, companyId],
    };

    const result = await queryMYSQL(query);

    if (result.length < 1) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return result[0];
  }

  async getMe(userId) {
    validateUuid(userId);

    const query = {
      text: `SELECT 
              users.id, users.name, role, users.email, 
              offices.id as officeId, 
              companies.id as companyId, companies.name as company_name 
            FROM users 
            LEFT JOIN companies ON companies.id = users.company_id
            LEFT JOIN offices ON companies.id = offices.company_id
            WHERE users.id = ?`,
      values: [userId],
    };

    const result = await queryMYSQL(query);

    if (result.length < 1) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return result[0];
  }

  async updateUserById(userId, { name, email, password }) {
    validateUuid(userId);

    let hashedPassword = '';
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }
    const updatedAt = new Date();
    const query = {
      text: `UPDATE users SET name = ?, email = ?, updated_at = ? ${password ? `, password = '${hashedPassword}'` : ''} WHERE id = ?`,
      values: [name, email, updatedAt, userId],
    };
  
    const result = await queryMYSQL(query);
    if (result.length < 1) {
      throw new NotFoundError('User tidak ditemukan');
    }
  }

  async deleteUserById(userId) {
    validateUuid(userId);

    const query = {
      text: 'DELETE FROM users WHERE id = ?',
      values: [userId],
    };

    const result = await queryMYSQL(query);

    if (result.rowCount < 1) {
      throw new NotFoundError('User tidak ditemukan');
    }
  }
}

module.exports = UsersService;
