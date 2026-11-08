import pool from '../database.js';

export const getAllOrganizations = async () => {
  const result = await pool.query(
    `SELECT organization_id, name, description, email, logo_filename
    FROM organizations
    ORDER BY name`,
  );
  return result.rows;
};
