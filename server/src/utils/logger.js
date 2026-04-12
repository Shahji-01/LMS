import pino from "pino";
import config from "../config/env.js";

const logger = pino({
  level: config.NODE_ENV === "production" ? "info" : "debug",
  ...(config.NODE_ENV !== "production" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  }),
});

export default logger;