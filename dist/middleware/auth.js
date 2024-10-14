"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const jwt_1 = require("../utils/jwt");
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.sendStatus(401);
        return;
    }
    try {
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        req.user = { userId: decoded.userId };
        next();
    }
    catch (error) {
        res.sendStatus(403);
        return;
    }
}
