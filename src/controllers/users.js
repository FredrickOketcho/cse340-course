import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { authenticateUser, createUser, getAllUsers } from '../models/users.js';

const userRegistrationValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ max: 100 })
    .withMessage('Name must be 100 characters or fewer.'),
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Enter a valid email address.')
    .isLength({ max: 100 })
    .withMessage('Email must be 100 characters or fewer.'),
  body('password')
    .isString()
    .withMessage('Password is required.')
    .isLength({ min: 7 })
    .withMessage('Password must be at least 7 characters.')
    .custom((password) => Buffer.byteLength(password, 'utf8') <= 72)
    .withMessage('Password must be 72 bytes or fewer.'),
];

const showUserRegistrationForm = (req, res) => {
  res.render('register', { title: 'Register', currentPage: 'register' });
};

const processUserRegistrationForm = async (req, res, next) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    validation.array().forEach(({ msg }) => req.flash('error', msg));
    return res.redirect('/register');
  }

  const { name, email, password } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await createUser(name, email, passwordHash);
    req.flash('success', 'Registration successful! You can now log in.');
    return res.redirect('/');
  } catch (error) {
    if (error.code === '23505') {
      req.flash('error', 'An account with that email already exists.');
      return res.redirect('/register');
    }
    return next(error);
  }
};

const showLoginForm = (req, res) => {
  res.render('login', { title: 'Log In', currentPage: 'login' });
};

const processLoginForm = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await authenticateUser(email, password);
    if (!user) {
      req.flash('error', 'Email or password is incorrect.');
      return res.redirect('/login');
    }

    // Start a fresh session after authentication to prevent session fixation.
    return req.session.regenerate((error) => {
      if (error) return next(error);
      req.session.user = user;
      req.flash('success', 'Login successful.');
      console.log('Authenticated user ID:', user.user_id);
      return req.session.save((saveError) => {
        if (saveError) return next(saveError);
        return res.redirect('/dashboard');
      });
    });
  } catch (error) {
    return next(error);
  }
};

const processLogout = (req, res, next) => {
  const currentSession = req.session;
  currentSession.destroy((destroyError) => {
    if (destroyError) return next(destroyError);

    // A fresh session lets the one-time logout flash survive the redirect.
    return currentSession.regenerate((regenerateError) => {
      if (regenerateError) return next(regenerateError);
      req.flash('success', 'You have been logged out.');
      return req.session.save((saveError) => {
        if (saveError) return next(saveError);
        return res.redirect('/login');
      });
    });
  });
};

const requireLogin = (req, res, next) => {
  if (!req.session?.user) {
    req.flash('error', 'You must be logged in to access that page.');
    return res.redirect('/login');
  }
  return next();
};

const requireRole = (role, redirectTo = '/') => (req, res, next) => {
  if (req.session?.user?.role_name === role) {
    return next();
  }

  req.flash('error', 'You are not authorized to access that page.');
  return res.redirect(redirectTo);
};

const showDashboard = (req, res) => {
  const { name, email } = req.session.user;
  res.render('dashboard', {
    title: 'Dashboard',
    currentPage: 'dashboard',
    name,
    email,
  });
};

const showUsersPage = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    return res.render('users', {
      title: 'Registered Users',
      currentPage: 'users',
      users,
    });
  } catch (error) {
    return next(error);
  }
};

export {
  showUserRegistrationForm,
  processUserRegistrationForm,
  userRegistrationValidation,
  showLoginForm,
  processLoginForm,
  processLogout,
  requireLogin,
  requireRole,
  showDashboard,
  showUsersPage,
};
