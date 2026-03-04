const joi = require("joi");
const Task = require("../models/task.model");

const taskSchema = joi.object({
    name: joi.string().min(3).required(),

    project: joi.string().min(5).required(),
    
    team: joi.string()
        .length(24)
        .pattern(/^[0-9a-fA-f]+$/)
        .required(),
    
    owners: joi.array()
        .items(joi.string())
            .default([]),

    tags: joi.array()
        .items(joi.string())
            .default([]),

    timeToComplete: joi.number()
        .min(1)
        .required(),

    status: joi.string().required(),

});

exports.postTask = async( req, res, next )=>{
    try {
        const { error,value } = taskSchema.validate(req.body);
        if(error){
            return res.status(400).json({ 
                error: error.details[0].message
            });
        }

        const newTask = await new Task(value).save();
        
        if(!newTask){
            return res.status(400).json({ error: "Failed to create task: DB error" });
        }
        return res.status(201).json({message: "Task created successfully", task: newTask});
    
    } catch (error) {
        next(error);
    }
}

exports.getTasks = async( req, res, next ) =>{
    try {

        const filters = {};
        
        if(req.query.team) filters.team = req.query.team;
        if(req.query.owner) filters.owners = req.query.owner;
        if(req.query.tags) filters.tags = req.query.tags;
        if(req.query.projects) filters.projects = req.query.projects;
        if(req.query.status) filters.status = req.query.status;
        
        const allTasks = await Task.find(filters);
        
        return res.status(200).json({message: "All Tasks fetched sucessfully", count: allTasks.length, tasks: allTasks});
    
    } catch (error) {
            next(error);
    }
}

exports.getTask = async( req, res, next ) =>{
    try {

        const id = req.params.id;
        const task = await Task.findById(id);
        
        return res.status(200).json({
            message: "Task fetched sucessfully", 
            tasks: task
        });
    
    } catch (error) {
            next(error);
    }
}

exports.updateTask = async( req,res,next ) =>{
    try {
        const { error,value } = taskSchema.validate(req.body);
        
        if(error){
            return res.status(400).json({ 
                error: error.details[0].message 
            });
        }

        const taskId = req.params.id;
        
        const updatedTask = await Task.findByIdAndUpdate(
            taskId, 
            value, 
            { new: true }
        );
        
        if(!updatedTask){
            return res.status(404).json({
                 error: "Task not found"
                });
        }
        return res.status(200).json({ 
            message: "Task updated sucessfully", 
            task: updatedTask 
        });
    } catch (error) {
        next(error);
    }
}

exports.deleteTask = async( req,res, next ) =>{
    try {
        const taskId = req.params.id;

        const deletedTask = await Task.findByIdAndDelete(taskId);
        if(!deletedTask){
            return res.status(404).json({ error: "Task not found" });
        }

        return res.status(200).json({message: "Task deleted Successfully", task: deletedTask });
    } catch (error) {
        next(error);
    }
}