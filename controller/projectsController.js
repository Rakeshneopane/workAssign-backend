const joi = require("joi");
const Project = require("../models/project.model");

const projectSchema = joi.object({
    name: joi.string().min(3).required(),
    description: joi.string().min(15).required()
});

exports.postProject = async( req, res, next )=>{
    try {
        const { error,value } = projectSchema.validate(req.body);
        if(error){
            return res.status(400).json({ 
                error: error.details[0].message
            });
        }

        const newProject = await new Project(value).save();
        
        return res.status(201).json({
            message: "Project created successfully",
            project: newProject
        });
    
    } catch (error) {
        next(error);
    }
}

exports.getProjects = async( req, res, next ) =>{
    try {
        
        const allProjects = await Project.find();
        
        return res.status(200).json({
            message: "Projects fetched successfully", 
            count: allProjects.length, 
            projects: allProjects
        });
    
    } catch (error) {
            next(error);
    }
}

exports.getProjectById = async( req, res, next ) =>{
    try {
        const id = req.params.id;
        const project = await Project.findById(id);
        
        return res.status(200).json({
            message: "Project fetched successfully",  
            project: project
        });
    
    } catch (error) {
            next(error);
    }
}

exports.updateProject = async( req,res,next ) =>{
    try {
        const { error,value } = projectSchema.validate(req.body);
        
        if(error){
            return res.status(400).json({ 
                error: error.details[0].message 
            });
        }

        const projectId = req.params.id;
        
        const updatedProject = await Project.findByIdAndUpdate(
            projectId, 
            value, 
            { new: true }
        );
        
        if(!updatedProject){
            return res.status(404).json({
                 error: "Project not found"
                });
        }
        return res.status(200).json({ 
            message: "Project updated successfully", 
            project: updatedProject 
        });
    } catch (error) {
        next(error);
    }
}

exports.deleteProject = async( req,res, next ) =>{
    try {
        const projectId = req.params.id;

        const deletedProject = await Project.findByIdAndDelete(projectId);
        if(!deletedProject){
            return res.status(404).json({ error: "Project not found" });
        }

        return res.status(200).json({message: "Project deleted Successfully", project: deletedProject });
    } catch (error) {
        next(error);
    }
}