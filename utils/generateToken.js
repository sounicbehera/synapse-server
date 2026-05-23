const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    // jwt.sign takes the data we want to hide (user id) and mixes it with our secret key
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d", // Token is valid for 30 days
    });
};

module.exports = generateToken;