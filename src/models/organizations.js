import pool from '../database.js';

export const getAllOrganizations = async () => {
  const result = await pool.query(
    `SELECT organization_id, name, description, email, logo_filename
    FROM organizations
    ORDER BY name`,
  );
  return result.rows;
};

export const getOrganizationById = async (organizationId) => {
  const result = await pool.query(
    `SELECT organization_id, name, description, email, logo_filename
    FROM organizations
    WHERE organization_id = $1`,
    [organizationId],
  );
  return result.rows[0] ?? null;
};
