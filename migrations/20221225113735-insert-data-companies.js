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
  // db.runSql("INSERT INTO companies VALUES (1, 'Toko 1', '', 'Klaten', '089999999', 'toko1@toko.com', default, default)");
  // db.runSql("INSERT INTO offices VALUES (1, 'Toko 1', '', 'Klaten', '089999999', 'toko1@toko.com', 1, default, default)");
  // db.runSql("INSERT INTO warehouses VALUES  (1, 'Toko 1', '', 'Klaten', '089999999', 1, default, default)");
  // db.runSql(`INSERT INTO users VALUES (1, 'Admin', 'admin@mail.com', '$2b$10$WPZxNuS9GFRvBSkoEEVMu.F0i5tJ24K6JmBV5maS0QWt0.wQLETYu', 'admin', 1, default, default)`);
  return null;
};

exports.down = function(db) {
  db.dropTable('users');
  db.dropTable('warehouses');
  db.dropTable('offices');
  db.dropTable('companies');
  return null;
};

exports._meta = {
  "version": 1
};
