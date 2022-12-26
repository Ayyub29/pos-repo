'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  db.createTable('companies', {
    id: {
      type: 'string',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: false,
    },
    address: {
      type: 'text',
      notNull: false,
    },
    phone: {
      type: 'varchar(16)',
      notNull: false,
    },
    email: {
      type: 'varchar(255)',
      notNull: false,
    },
    created_at: {
      type: 'datetime',
      notNull: true,
      defaultValue: new String('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'datetime',
      notNull: true,
      defaultValue: new String('CURRENT_TIMESTAMP'),
    },
  });
  db.createTable('offices', {
    id: {
      type: 'string',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: false,
    },
    address: {
      type: 'text',
      notNull: false,
    },
    phone: {
      type: 'varchar(16)',
      notNull: false,
    },
    email: {
      type: 'varchar(255)',
      notNull: false,
    },
    company_id: {
      type: 'string',
      notNull: true,
    },
    created_at: {
      type: 'datetime',
      notNull: true,
      defaultValue: new String('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'datetime',
      notNull: true,
      defaultValue: new String('CURRENT_TIMESTAMP'),
    },
  });
  db.createTable('warehouses', {
    id: {
      type: 'string',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: false,
    },
    address: {
      type: 'text',
      notNull: false,
    },
    phone: {
      type: 'varchar(16)',
      notNull: false,
    },
    office_id: {
      type: 'string',
      notNull: true,
    },
    created_at: {
      type: 'datetime',
      notNull: true,
      defaultValue: new String('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'datetime',
      notNull: true,
      defaultValue: new String('CURRENT_TIMESTAMP'),
    },
  });
  db.createTable('users', {
    id: {
      type: 'string',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    email: {
      type: 'varchar(255)',
      notNull: false,
    },
    password: {
      type: 'varchar(255)',
      notNull: false,
    },
    role: {
      type: 'varchar(16)',
      notNull: false,
    },
    company_id: {
      type: 'string',
      notNull: true,
    },
    created_at: {
      type: 'datetime',
      notNull: true,
      defaultValue: new String('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'datetime',
      notNull: true,
      defaultValue: new String('CURRENT_TIMESTAMP'),
    },
  });
  
  return null;
};

exports.down = function(db) {
  
  return null;
};

exports._meta = {
  "version": 1
};
