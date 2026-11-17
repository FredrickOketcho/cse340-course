import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
} from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

const organizationValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Organization name is required')
    .isLength({ min: 3, max: 150 })
    .withMessage('Organization name must be between 3 and 150 characters')
    .escape(),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Organization description is required')
    .isLength({ max: 500 })
    .withMessage('Organization description cannot exceed 500 characters')
    .escape(),
  body('contactEmail')
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Contact email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('logoFilename').trim(),
];

const showOrganizationsPage = async (req, res, next) => {
  try {
    const organizations = await getAllOrganizations();
    res.render('organizations', {
      title: 'Organizations',
      currentPage: 'organizations',
      organizations,
    });
  } catch (error) {
    next(error);
  }
};

const showOrganizationPage = async (req, res, next) => {
  const organizationId = Number(req.params.id);
  if (!Number.isSafeInteger(organizationId) || organizationId < 1) {
    const error = new Error('Page Not Found');
    error.status = 404;
    next(error);
    return;
  }

  try {
    const organization = await getOrganizationById(organizationId);
    if (!organization) {
      const error = new Error('Page Not Found');
      error.status = 404;
      next(error);
      return;
    }

    const projects = await getProjectsByOrganizationId(organizationId);
    res.render('organization', {
      title: organization.name,
      currentPage: 'organizations',
      organization,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

const showNewOrganizationForm = (req, res) => {
  res.render('new-organization', {
    title: 'Add New Organization',
    currentPage: 'organizations',
  });
};

const showEditOrganizationForm = async (req, res, next) => {
  const organizationId = Number(req.params.id);
  if (!Number.isSafeInteger(organizationId) || organizationId < 1) {
    const error = new Error('Page Not Found');
    error.status = 404;
    next(error);
    return;
  }

  try {
    const organization = await getOrganizationById(organizationId);
    if (!organization) {
      const error = new Error('Page Not Found');
      error.status = 404;
      next(error);
      return;
    }

    res.render('edit-organization', {
      title: `Edit ${organization.name}`,
      currentPage: 'organizations',
      organizationDetails: {
        ...organization,
        contact_email: organization.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const processNewOrganizationForm = async (req, res, next) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      results.array().forEach((error) => {
        req.flash('error', error.msg);
      });
      return res.redirect('/new-organization');
    }

    const { name, description, contactEmail } = req.body;
    const organizationId = await createOrganization(
      name,
      description,
      contactEmail,
      'placeholder-logo.png',
    );
    req.flash('success', 'Organization added successfully!');
    res.redirect(`/organization/${organizationId}`);
  } catch (error) {
    next(error);
  }
};

const processEditOrganizationForm = async (req, res, next) => {
  const organizationId = Number(req.params.id);
  if (!Number.isSafeInteger(organizationId) || organizationId < 1) {
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
      return res.redirect(`/edit-organization/${organizationId}`);
    }

    const { name, description, contactEmail, logoFilename } = req.body;
    const updatedId = await updateOrganization(
      organizationId,
      name,
      description,
      contactEmail,
      logoFilename,
    );
    if (!updatedId) {
      const error = new Error('Page Not Found');
      error.status = 404;
      next(error);
      return;
    }

    req.flash('success', 'Organization updated successfully!');
    res.redirect(`/organization/${updatedId}`);
  } catch (error) {
    next(error);
  }
};

export {
  showOrganizationsPage,
  showOrganizationPage,
  showNewOrganizationForm,
  showEditOrganizationForm,
  processNewOrganizationForm,
  processEditOrganizationForm,
  organizationValidation,
};
