const Task = require("../models/task.model");

exports.lastWeekReport = async( req, res, next )=>{
    try {
        const curretntDate = new Date();
        const lastWeek = new Date(curretntDate.getTime() - 7*24*60*60*1000);
        const tasks = await Task.find({ 
            status : "completed", 
            updatedAt: {$gte: lastWeek} 
        });

        if(!tasks){
            return res.status(400).json({error: "Task not found"});   
        }

        return res.status(201).json({
            message: tasks.length > 0  ?"Last week task fetched successfully": "No task was completed last week",
            count: tasks.length, 
            tasks: tasks
        });
    
    } catch (error) {
        next(error);
    }
}

exports.pendingReport = async( req, res , next ) =>{
    try {
        
        const tasks = await Task.find({ 
            status : {$ne: "completed"}, 
           });

        if(tasks.length == 0){
            return res.status(400).json({error: "Task not found"});   
        }

        const totalPendings = tasks.reduce((acc,curr)=>{
           return acc + curr.timeToComplete;
        },0);

        return res.status(201).json({
            message: "Task pending fetched successfully", 
            daysToComplete: totalPendings,
            totalTasks: tasks.length, 
            tasks: tasks
        });
    
    } catch (error) {
            next(error);
    }
}

exports.closedReports = async( req,res,next ) =>{
    try {
       const groupField = req.query.groupBy;

       if (!groupField) {
            return res.status(400).json({
                error: "Please provide groupBy (team/owner/project)"
            });
        }

        const tasks = await Task.aggregate([
            {
                $match: {status: "completed"}
            },
            {
                $group: {
                    _id: `$${groupField}`,
                    totalClosed: { $sum: 1 }
                }
            }
        ]);

        if(tasks.length == 0){
            return res.status(404).json({error: "No completed tasks found"});   
        }

        return res.status(200).json({
            message: "Closed tasks report fetched",  
            tasks: tasks
        });
    } catch (error) {
        next(error);
    }
}