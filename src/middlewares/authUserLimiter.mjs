import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // limit each ip to 5 requests per windowMs
    message: {
      status: 429, // too many requests
      message: "Too many login attempts, please try again later. You can try again after 5 minutes"
    },
    statusCode: 429 //  
  });