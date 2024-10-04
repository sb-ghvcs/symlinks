import { existsSync, lstatSync } from 'fs'
import path from 'path'
import { resolvePATH } from '../fs-helper'
import { log } from '../log'
import { IOsHelper, resolveTilde } from './os-helper'
import { ISettings, LinuxType } from '../settings'

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
    if (resolvedType === 'Application') {
      if (!existsSync(resolvedPath)) {
        throw new Error(`Could not find file: ${resolvedPath}`)
      }
      if (lstatSync(resolvedPath).isDirectory()) {
        throw new Error(
          `${resolvedPath} is a directory. Please provide a file path instead.`
        )
      }
    } else if (resolvedType === 'Directory') {
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
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return 'Link'
      } else if (existsSync(filePath) && lstatSync(filePath).isDirectory()) {
        return 'Directory'
      }
      return 'Application'
    }
    if (type !== 'Link' && type !== 'Directory' && type !== 'Application') {
      return 'Application'
    }
    return type
  }
}

export function generateLinuxFiledata(settings: ISettings): string {
  let type = 'Type=Application'
  let terminal = 'Terminal=false'
  let exec = 'Exec="' + settings.sourcePath + '"'
  let name = 'Name=' + path.parse(settings.sourcePath).name
  let comment = ''
  let icon = ''

  if (settings.type) {
    type = 'Type=' + settings.type
  }
  if (settings.terminal) {
    terminal = 'Terminal=' + settings.terminal
  }
  if (settings.symlinkName) {
    name = 'Name=' + settings.symlinkName
  }
  if (settings.comment) {
    comment = 'Comment=' + settings.comment
  }
  if (settings.iconPath) {
    icon = 'Icon=' + settings.iconPath
  }
  if (settings.arguments) {
    exec = exec + ' ' + settings.arguments
  }

  // File format details:
  // https://wiki.archlinux.org/index.php/Desktop_entries
  const fileContents = [
    '#!/user/bin/env xdg-open',
    '[Desktop Entry]',
    'Version=1.0',
    type,
    terminal,
    exec,
    name,
    comment,
    icon
  ]
    .filter(Boolean)
    .join('\n')

  return fileContents
}
