import express from "express";
import session from "express-session";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import cors from "cors";
import "./auth/index.mjs";

const MONGODB_URI = process.env.MONGODB_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

const mongoStore = MongoStore.create({
  mongoUrl: MONGODB_URI,
  collectionName: "sessions",
  ttl: 24 * 60 * 60 * 1000, // 24 hours
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
        secure: false, // served over https
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
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
    origin: "", // frontend origin
    credentials: true, // allow cookies, authorization header in cors request
  })
);

/* 
    /api/admin/auth/...
    /api/user/auth/...
*/
app.use("/api", routes);

export default app;
