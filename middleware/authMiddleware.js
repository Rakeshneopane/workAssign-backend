const jwt = require("jsonwebtoken");

exports.authMiddleware = ( req, res, next )=>{
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader){
                return res.status(401).json({
                error: "No token provided"
            });
        }
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                error: "Invalid token format"
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