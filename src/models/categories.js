import pool from '../database.js';

export const getAllCategories = async () => {
  const result = await pool.query(
    'SELECT category_id, name FROM categories ORDER BY name',
  );
  return result.rows;
};

export const getCategoryById = async (categoryId) => {
  const result = await pool.query(
    'SELECT category_id, name FROM categories WHERE category_id = $1',
    [categoryId],
  );
  return result.rows[0] ?? null;
};

export const getProjectsByCategoryId = async (categoryId) => {
  const result = await pool.query(
    `SELECT project.project_id, project.title
    FROM service_projects AS project
    JOIN project_categories AS project_category
      ON project_category.project_id = project.project_id
    WHERE project_category.category_id = $1
    ORDER BY project.project_date, project.title`,
    [categoryId],
  );
  return result.rows;
};
