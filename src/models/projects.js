import pool from '../database.js';

export async function getAllProjects() {
  const result = await pool.query(`
    SELECT
      project.project_id,
      project.title,
      project.description,
      TO_CHAR(project.project_date, 'FMMonth DD, YYYY') AS project_date,
      organization.name AS organization_name
    FROM service_projects AS project
    JOIN organizations AS organization
      ON organization.organization_id = project.organization_id
    ORDER BY project.project_date, project.title
  `);
  return result.rows;
}
