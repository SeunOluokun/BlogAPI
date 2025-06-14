const express = require('express');
const blogRouter = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const Blog = require('../models/blog');
const authMiddleware = require('../middleware/auth');
const { Types } = require('mongoose');
const buildPaginatedQuery = require("../utils/paginateQuery");


const calculateReadingTime = (text) => {
  const wordsPerMinute = 200;
  const words = text.trim().split(' ').filter(word => word !== '').length;
  return `${Math.ceil(words / wordsPerMinute)} min read`;
};


blogRouter.get('/:id',authMiddleware({ required: false }), async (req, res) => {//no login needed 
 
 const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid blog ID');
  }

  try {
    const blog = await Blog.findById(id).populate('author', 'first_name last_name email');

    if (!blog ) {
      return res.status(404).send('Blog not found, please go back to app <a href="/">here</a>');
    }

    blog.read_count += 1;
    await blog.save();

    console.log(res.locals.user );
   //res.render('blog', { blog, user: blog.author || null });
   res.render('blog', { blog, user: res.locals.user });
    //res.render('index', { blogs: [blog], user: req.user || null });
    
  } catch (err) {
    console.error('Error fetching blog by ID:', err);
    res.status(500).send('Server error while fetching blog');
  }
    //render blog.ejs as var name blog with all details
});

//Get My Blogs
blogRouter.get('/', authMiddleware({ required: true }), async (req, res) => {
  try {
    const {
      state,
      page = 1,
      limit = 10,
      sortBy = 'timestamp',
      order = 'desc',
      author,
      title,
      tags
    } = req.query;

    const currentPage = parseInt(page, 10);
    const perPage = parseInt(limit, 10);
    const sortOrder = order === 'asc' ? 1 : -1;

    // Safely build the query object
    const filter = {
       author: res.locals.user._id 
    };

    if (author && mongoose.Types.ObjectId.isValid(author)) {
      filter.author = author;
      
    }

    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }

    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }

    if (state) {
      filter.state = state;
    }

    // Count total matching blogs
    const totalBlogs = await Blog.countDocuments(filter);

    // Fetch paginated results
    const blogs = await Blog.find(filter)
      .populate('author', 'first_name last_name email')
      .sort({ [sortBy]: sortOrder })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    // Render results
    res.render('index', {
      user: res.locals.user,
      blogs,
      state: req.query.state || '',
      author: req.query.author || '',
      title: req.query.title || '',
      tags: req.query.tags || '',
      currentPage,
      hasNextPage: currentPage * perPage < totalBlogs,
      hasPrevPage: currentPage > 1,
      requestUrl: req.originalUrl
    });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).send('Internal Server Error: Unable to load user blogs.');
  }
});


//Update Blog
blogRouter.put('/:id',authMiddleware({ required: true }), async (req, res) => {
    
    const { id } = req.params;
  const { title, body, tags , state} = req.body;

  console.log('PUT /blogs/:id hit');

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid blog ID');
  }

  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).send('Blog not found');
    }

    // Only the author can edit, no other user
    if (blog.author.toString() !== res.locals.user._id.toString()) {
      return res.status(403).send('Unauthorized: You cannot edit this blog');
    }

    // Update fields
    blog.title = title;
    blog.body = body;
    blog.state= state;
    blog.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];

    await blog.save()

    console.log(':id', id);

    res.redirect(`/blogs/${id}`);//view updated blog
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(500).send('Internal Server Error');
  }
    //render index
    }
);

//Create Blog
blogRouter.post('/',authMiddleware({ required: true }), async (req, res) => {
  const { title, body, description, tags, state } = req.body;

  if (!req.user) return res.redirect('/login');
  if (!title || !body) return res.status(400).send('Title and body are required');

  const existingBlog = await Blog.findOne({ title });
  if (existingBlog) {
    return res.status(400).send('A blog with this title already exists please create unique blog title <a href="/create">here</a>');
  }

  console.log('Creating blog with data:', { title, body, description, tags }, { author: req.user });
  try {
    const blog = await Blog.create({
      title,
      body,
      description,
      tags: tags?.split(',').map(tag => tag.trim()),
      author: req.user.userId,
      state,
      reading_time: calculateReadingTime(body),
      read_count: 0
    });

    res.redirect('/');
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(400).send(`Error creating blog! => ${err.message}`);
  }

    //render index
});

//Delete Blog
blogRouter.delete('/:id',authMiddleware({ required: true }), async (req, res) => {
    
   try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid blog ID');
    }

    const authorId = res.locals.user._id;
    //const user = res.locals.user;
    const blog = await Blog.findById(id);//query

    if (!blog) {
      return res.status(404).send('Blog not found');
    }

    if (blog.author.toString() !== authorId.toString()) {
      return res.status(403).send('Not Authorized to Delete Blog you did not create. return to the <a href="/">Home</a> page ');
    }

    await blog.deleteOne();
    res.redirect('/');

  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).send('Server error while deleting blog');
  }
});


module.exports = blogRouter;