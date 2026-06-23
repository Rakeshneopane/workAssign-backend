const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { initialiseDatabase } = require("./dbConnect/dbConnect");

const errorHandler = require("./middleware/errorHandler");

const userRoutes = require("./routes/userRoute");
const taskRoutes = require("./routes/taskRoute");
const teamRoutes = require("./routes/teamRoute");
const projectRoutes = require("./routes/projectRoute");
const tagsRoutes = require("./routes/tagsRoute");
const reportRoutes = require("./routes/reportRoute");


const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

app.use(async (req, res, next) => {
    try {
        await initialiseDatabase();
        next();
    } catch (err) {
        res.status(500).json({ error: "Database connection failed" });
    }
});


const PORT = process.env.PORT || 3000;

app.get("/", (req,res)=>{
    res.send("Work-assign API is live")
});

app.use("/api/auth", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tags", tagsRoutes);
app.use("/api/report", reportRoutes);

app.use(errorHandler);

// app.listen(PORT, ()=>{
//     console.log(`Server runniing on Port: ${PORT}`);
// });

module.exports = app;