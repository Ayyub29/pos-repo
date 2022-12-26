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
  db.createTable('units', {
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
  // categories
  db.createTable('categories', {
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
  // products
  db.createTable('products', {
    id: {
      type: 'string',
      primaryKey: true,
    },
    code: {
      type: 'varchar(255)',
      notNull: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: false,
    },
    price: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    cost: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    cost_average: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    company_id: {
      type: 'string',
      notNull: true,
    },
    category_id: {
      type: 'string',
      notNull: true,
    },
    unit_id: {
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
  // stocks
  db.createTable('stocks', {
    id: {
      type: 'string',
      primaryKey: true,
    },
    product_id: {
      type: 'string',
      notNull: true,
    },
    warehouse_id: {
      type: 'string',
      notNull: true,
    },
    stock: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    sale: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    purchase: {
      type: 'numeric(16,2)',
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
  // prices
  db.createTable('prices', {
    id: {
      type: 'string',
      primaryKey: true,
    },
    product_id: {
      type: 'string',
      notNull: true,
    },
    office_id: {
      type: 'string',
      notNull: true,
    },
    price: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    cost: {
      type: 'numeric(16,2)',
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

  db.createTable('customers', {
    id: {
      type: 'string',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    phone: {
      type: 'varchar(16)',
      notNull: false,
    },
    address: {
      type: 'text',
      notNull: false,
    },
    description: {
      type: 'text',
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
  db.dropTable('customers');
  db.dropTable('prices');
  db.dropTable('stocks');
  db.dropTable('products');
  db.dropTable('categories');
  db.dropTable('units');
  return null;
};

exports._meta = {
  "version": 1
};
