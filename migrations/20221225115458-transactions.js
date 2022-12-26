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
  // sales
  db.createTable('sales', {
    id: {
      type: 'string',
      primaryKey: true,
    },
    office_id: {
      type: 'string',
      notNull: true,
    },
    date: {
      type: 'datetime',
      notNull: true,
    },
    invoice: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: false,
    },
    amount: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    discount: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    customer_id: {
      type: 'string',
      notNull: true,
    },
    created_by: {
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
  // sale_items
  db.createTable('sale_items', {
    id: {
      type: 'string',
      primaryKey: true,
    },
    sale_id: {
      type: 'string',
      notNull: true,
    },
    product_id: {
      type: 'string',
      notNull: true,
    },
    quantity: {
      type: 'numeric(16,2)',
      notNull: true,
    },
    price: {
      type: 'numeric(16,2)',
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
  // purchases
  db.createTable('purchases', {
    id: {
      type: 'string',
      primaryKey: true,
    },
    office_id: {
      type: 'string',
      notNull: true,
    },
    date: {
      type: 'datetime',
      notNull: true,
    },
    invoice: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: false,
    },
    amount: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    discount: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    created_by: {
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
  // purchase_item
  db.createTable('purchase_items', {
    id: {
      type: 'string',
      primaryKey: true,
    },
    purchase_id: {
      type: 'string',
      notNull: true,
    },
    product_id: {
      type: 'string',
      notNull: true,
    },
    quantity: {
      type: 'numeric(16,2)',
      notNull: true,
    },
    cost: {
      type: 'numeric(16,2)',
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
  db.createTable('authentications', {
    token: {
      type: 'TEXT',
      notNull: true,
    },
  });
  return null;
};

exports.down = function(db) {
  db.dropTable('sale_items');
  db.dropTable('sales');
  db.dropTable('purchase_items');
  db.dropTable('purchases');
  db.dropTable('authentications');
  return null;
};

exports._meta = {
  "version": 1
};
