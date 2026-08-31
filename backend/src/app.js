import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";

const app = express();

app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN?.split(
        ","
      ) || "http://localhost:5173",

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(
  express.static("public")
);

app.use(cookieParser());

app.use(
  "/api/v1/healthcheck",
  healthCheckRouter
);

app.use(
  "/api/v1/auth",
  authRouter
);

app.use(
  "/api/v1/projects",
  projectRouter
);

app.use(
  "/api/v1/tasks",
  taskRouter
);

app.get("/", (req, res) => {
  res.status(200).send(
    "Welcome to the server"
  );
});

app.use(
  (err, req, res, next) => {
    console.error(err);

    const statusCode =
      err.statusCode || 500;

    res.status(statusCode).json({
      success: false,
      message:
        err.message ||
        "Internal server error",
      errors: err.errors || [],
    });
  }
);

export default app;