import winston from "winston";
import "winston-daily-rotate-file";

export class Logger {
  private _logger: winston.Logger;
  constructor(service: string, logDir?: any) {
    this._logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: service },
      transports: [
        new winston.transports.DailyRotateFile({
          dirname: logDir || process.env.LOG_DIR || "./log",
          filename: "%DATE%_ERROR.log",
          level: "error",
        }),
        new winston.transports.DailyRotateFile({
          dirname: logDir || process.env.LOG_DIR || "./log",
          filename: "%DATE%_ALL.log",
        }),
      ],
    });
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.NODE_ENV !== "staging"
    ) {
      this._logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.metadata({
              fillExcept: ["timestamp", "service", "level", "message"],
            }),
            winston.format.colorize(),
            this.winstonConsoleFormat()
          ),
        })
      );
    }
  }

  winstonConsoleFormat() {
    return winston.format.printf(
      ({
        timestamp,
        service,
        level,
        message,
      }: winston.Logform.TransformableInfo) => {
        return `[${service}][${timestamp}][${level}] ${message}`;
      }
    );
  }

  debug(message: string, metadata?: any) {
    this._logger.debug(message, metadata);
  }

  info(message: string, metadata?: any) {
    this._logger.info(message, metadata);
  }

  warn(message: string, metadata?: any) {
    this._logger.warn(message, metadata);
  }

  error(message: string, metadata?: any) {
    this._logger.error(message, metadata);
  }

  log(level: keyof winston.Logger, message: string, metadata?: any) {
    const metadataObject: any = {};
    if (metadata) metadataObject.metadata = metadata;

    this._logger[level](message, metadataObject);
  }

  static get(name: string) {
    return new Logger(name);
  }
}
