import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
} from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';

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

const processNewOrganizationForm = async (req, res, next) => {
  try {
    const { name, description, contactEmail } = req.body;
    const organizationId = await createOrganization(
      name,
      description,
      contactEmail,
      'placeholder-logo.png',
    );
    res.redirect(`/organization/${organizationId}`);
  } catch (error) {
    next(error);
  }
};

export {
  showOrganizationsPage,
  showOrganizationPage,
  showNewOrganizationForm,
  processNewOrganizationForm,
};
