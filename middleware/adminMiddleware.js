exports.isAdmin = (req,res,next)=>{
    if(req.user.role !== "admin" ){
        console.log({error: "Access Denied: Admin only"});
        return res.status(403).json({
            error: "Access Denied: Admin only"
        })
    }
    next();
}