const joi = require("joi");
const Tag = require("../models/tags.model");

const tagSchema = joi.object({
    name: joi.string().min(3).required(),
});

exports.postTags = async( req, res, next )=>{
    try {
        const { error,value } = tagSchema.validate(req.body);
        if(error){
            return res.status(400).json({ 
                error: error.details[0].message
            });
        }

        const existing = await Tag.findOne({ name: value.name });
            if(existing){
            return res.status(409).json({ error: "Tag already exists" });
        }

        const newTag = await new Tag(value).save();
        
        return res.status(201).json({
            message: "Tag created successfully",
            tag: newTag
        });
    
    } catch (error) {
        next(error);
    }
}

exports.getTags = async( req, res, next ) =>{
    try {
        
        const alltags = await Tag.find();
        
        return res.status(200).json({
            message: "Tags fetched successfully", 
            count: alltags.length, 
            tags: alltags
        });
    
    } catch (error) {
            next(error);
    }
}

exports.updateTags = async( req,res,next ) =>{
    try {
        const { error,value } = tagSchema.validate(req.body);
        
        if(error){
            return res.status(400).json({ 
                error: error.details[0].message 
            });
        }

        const tagId = req.params.id;
        
        const updatedTag = await Tag.findByIdAndUpdate(
            tagId, 
            value, 
            { new: true }
        );
        
        if(!updatedTag){
            return res.status(404).json({
                 error: "Tag not found"
                });
        }
        return res.status(200).json({ 
            message: "Tag updated successfully", 
            tag: updatedTag 
        });
    } catch (error) {
        next(error);
    }
}

exports.deleteTags = async( req,res,next ) =>{
    try {
        const tagId = req.params.id;

        const deletedTag = await Tag.findByIdAndDelete(tagId);
        if(!deletedTag){
            return res.status(404).json({ error: "Tag not found" });
        }

        return res.status(200).json({message: "Tag deleted Successfully", tag: deletedTag });
    } catch (error) {
        next(error);
    }
}