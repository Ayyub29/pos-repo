const { Pool } = require('pg');
const { db, queryMYSQL } = require('./../../connection/connection')
const InvariantError = require('../../exceptions/InvariantError');
// const { default: db } = require('node-pg-migrate/dist/db');

class AuthenticationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES(?)',
      values: [token],
    };

    await db.query(query.text, query.values);
  }

  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = ?',
      values: [token],
    };

    const result = await queryMYSQL(query);

    if (!result.length) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  async deleteRefreshToken(token) {
    await this.verifyRefreshToken(token);

    const query = {
      text: 'DELETE FROM authentications WHERE token = ?',
      values: [token],
    };
    await db.query(query.text, query.values);
  }
}

module.exports = AuthenticationsService;
