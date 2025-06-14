const jwt = require('jsonwebtoken');
const express = require('express');
const authRouter = express.Router();
require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../models/user');

authRouter.post('/signup', async (req, res) => {
    try
    {
        const user = req.body;

        existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
            return res.status(400).send('User already exists, Please Login <a href="/login">here</a>');
        }
        const newUser = new User({
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    password: user.password
                });

                await newUser.save();

                res.status(201).redirect('/login'); // Redirect to login page after successful signup
        //res.status(201).send('User created successfully. Login on Login Page');
    }
    catch(err)
    {
        console.log(err);
        res.status(404).send('Signup Failed');
    }
// res.send('Signed in!')
  //res.render('signup');
});

authRouter.post('/login', async (req, res) => {
try
{
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    

    if (!user) {
        return res.status(404).send('User not found, <a href="/login">Login<a/> again');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: true });

    res.status(200).redirect('/'); // Redirect to home page after successful login
}
catch(err)
{
    console.log(err);
    res.status(500).send('Internal Server Error');
}

    // res.send('Logged In!');
  //res.render('login');
});

module.exports = authRouter;