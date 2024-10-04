import * as core from '@actions/core'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoggerType = (message?: any, ...optionalParams: any[]) => void

class Logger {
  private infoLogger
  private debugLogger
  private errorLogger

  constructor(
    infoLogger: LoggerType = console.log,
    debugLogger: LoggerType = console.debug,
    errorLogger: LoggerType = console.error
  ) {
    this.infoLogger = infoLogger
    this.debugLogger = debugLogger
    this.errorLogger = errorLogger
  }

  info(message: string): void {
    this.infoLogger(message)
  }

  debug(message: string): void {
    this.debugLogger(message)
  }

  error(message: string): void {
    this.errorLogger(message)
  }
}

export const log = new Logger(core.info, core.debug, core.error)
