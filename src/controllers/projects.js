import {
  getAllProjects,
  getProjectDetails,
  getCategoriesByProjectId,
  createProject,
  updateProject,
} from '../models/projects.js';
import { getAllOrganizations } from '../models/organizations.js';
import { body, validationResult } from 'express-validator';

const projectValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Project title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ max: 999 })
    .withMessage('Project description must be less than 1000 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Project location is required')
    .isLength({ max: 199 })
    .withMessage('Project location must be less than 200 characters'),
  body('date')
    .trim()
    .notEmpty()
    .withMessage('Project date is required')
    .isISO8601({ strict: true })
    .withMessage('Please provide a valid project date'),
  body('organizationId')
    .trim()
    .notEmpty()
    .withMessage('Please select an organization')
    .isInt({ min: 1 })
    .withMessage('Please select a valid organization')
    .toInt(),
];

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

const showNewProjectForm = async (req, res, next) => {
  try {
    const organizations = await getAllOrganizations();
    res.render('new-project', {
      title: 'Add New Service Project',
      currentPage: 'projects',
      organizations,
    });
  } catch (error) {
    next(error);
  }
};

const processNewProjectForm = async (req, res, next) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      results.array().forEach((error) => {
        req.flash('error', error.msg);
      });
      return res.redirect('/new-project');
    }

    const { organizationId, title, description, location, date } = req.body;
    await createProject(title, description, location, date, organizationId);
    req.flash('success', 'Service project added successfully!');
    res.redirect('/projects');
  } catch (error) {
    next(error);
  }
};

const showEditProjectForm = async (req, res, next) => {
  const projectId = Number(req.params.id);
  if (!Number.isSafeInteger(projectId) || projectId < 1) {
    const error = new Error('Page Not Found');
    error.status = 404;
    next(error);
    return;
  }

  try {
    const [project, organizations] = await Promise.all([
      getProjectDetails(projectId),
      getAllOrganizations(),
    ]);
    if (!project) {
      const error = new Error('Page Not Found');
      error.status = 404;
      next(error);
      return;
    }

    res.render('update-project', {
      title: 'Edit Service Project',
      currentPage: 'projects',
      project,
      organizations,
    });
  } catch (error) {
    next(error);
  }
};

const processEditProjectForm = async (req, res, next) => {
  const projectId = Number(req.params.id);
  if (!Number.isSafeInteger(projectId) || projectId < 1) {
    const error = new Error('Page Not Found');
    error.status = 404;
    next(error);
    return;
  }

  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      results.array().forEach((error) => {
        req.flash('error', error.msg);
      });
      return res.redirect(`/edit-project/${projectId}`);
    }

    const { title, description, location, date, organizationId } = req.body;
    const updatedId = await updateProject(
      projectId,
      title,
      description,
      location,
      date,
      organizationId,
    );
    req.flash('success', 'Service project updated successfully!');
    res.redirect(`/project/${updatedId}`);
  } catch (error) {
    next(error);
  }
};

export {
  showProjectsPage,
  showProjectDetailsPage,
  showNewProjectForm,
  processNewProjectForm,
  showEditProjectForm,
  processEditProjectForm,
  projectValidation,
};
