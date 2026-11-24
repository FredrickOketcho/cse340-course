import bcrypt from 'bcrypt';
import pool from '../database.js';

const createUser = async (name, email, passwordHash) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role_id)
    SELECT $1, $2, $3, role_id
    FROM roles
    WHERE role_name = $4
    RETURNING user_id`,
    [name, email, passwordHash, 'user'],
  );

  if (result.rows.length === 0) {
    throw new Error('Failed to create user: the default user role is missing.');
  }

  if (process.env.ENABLE_SQL_LOGGING === 'true') {
    console.log('Created new user with ID:', result.rows[0].user_id);
  }

  return result.rows[0].user_id;
};

const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name
    FROM users AS u
    JOIN roles AS r ON r.role_id = u.role_id
    WHERE u.email = $1`,
    [email],
  );
  return result.rows[0] ?? null;
};

const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT u.name, u.email, r.role_name
    FROM users AS u
    JOIN roles AS r ON r.role_id = u.role_id
    ORDER BY u.name, u.email`,
  );
  return result.rows;
};

const verifyPassword = async (password, passwordHash) => (
  bcrypt.compare(password, passwordHash)
);

const authenticateUser = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return null;
  }

  const { password_hash: passwordHash, ...authenticatedUser } = user;
  return authenticatedUser;
};

export { createUser, authenticateUser, getAllUsers };
