import { existsSync } from 'fs'
import path from 'path'
import { resolvePATH } from '../fs-helper'
import { log } from '../log'
import { IOsHelper, resolveEnvironmentVariables } from './os-helper'

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

  getIcon(iconPath: string): string | undefined {
    const substitudedPath = resolveEnvironmentVariables(iconPath)
    if (!substitudedPath) {
      log.error(`Could not resolve path. Make sure icon ${iconPath} is valid`)
      return undefined
    }

    const resolvedPath = resolvePATH(substitudedPath)
    if (!resolvedPath) {
      log.error(
        `Could not resolve path. Make sure icon ${substitudedPath} is valid`
      )
      return undefined
    }

    const iconPattern = /^.*(?:\.exe|\.ico|\.dll)(?:,\d*)?$/m
    if (!RegExp(iconPattern).test(resolvedPath)) {
      log.error(
        'Windows ICON must be ICO, EXE, or DLL File. It may be followed by a comma and icon index value, like: "C:\\file.exe,0"'
      )
      return undefined
    }

    function removeIconIndex(icon: string): string {
      // 'C:\\file.dll,0' => 'dll,0'
      const extension = path.parse(icon).ext
      // 'dll,0' => ['dll', '0'] => 'dll'
      const cleaned = extension.split(',')[0]
      // 'C:\\file.dll,0' => 'C:\\file.dll'
      return icon.replace(extension, cleaned)
    }

    if (!existsSync(removeIconIndex(resolvedPath))) {
      log.error(`Could not find icon: ${resolvedPath}`)
      return undefined
    }
    return resolvedPath
  }
}
