import {
  getAllCategories,
  getCategoryById,
  getProjectsByCategoryId,
} from '../models/categories.js';

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

export { showCategoriesPage, showCategoryDetailsPage };
