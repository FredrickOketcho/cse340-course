import {
  getAllCategories,
  getCategoryById,
  getProjectsByCategoryId,
  updateCategoryAssignments,
  createCategory,
  updateCategory,
} from '../models/categories.js';
import { getProjectDetails, getCategoriesByProjectId } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

const categoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 3, max: 80 })
    .withMessage('Category name must be between 3 and 80 characters'),
];

const showCategoriesPage = async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    res.render('categories', {
      title: 'Categories',
      currentPage: 'categories',
      categories,
    });
  } catch (error) {
    next(error);
  }
};

const showCategoryDetailsPage = async (req, res, next) => {
  const categoryId = Number(req.params.id);
  if (!Number.isSafeInteger(categoryId) || categoryId < 1) {
    const error = new Error('Page Not Found');
    error.status = 404;
    next(error);
    return;
  }

  try {
    const category = await getCategoryById(categoryId);
    if (!category) {
      const error = new Error('Page Not Found');
      error.status = 404;
      next(error);
      return;
    }

    const projects = await getProjectsByCategoryId(categoryId);
    res.render('category', {
      title: category.name,
      currentPage: 'categories',
      category,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

const showNewCategoryForm = (req, res) => {
  res.render('new-category', {
    title: 'Add New Category',
    currentPage: 'categories',
  });
};

const processNewCategoryForm = async (req, res, next) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      results.array().forEach((error) => req.flash('error', error.msg));
      return res.redirect('/new-category');
    }

    const categoryId = await createCategory(req.body.name);
    req.flash('success', 'Category added successfully!');
    res.redirect(`/category/${categoryId}`);
  } catch (error) {
    next(error);
  }
};

const showEditCategoryForm = async (req, res, next) => {
  const categoryId = Number(req.params.id);
  if (!Number.isSafeInteger(categoryId) || categoryId < 1) {
    const error = new Error('Page Not Found');
    error.status = 404;
    next(error);
    return;
  }

  try {
    const category = await getCategoryById(categoryId);
    if (!category) {
      const error = new Error('Page Not Found');
      error.status = 404;
      next(error);
      return;
    }
    res.render('edit-category', {
      title: 'Edit Category',
      currentPage: 'categories',
      category,
    });
  } catch (error) {
    next(error);
  }
};

const processEditCategoryForm = async (req, res, next) => {
  const categoryId = Number(req.params.id);
  if (!Number.isSafeInteger(categoryId) || categoryId < 1) {
    const error = new Error('Page Not Found');
    error.status = 404;
    next(error);
    return;
  }

  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      results.array().forEach((error) => req.flash('error', error.msg));
      return res.redirect(`/edit-category/${categoryId}`);
    }

    const updatedId = await updateCategory(categoryId, req.body.name);
    if (!updatedId) {
      const error = new Error('Page Not Found');
      error.status = 404;
      next(error);
      return;
    }
    req.flash('success', 'Category updated successfully!');
    res.redirect(`/category/${updatedId}`);
  } catch (error) {
    next(error);
  }
};

const showAssignCategoriesForm = async (req, res, next) => {
  const projectId = Number(req.params.projectId);
  if (!Number.isSafeInteger(projectId) || projectId < 1) {
    const error = new Error('Page Not Found');
    error.status = 404;
    next(error);
    return;
  }

  try {
    const [project, categories, assignedCategories] = await Promise.all([
      getProjectDetails(projectId),
      getAllCategories(),
      getCategoriesByProjectId(projectId),
    ]);
    if (!project) {
      const error = new Error('Page Not Found');
      error.status = 404;
      next(error);
      return;
    }

    res.render('assign-categories', {
      title: 'Assign Categories to Project',
      currentPage: 'projects',
      project,
      categories,
      assignedCategories,
    });
  } catch (error) {
    next(error);
  }
};

const processAssignCategoriesForm = async (req, res, next) => {
  const projectId = Number(req.params.projectId);
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

    const submittedIds = req.body.categoryIds === undefined
      ? []
      : Array.isArray(req.body.categoryIds)
        ? req.body.categoryIds
        : [req.body.categoryIds];
    const categoryIds = [...new Set(submittedIds.map((id) => Number(id)))];
    const categories = await getAllCategories();
    const validCategoryIds = new Set(categories.map((category) => category.category_id));
    if (categoryIds.some((id) => !Number.isSafeInteger(id) || !validCategoryIds.has(id))) {
      req.flash('error', 'Please select valid project categories.');
      return res.redirect(`/project/${projectId}/assign-categories`);
    }

    await updateCategoryAssignments(projectId, categoryIds);
    req.flash('success', 'Project categories updated successfully!');
    res.redirect(`/project/${projectId}`);
  } catch (error) {
    next(error);
  }
};

export {
  showCategoriesPage,
  showCategoryDetailsPage,
  showNewCategoryForm,
  processNewCategoryForm,
  showEditCategoryForm,
  processEditCategoryForm,
  categoryValidation,
  showAssignCategoriesForm,
  processAssignCategoriesForm,
};
