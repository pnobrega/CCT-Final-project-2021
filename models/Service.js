const servicesCollection = require('../db').db().collection("services")
const ObjectID = require('mongodb').ObjectID
const User = require('./User')

let Service = function(data, userid){
    this.data = data
    this.errors = []
    this.userid = userid
}

Service.prototype.cleanUp = function(){
    // fields of the form
    if (typeof(this.data.make) != "string") {this.data.make = ""}
    if (typeof(this.data.model) != "string") {this.data.model = ""}
    if (typeof(this.data.licence) != "string") {this.data.licence = ""}
    if (typeof(this.data.engineType) != "string") {this.data.engineType = ""}
    if (typeof(this.data.dateService) != "string") {this.data.dateService = ""}
    if (typeof(this.data.comments) != "string") {this.data.comments = ""}
    

    // get rid off bogus properts
    this.data = {
        // fields of the form
        make: this.data.make.trim(),
        model: this.data.model.trim(),
        licence: this.data.licence.trim(),
        engineType: this.data.engineType.trim(),
        dateService: this.data.dateService,
        comments: this.data.comments.trim(),
        createdDate: new Date(),
        author: ObjectID(this.userid)
    }
}

Service.prototype.validate = function(){
    // fields of the form
    if (this.data.make == "") {this.errors.push("You must provide a make")}
    if (this.data.model == "") {this.errors.push("You must provide a model")}
    if (this.data.licence == "") {this.errors.push("You must provide a licence/plate")}
    if (this.data.engineType == "") {this.errors.push("You must choose a engine type")}
    if (this.data.dateService == "") {this.errors.push("You must choose a date for the service")}
}

Service.prototype.create = function(){
    return new Promise((resolve, reject) => {
        this.cleanUp()
        this.validate()
        if (!this.errors.length) {
            servicesCollection.insertOne(this.data).then(() => {
                resolve()
            }).catch(() => {
                this.errors.push("Prease try again later.")
                reject(this.errors)
            })
        } else {
            reject(this.errors)
        }
    })
    
}


Service.reusableServicesQuery = function(uniqueOperations, visitorId) {
    return new Promise(async function(resolve, reject){
        let aggOperations = uniqueOperations.concat([
            {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
            {$project: {
                // display service data
                make: 1,
                model: 1,
                licence: 1,
                engineType: 1,
                dateService: 1,
                comments: 1,
                createdDate: 1,
                authorId: "$author",
                author: {$arrayElemAt: ["$authorDocument", 0]} // shown the author object
            }}
        ])

        let services = await servicesCollection.aggregate(aggOperations).toArray()

        // clean up author property
        services = services.map(function(service){
            service.isVisitorOwner = service.authorId.equals(visitorId)
            service.author = {
                username: service.author.username
            }
            return service
        })
        resolve(services)
    })
}

Service.findSingleById = function(id, visitorId) {
    return new Promise(async function(resolve, reject){
        if (typeof(id) != "string" || !ObjectID.isValid(id)) {
            reject()
            return
        }
        
        let services = await Service.reusableServicesQuery([
            {$match: {_id: new ObjectID(id)}}
        ], visitorId)

        if (services.length) {
            console.log(services[0])
            resolve(services[0])
        } else {
            reject()
        }
    })
}

Service.findByAuthorId = function(authorId){
    return Service.reusableServicesQuery([
        {$match: {author: authorId}},
        {$sort: {createdDate: -1}}
    ])
}

module.exports = Service