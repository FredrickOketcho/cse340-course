import pool from '../database.js';

export const getAllProjects = async () => {
  const result = await pool.query(`
    SELECT
      project.project_id,
      project.title,
      project.description,
      project.location,
      TO_CHAR(project.project_date, 'FMMonth DD, YYYY') AS project_date,
      organization.name AS organization_name,
      COALESCE((
        SELECT STRING_AGG(category.name, ', ' ORDER BY category.name)
        FROM project_categories AS project_category
        JOIN categories AS category
          ON category.category_id = project_category.category_id
        WHERE project_category.project_id = project.project_id
      ), '') AS categories
    FROM service_projects AS project
    JOIN organizations AS organization
      ON organization.organization_id = project.organization_id
    ORDER BY project.project_date, project.title
  `);
  return result.rows;
};

export const getProjectsByOrganizationId = async (organizationId) => {
  const result = await pool.query(
    `SELECT project_id, title, project_date, description, location
    FROM service_projects
    WHERE organization_id = $1
    ORDER BY project_date, title`,
    [organizationId],
  );
  return result.rows;
};
