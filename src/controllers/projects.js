import {
  getAllProjects,
  getProjectDetails,
  getCategoriesByProjectId,
} from '../models/projects.js';

const showProjectsPage = async (req, res, next) => {
  try {
    const projects = await getAllProjects();
    res.render('projects', {
      title: 'Service Projects',
      currentPage: 'projects',
      projects,
    });
  } catch (error) {
    next(error);
  }
};

const showProjectDetailsPage = async (req, res, next) => {
  const projectId = Number(req.params.id);
  if (!Number.isSafeInteger(projectId) || projectId < 1) {
    const error = new Error('Page Not Found');
    error.status = 404;
    next(error);
    return;
  }

  try {
    const project = await getProjectDetails(projectId);
    if (!project) {
      const error = new Error('Page Not Found');
      error.status = 404;
      next(error);
      return;
    }

    const categories = await getCategoriesByProjectId(projectId);
    res.render('project', {
      title: project.title,
      currentPage: 'projects',
      project,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

export { showProjectsPage, showProjectDetailsPage };
