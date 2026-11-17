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

export const createCategory = async (name) => {
  const result = await pool.query(
    `INSERT INTO categories (name)
    VALUES ($1)
    RETURNING category_id`,
    [name],
  );
  if (result.rows.length === 0) {
    throw new Error('Failed to create category');
  }
  return result.rows[0].category_id;
};

export const updateCategory = async (categoryId, name) => {
  const result = await pool.query(
    `UPDATE categories
    SET name = $1
    WHERE category_id = $2
    RETURNING category_id`,
    [name, categoryId],
  );
  return result.rows[0]?.category_id ?? null;
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

const assignCategoryToProject = async (projectId, categoryId, db = pool) => {
  await db.query(
    `INSERT INTO project_categories (project_id, category_id)
    VALUES ($1, $2)
    ON CONFLICT (project_id, category_id) DO NOTHING`,
    [projectId, categoryId],
  );
};

export const updateCategoryAssignments = async (projectId, categoryIds) => {
  if (!Array.isArray(categoryIds)) {
    throw new TypeError('categoryIds must be an array.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'DELETE FROM project_categories WHERE project_id = $1',
      [projectId],
    );
    for (const categoryId of categoryIds) {
      await assignCategoryToProject(projectId, categoryId, client);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
};
