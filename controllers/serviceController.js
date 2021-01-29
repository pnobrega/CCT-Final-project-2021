const Service = require('../models/Service')

exports.viewCreateScreen = function(req, res){
    res.render('create-service')
}
exports.create = function(req, res){
    let service = new Service(req.body, req.session.user._id)
    service.create().then(function(newId){
        req.flash("success", "New service successfully created.")
        req.session.save(() => res.redirect(`/service/${newId}`))
    }).catch(function(errors){
        errors.forEach(error => req.flash("errors", error))
        req.session.save(() => res.redirect("/create-service"))
    })
}

exports.viewSingle = async function(req, res) {
    try {
        let service = await Service.findSingleById(req.params.id, req.visitorId)
        res.render('single-service-screen', {service: service})
    } catch {
        res.render('404')
    }
}

exports.viewEditScreen = async function(req, res) {
    try{
        let service = await Service.findSingleById(req.params.id)
        if(service.authorId == req.visitorId){
            res.render('edit-service', {service: service})
        } else{
            req.flash("errors", "You do not have permission to perform that action.")
            req.session.save(() => res.redirect("/"))
        }
    } catch {
        res.render('404')
    }
}

exports.edit = async function(req, res) {
    let service = new Service(req.body, req.visitorId, req.params.id)
    service.update().then((status) => {
        // the service was successfully updated in the database
        if (status == "success") {
            // service was updated in db
            req.flash("success", "Service successfully updated.")
            req.session.save(function() {
                res.redirect(`/service/${req.params.id}/edit`)
            })
            } else {
            service.errors.forEach(function(error) {
                req.flash("errors", error)
            })
            req.session.save(function() {
                 res.redirect(`/service/${req.params.id}/edit`)
            })
          }

    }).catch(() => {
        // a service doesnt exist or the visitor is not the owner
        req.flash("errors", "You do not have the permission to perform that action.")
        req.session.save(function(){
            res.redirect("/")
        })
    })
}