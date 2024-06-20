import express from "express";
import session from "express-session";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import cors from "cors";
import passport from "passport";
import "./auth/index.mjs";
import { isAdminAuthenticated } from "./middlewares/authAdmin.mjs";
import { isUserAuthenticated } from "./middlewares/authUser.mjs";

const MONGODB_URI = process.env.MONGODB_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

const mongoStore = MongoStore.create({
  mongoUrl: MONGODB_URI,
  collectionName: "sessions",
  ttl: 24 * 60 * 60, // 24 hours in seconds
});

const app = express();

app.use(cookieParser());
app.use(express.json());

try {
  app.use(
    session({
      secret: SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
      cookie: {
        secure: false, // should be true if served over https
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      },
      store: mongoStore,
    })
  );
} catch (error) {
  console.error("Error initializing session middleware:", error);
}

try {
  app.use(passport.initialize());
  app.use(passport.session());
} catch (error) {
  console.error("Error initializing Passport middleware:", error);
}

app.use(
  cors({
    origin: "http://localhost:3000", // replace with your frontend origin
    credentials: true, // allow cookies, authorization header in cors request
  })
);

// user logout route
app.post("/api/admin/auth/logout", isAdminAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
});

// user logout route
app.post("/api/user/auth/logout", isUserAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
});

/* 
    /api/admin/auth/...
    /api/user/auth/...
*/

app.use("/api", routes);

export default app;
