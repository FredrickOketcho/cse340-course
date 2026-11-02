import pool from '../database.js';

export async function getAllCategories() {
  const result = await pool.query(
    'SELECT category_id, name FROM categories ORDER BY name',
  );
  return result.rows;
}
