import aj from '../utils/arcjet.js';
import { isSpoofedBot } from "@arcjet/inspect";

const arcjetProtection = async (req, res, next) => {
    try {
        const decision = await aj.protect(req);

        if (decision.isDenied()) {

            if (decision.reason.isRateLimit()) {
                return res.status(429).json({
                    message: "Rate limit exceeded. Please try again later."
                });
            }

            if (decision.reason.isBot()) {
                return res.status(403).json({
                    message: "Bot access denied"
                });
            }

            if (isSpoofedBot(decision.reason)) {
                return res.status(403).json({
                    error: "spoofed bot detected",
                    message: "Malicious activity detected"
                });
            }

            return res.status(403).json({
                message: "Access denied by security policy"
            });
        }

        
        next();

    } catch (error) {
        console.error("Arcjet protection error", error);

        
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export default arcjetProtection;