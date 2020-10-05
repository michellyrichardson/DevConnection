//will handle users, add users, register...
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route   POST api/users
// @desc    Register User
// @access  value Public - a public route don't need a token for

router.post('/', [
    check('name', 'Name is required')
        .not()
        .isEmpty(),
    check('email', 'please include a valid email').isEmail(),
    check('password', 'Password need to be at least 6 characters')
        .isLength({ min: 6 })
], 
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
        //See if user exists
        let user = await User.findOne({ email });
        if(user) {
            return res
                .status(400)
                .json({ error: [{ msg: 'User already exists' }] });
        }
        //Get users gravatar based on email
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        user = new User({
            name,
            email,
            avatar,
            password
        });
        //Encrypt password with bcrypt
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        //Return jsonwebtoken cause in the front, when user register
        //i want them login right the way
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if(err) throw err;
                res.json({ token });
            }
           );
        } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
        }
    }
);

module.exports = router;