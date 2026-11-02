import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { getAllCategories } from './src/models/categories.js';
import { getAllOrganizations } from './src/models/organizations.js';
import { getAllProjects } from './src/models/projects.js';

const nodeEnv = process.env.NODE_ENV?.toLowerCase() || 'production';
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewsPath = path.join(__dirname, 'src', 'views');

const app = express();

app.set('view engine', 'ejs');
app.set('views', viewsPath);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('home', { title: 'Home', currentPage: 'home' });
});

app.get('/organizations', async (req, res, next) => {
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
});

app.get('/projects', async (req, res, next) => {
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
});

app.get('/categories', async (req, res, next) => {
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
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) {
    next(error);
    return;
  }
  res.status(500).send('Unable to load the requested page.');
});

app.listen(port, () => {
  console.log(`Server is running at http://127.0.0.1:${port}`);
  console.log(`Environment: ${nodeEnv}`);
});
