import { existsSync, lstatSync } from 'fs'
import path from 'path'
import { resolvePATH } from '../fs-helper'
import { log } from '../log'
import { IOsHelper, resolveTilde } from './os-helper'
import { LinuxType } from '../settings'

export class LinuxHelper implements IOsHelper {
  getResolvedPath(filePath: string, type?: LinuxType): string {
    const substitudedPath = resolveTilde(filePath)
    if (!substitudedPath) {
      throw new Error(
        `Could not resolve path. Make sure filepath ${filePath} is valid`
      )
    }
    const resolvedPath = resolvePATH(substitudedPath)
    const resolvedType = this.getType(resolvedPath, type)
    if (resolvedType === 'file') {
      if (!existsSync(resolvedPath)) {
        throw new Error(`Could not find file: ${resolvedPath}`)
      }
      if (lstatSync(resolvedPath).isDirectory()) {
        throw new Error(
          `${resolvedPath} is a directory. Please provide a file path instead.`
        )
      }
    } else {
      if (!existsSync(resolvedPath)) {
        throw new Error(`Could not find directory: ${resolvedPath}`)
      }
      if (!lstatSync(resolvedPath).isDirectory()) {
        throw new Error(
          `${resolvedPath} is a file. Please provide a directory path instead.`
        )
      }
    }
    return resolvedPath
  }

  getIcon(iconPath: string, sourceDirectory = ''): string | undefined {
    let resolvedPath = resolveTilde(iconPath)
    if (!resolvedPath) {
      log.error(`Could not resolve path. Make sure icon ${iconPath} is valid`)
      return undefined
    }

    if (!path.isAbsolute(resolvedPath)) {
      const parsedSourceDirectory = path.parse(sourceDirectory).dir
      resolvedPath = path.join(parsedSourceDirectory, resolvedPath)
      if (!existsSync(resolvedPath)) {
        log.error(`Could not find icon: ${resolvedPath}`)
        return undefined
      }
    }

    if (!iconPath.endsWith('.png') && !iconPath.endsWith('.icns')) {
      log.error(`Invalid icon: ${resolvedPath}. File must be PNG or ICNS`)
      return undefined
    }

    if (!existsSync(resolvedPath)) {
      log.error(`Could not find icon: ${resolvedPath}`)
      return undefined
    }
    return resolvedPath
  }

  getType(filePath: string, type?: LinuxType): LinuxType {
    if (!type) {
      if (existsSync(filePath) && lstatSync(filePath).isDirectory()) {
        return 'dir'
      }
      return 'file'
    }
    if (type !== 'file' && type !== 'dir') {
      log.error(`Invalid type: ${type}. Defaulting to file.`)
      return 'file'
    }
    return type
  }
}
