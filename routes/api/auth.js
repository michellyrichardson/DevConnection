//will handle getting a JSONwebtoken for authentication
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
// @route   POST api/auth
// @desc    Authenticate User & get token
// @access  value Public - a public route don't need a token for
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post(
    '/',
   [
    check('email', 'please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
   ], 
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        //See if user exists
        let user = await User.findOne({ email });
        if(!user) {
            return res
                .status(400)
                .json({ error: [{ msg: 'Invalid Credentials' }] });
        }
        
        //check password match
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res
                .status(400)
                .json({ error: [{ msg: 'Invalid Credentials' }] });
        }

        //Return jsonwebtoken cause in the front, when user register
        //i want them login right the way
        const payload = {
            user: {
                id: user.id
            }
        };

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