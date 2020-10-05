const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
    //Get token from the header
    const token = req.header('x-auth-token');

    //Check if no token 
    if(!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    //verify the token
    try {
      const decoded = jwt.verify(token, config.get('jwtSecret'));
      
      req.user = decoded.user;
      console.log('Hi!')
      next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
    
};