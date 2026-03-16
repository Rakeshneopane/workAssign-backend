const joi = require("joi");
const Team = require("../models/team.model");

const teamSchema = joi.object({
    name: joi.string().min(3).required(),
    description: joi.string().min(15).required()
});

exports.postTeam = async( req, res, next )=>{
    try {
        const { error,value } = teamSchema.validate(req.body);
        if(error){
            return res.status(400).json({ 
                error: error.details[0].message
            });
        }

        const newTeam = await new Team(value).save();
        
        if(!newTeam){
            return res.status(400).json({ error: "Failed to create team: DB error" });
        }
        return res.status(201).json({message: "Team created successfully", team: newTeam});
    
    } catch (error) {
        next(error);
    }
}

exports.getTeams = async( req, res, next ) =>{
    try {
        
        const allTeams = await Team.find();
        
        return res.status(200).json({message: "Team fetched sucessfully", count: allTeams.length, teams: allTeams});
    
    } catch (error) {
            next(error);
    }
}

exports.getTeamById = async( req, res, next ) =>{
    try {
        const id = req.params.id;
        const teamById = await Team.findById(id);
        
        return res.status(200).json({
            message: "Team fetched sucessfully", 
            teams: teamById
        });
    
    } catch (error) {
            next(error);
    }
}

exports.updateTeam = async( req,res, next ) =>{
    try {
        const { error,value } = teamSchema.validate(req.body);
        
        if(error){
            return res.status(400).json({ 
                error: error.details[0].message 
            });
        }

        const teamId = req.params.id;
        
        const updatedTeam = await Team.findByIdAndUpdate(
            teamId, 
            value, 
            { new: true }
        );
        
        if(!updatedTeam){
            return res.status(404).json({
                 error: "Team not found"
                });
        }
        return res.status(200).json({ 
            message: "Team updated successfully", 
            team: updatedTeam 
        });
    } catch (error) {
        next(error);
    }
}

exports.deleteTeam = async( req,res, next ) =>{
    try {
        const teamId = req.params.id;

        const deletedTeam = await Team.findByIdAndDelete(teamId);
        if(!deletedTeam){
            return res.status(404).json({ error: "Team not found" });
        }

        return res.status(200).json({message: "Team deleted Successfully", team: deletedTeam });
    } catch (error) {
        next(error);
    }
}