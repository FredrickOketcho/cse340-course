import {
  getUpcomingProjects,
  getProjectDetails,
} from '../models/projects.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

const showProjectsPage = async (req, res, next) => {
  try {
    const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
    res.render('projects', {
      title: 'Upcoming Service Projects',
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

    res.render('project', {
      title: project.title,
      currentPage: 'projects',
      project,
    });
  } catch (error) {
    next(error);
  }
};

export { showProjectsPage, showProjectDetailsPage };
