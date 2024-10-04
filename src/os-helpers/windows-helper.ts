import { existsSync } from 'fs'
import path from 'path'
import { resolvePATH } from 'src/fs-helper'
import { log } from 'src/log'
import {
  IOsHelper,
  resolveEnvironmentVariables
} from 'src/os-helpers/os-helper'

export class WindowsHelper implements IOsHelper {
  getResolvedPath(filePath: string): string {
    const substitudedPath = resolveEnvironmentVariables(filePath)
    if (!substitudedPath) {
      throw new Error(
        `Could not resolve path. Make sure filepath ${filePath} is valid`
      )
    }
    const resolvedPath = resolvePATH(substitudedPath)

    if (!existsSync(resolvedPath)) {
      throw new Error(`Could not find path: ${resolvedPath}`)
    }
    return resolvedPath
  }

  getIcon(iconPath: string, sourceDirectory = ''): string | undefined {
    let resolvedPath = resolveEnvironmentVariables(iconPath)
    if (!resolvedPath) {
      log.error(`Could not resolve path. Make sure icon ${iconPath} is valid`)
      return undefined
    }

    if (!path.win32.isAbsolute(resolvedPath)) {
      let parsedSourceDirectory = sourceDirectory
      if (path.sep !== '\\') {
        parsedSourceDirectory = sourceDirectory.split('\\').join('/')
        resolvedPath = resolvedPath.split('\\').join('/')
      }
      parsedSourceDirectory = path.parse(parsedSourceDirectory).dir
      resolvedPath = path.join(parsedSourceDirectory, resolvedPath)
    }
    let iconPattern = /^.*(?:\.exe|\.ico|\.dll)(?:,\d*)?$/m
    if (!RegExp(iconPattern).test(iconPath)) {
      log.error(
        'Windows ICON must be ICO, EXE, or DLL File. It may be followed by a comma and icon index value, like: "C:\\file.exe,0"'
      )
      return undefined
    }

    function removeIconIndex(icon: string) {
      // 'C:\\file.dll,0' => 'dll,0'
      const extension = path.parse(icon).ext
      // 'dll,0' => ['dll', '0'] => 'dll'
      const cleaned = extension.split(',')[0]
      // 'C:\\file.dll,0' => 'C:\\file.dll'
      return icon.replace(extension, cleaned)
    }

    if (!resolvedPath) {
      return undefined
    }
    if (!existsSync(removeIconIndex(resolvedPath))) {
      log.error(`Could not find icon: ${resolvedPath}`)
      return undefined
    }
    return resolvedPath
  }
}
