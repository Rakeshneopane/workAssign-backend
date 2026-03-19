const Task = require("../models/task.model");

// In lastWeekReport - add day grouping
exports.lastWeekReport = async (req, res, next) => {
    try {
        const currentDate = new Date();
        const lastWeek = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const tasks = await Task.find({
            status: "completed",
            updatedAt: { $gte: lastWeek }
        });

        // Group by day name
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const byDay = days.reduce((acc, d) => ({ ...acc, [d]: 0 }), {});
        
        tasks.forEach(t => {
            const day = days[new Date(t.updatedAt).getDay()];
            byDay[day]++;
        });

        return res.status(200).json({
            message: tasks.length > 0 ? "Last week tasks fetched" : "No tasks completed last week",
            count: tasks.length,
            byDay,
            tasks
        });
    } catch (error) {
        next(error);
    }
};

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

/** exports.closedReports = async (req, res, next) => {
    try {
        const groupField = req.query.groupBy;

        if (!groupField) {
            return res.status(400).json({
                error: "Please provide groupBy (team/owners/project)"
            });
        }

        // Map groupBy param to the correct collection
        const lookupMap = {
            project: { from: "projects", field: "project" },
            team:    { from: "teams",    field: "team"    },
            owners:  { from: "users",    field: "owners"  },
        };

        const lookup = lookupMap[groupField];

        if (!lookup) {
            return res.status(400).json({
                error: "Invalid groupBy. Use: team, owners, or project"
            });
        }

        const tasks = await Task.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: `$${lookup.field}`,
                    totalClosed: { $sum: 1 }
                }
            },
            // For owners, _id is an array so unwind first
            ...(groupField === "owners" ? [{ $unwind: "$_id" }] : []),
            {
                $lookup: {
                    from: lookup.from,
                    localField: "_id",
                    foreignField: "_id",
                    as: "details"
                }
            },
            { $unwind: "$details" },
            {
                $project: {
                    _id: 1,
                    totalClosed: 1,
                    name: "$details.name"  // pull name from the joined document
                }
            }
        ]);

        if (tasks.length === 0) {
            return res.status(404).json({ error: "No completed tasks found" });
        }

        return res.status(200).json({
            message: "Closed tasks report fetched",
            groupBy: groupField,
            tasks
        });

    } catch (error) {
        next(error);
    }
}; */