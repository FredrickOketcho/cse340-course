import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

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

app.get('/organizations', (req, res) => {
  res.render('organizations', { title: 'Organizations', currentPage: 'organizations' });
});

app.get('/projects', (req, res) => {
  res.render('projects', { title: 'Service Projects', currentPage: 'projects' });
});

app.get('/categories', (req, res) => {
  res.render('categories', { title: 'Categories', currentPage: 'categories' });
});

app.listen(port, () => {
  console.log(`Server is running at http://127.0.0.1:${port}`);
  console.log(`Environment: ${nodeEnv}`);
});
