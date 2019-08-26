const Follow = require('../models/Follow');

exports.addFollow = function(req, res) {
    let follow = new Follow(req.params.username, req.visitorID);
    follow.create().then(() => {
        req.flash('success', `Successfully folllowed ${req.params.username}`);
        req.session.save(() => res.redirect(`/profile/${req.params.username}`))
    }).catch(errors => {
        errors.forEach(error => {
            req.flash('errors', error);
        });
        req.session.save(() => res.redirect('/'));
    })
};

exports.removeFollow = function(req, res) {
    let follow = new Follow(req.params.username, req.visitorID);
    follow.delete().then(() => {
        req.flash('success', `Successfully stopped folowing ${req.params.username}`);
        req.session.save(() => res.redirect(`/profile/${req.params.username}`))
    }).catch(errors => {
        errors.forEach(error => {
            req.flash('errors', error);
        });
        req.session.save(() => res.redirect('/'));
    })
};