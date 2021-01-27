const { post } = require('../app')
const Service = require('../models/Service')

exports.viewCreateScreen = function(req, res){
    res.render('create-service')
}
exports.create = function(req, res){
    let service = new Service(req.body, req.session.user._id)
    service.create().then(function(){
        res.send("New service created.")
    }).catch(function(errors){
        res.send(errors)
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
    res.render('edit-service', {service: service})
    } catch {
        res.render('404')
    }
}

exports.edit = async function(req, res) {
    let service = new Service(req.body)
    service.update().then((status) => {
        // the service was successfully updated in the database


    }).catch(() => {
        // a service doesnt exist or the visitor is not the owner
        req.flash("errors", "You do not have the permission to perform that action.")
        req.session.save(function(){
            res.redirect("/")
        })
    })
}