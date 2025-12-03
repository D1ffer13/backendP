async function startServer() {
  console.log('DB config:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    db: process.env.DB_NAME,
  });

  try {
    await db.query('SELECT 1');
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Database connection error:', err);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📘 API docs: http://localhost:${PORT}/api`);
  });
}

startServer();
