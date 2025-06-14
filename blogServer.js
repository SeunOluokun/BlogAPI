const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Blog = require('./models/blog');
const User = require('./models/user');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const setUser = require('./middleware/setUser');
const methodOverride = require('method-override');
const { connectToDatabase } = require('./mongoDbConnect');
const buildPaginatedQuery = require("./utils/paginateQuery");
const blogRoutes = require('./controllers/blogController');
const authRoutes = require('./controllers/authController');
const authMiddleware = require('./middleware/auth');

require('dotenv').config();
const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use('/blogs', blogRoutes);
app.use('/auth', authRoutes);
app.use(setUser);
app.use(authMiddleware({ required: false }));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 60 * 60 * 1000 },
    })
);

app.set('view engine', 'ejs');
app.set('views', 'views');


connectToDatabase();


app.get('/', (req, res) => res.send('App is running'));

app.get('/', async (req, res) => {
  try {
    const { author, title, tags } = req.query;
    const authors = await User.find().select('first_name last_name');

    const { query, sort, pagination, currentPage } = buildPaginatedQuery({
    queryParams: req.query,
    sortableFields: ['read_count', 'reading_time', 'timestamp'],
    });
    const state = 'published';
    query.state = state;

    let user = null;
    const token = req.cookies.token;

    const totalBlogs = await Blog.countDocuments(query);
    const hasNextPage = pagination.skip + pagination.limit < totalBlogs;
    const hasPrevPage = pagination.skip > 0;


    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.userId).select('first_name last_name email');
      } catch (err) {
        console.warn('Invalid or expired token:', err.message);
      }
    }

    const blogs = await Blog.find(query)
      .populate('author', 'first_name last_name email')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);

    res.render('index', {
        user,
        state,
        blogs,
        authors, 
        author: req.query.author || null,
        title: req.query.title || '',
        tags: req.query.tags || '',
        currentPage,
        hasNextPage,
        hasPrevPage,
        requestUrl: req.originalUrl
    });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).send('Internal Server Error: Unable to load published blogs.');
  }
});

app.get('/login', (req, res) => {
    res.render('login', { user: res.locals.user });
});

app.get('/signup', (req, res) => {
    res.render('signup', { user: res.locals.user });
});

app.get('/create', authMiddleware({ required: true }), (req, res) => {
    if (!res.locals.user) {
        return res.redirect('/login');
    }
    res.render('create', { user: res.locals.user });
});

app.get('/edit/:id', authMiddleware({ required: true }), async (req, res) => {
    if (!res.locals.user) {
        return res.redirect('/login');
    }

    const { page = 1, limit = 20, author, title, tags, orderBy, _id } = req.query;
    const query = {};

    if (_id) query._id = _id;
    if (author) query.author = author;
    if (title) query.title = new RegExp(title, 'i');
    if (tags) query.tags = { $in: tags.split(',') };

    const user = res.locals.user;
    const blogId = req.params.id;

    const blog = await Blog.findById(blogId)
        .populate('author', 'first_name last_name email')
        .skip((page - 1) * limit)
        .limit(Number(limit));

    if (!blog) {
        return res.status(404).send('Blog not found');
    }

    if (blog.author._id.toString() !== res.locals.user._id.toString()) {
        return res.status(403).send('Unauthorized');
    }

    res.render('edit', {
        user,
        blog,
    });
});

app.get('/logout', authMiddleware({ required: true }), (req, res) => {
    try {
        res.clearCookie('token');
        req.session?.destroy(() => {
            res.redirect('/');
        });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).send('Error logging out');
    }
});
app.listen(PORT, () => {
    console.log(`Blog server is running on http://localhost:${PORT}`);
});
