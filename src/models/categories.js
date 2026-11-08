import pool from '../database.js';

export const getAllCategories = async () => {
  const result = await pool.query(
    'SELECT category_id, name FROM categories ORDER BY name',
  );
  return result.rows;
};
