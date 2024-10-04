import * as core from '@actions/core'

type LoggerType = (message?: any, ...optionalParams: any[]) => void

class Logger {
  private infoLogger
  private debugLogger
  private errorLogger

  public constructor(
    infoLogger: LoggerType = console.log,
    debugLogger: LoggerType = console.debug,
    errorLogger: LoggerType = console.error
  ) {
    this.infoLogger = infoLogger
    this.debugLogger = debugLogger
    this.errorLogger = errorLogger
  }

  public info(message: string) {
    this.infoLogger(message)
  }

  public debug(message: string) {
    this.debugLogger(message)
  }

  public error(message: string) {
    this.errorLogger(message)
  }
}

export const log = new Logger(core.info, core.debug, core.error)
