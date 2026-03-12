const { DataSource } = require('./data-source');

async function runMigrationss() {
  try {
    const dataSource = new DataSource();
    await dataSource.initialize();
    console.log('✅ Database connected');

    await dataSource.runMigrations();
    console.log('✅ Migrations executed successfully');

    await dataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

runMigrationss();
