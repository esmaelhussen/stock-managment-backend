const { DataSource } = require('./src/data-source');

async function runMigrations() {
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

runMigrations();
