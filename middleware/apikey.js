import * as dotenv from 'dotenv';
dotenv.config();

const apiKeyMiddleware = function (req, res, next) {
     const apiKey = req.headers["x-api-key"];
     const apiKeySign = process.env.API_KEY;
    if (apiKey && apiKeySign && apiKey == apiKeySign) {
        next();
    } else {
        return res.status(401).json({
            status: "ERROR",
            message: "Unauthorized"
        });
    }
}

export default apiKeyMiddleware;