const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// @router POST api/users/register
// @desc   Register users route
// @access Public

router.post('/register', (req, res) => {

    let errors = {};
    
    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            errors.email = 'Email already exists';
            res.json(errors);

        } else {
            let avatar;
            if (!req.body.avatar) {
              avatar = gravatar.url(req.body.email, {
                s: 200,       // size
                r: 'pg',      // rating
                d: 'mm'       // default
              });
            }

            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar: req.body.avatar || avatar,
                password: req.body.password,
            });
            
            bcrypt.genSalt(10, (err, salt) => {
                if (err) throw err;
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save()
                        .then(user => res.json(user.email))
                        .catch(err => console.log(err))
                })
            })
        }
    })
});

// @router POST api/users/login
// @desc   Login user / return jwt
// @access Public
router.post('/login', (req, res) => {
    
    const email = req.body.email;
    const password = req.body.password;
    
    let errors = {};

    User.findOne({ email })
        .then(user => {
            if (!user) {
                errors.email = 'User not found';
                res.json(errors);
            } 

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        // User matched

                        // Create payload
                        const payload = {
                            id : user.id, 
                            name: user.name, 
                            avatar: user.avatar
                        };
                        
                        // Sign token
                        res.json(user);

                    } else {
                        errors.password = 'Password incorrect';
                        res.json(errors);
                    }                
                })
        })
});

module.exports = router;