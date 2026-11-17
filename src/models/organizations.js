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

/** Creates an organization and returns its database id. */
export const createOrganization = async (name, description, contactEmail, logoFilename) => {
  const result = await pool.query(
    `INSERT INTO organizations (name, description, email, logo_filename)
    VALUES ($1, $2, $3, $4)
    RETURNING organization_id`,
    [name, description, contactEmail, logoFilename],
  );

  if (result.rows.length === 0) {
    throw new Error('Failed to create organization');
  }

  if (process.env.ENABLE_SQL_LOGGING === 'true') {
    console.log('Created new organization with ID:', result.rows[0].organization_id);
  }

  return result.rows[0].organization_id;
};
