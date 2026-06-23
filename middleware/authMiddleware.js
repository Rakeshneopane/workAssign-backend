const jwt = require("jsonwebtoken");

exports.authMiddleware = ( req, res, next )=>{
    try {
        let token;
        if(req.cookies?.jwt_token){
            token = req.cookies.jwt_token;
        }
        else if (req.headers.authorization) {
            token = req.headers.authorization.split(" ")[1];
        }
        if(!token){
                return res.status(401).json({
                error: "No token provided"
            });
        }
        const decode = jwt.verify(token, process.env.secretKey);

        req.user = decode;
        next();
    } catch (error) {
        // Log the actual error for debugging
        console.error("JWT Verification Error:", error.message);

        // Handle specific JWT errors
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired. Please log in again." });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token." });
        }

        //Hanlde actual server issue
        return res.status(500).json({ error: "Internal server error." });
    }
}