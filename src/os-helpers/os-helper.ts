import * as os from 'os'

export function resolveTilde(filePath: string): string | undefined {
  if (!filePath || typeof filePath !== 'string') {
    return undefined
  }

  // '~/folder/path' or '~' not '~alias/folder/path'
  if (filePath.startsWith('~/') || filePath === '~') {
    return filePath.replace('~', os.homedir())
  }

  return filePath
}

export function resolveEnvironmentVariables(
  filePath: string
): string | undefined {
  if (!filePath || typeof filePath !== 'string') {
    return undefined
  }

  function replaceEnvironmentVariable(
    withPercents: string,
    withoutPercents: string
  ): string {
    const found = process.env[withoutPercents]
    // 'C:\Users\%USERNAME%\Desktop\%asdf%' => 'C:\Users\bob\Desktop\%asdf%'
    return found || withPercents
  }

  // 'C:\Users\%USERNAME%\Desktop\%PROCESSOR_ARCHITECTURE%' => 'C:\Users\bob\Desktop\AMD64'
  filePath = filePath.replace(/%([^%]+)%/g, replaceEnvironmentVariable)
  return filePath
}

export interface IOsHelper {
  getResolvedPath(filePath: string): string

  getIcon(iconPath: string, sourceDirectory: string): string | undefined
}
