import { isLinux, isWindows } from '@actions/core/lib/platform'
import { ISettings } from './settings'
import * as fs from 'fs'
import { log } from './log'
import path from 'path'
import { spawnSync } from 'child_process'

interface SymlinkResult {
  source: string
  destination: string
}

export async function symlink(settings: ISettings): Promise<SymlinkResult> {
  return new Promise((resolve, reject) => {
    try {
      if (isLinux) {
        resolve(createLinuxSymlink(settings))
      } else if (isWindows) {
        resolve(createWindowsSymlink(settings))
      } else {
        reject('Unsupported platform. Only Windows and Linux are supported')
      }
    } catch (error: unknown) {
      reject(error)
    }
  })
}

function createLinuxSymlink(settings: ISettings): SymlinkResult {
  const sourcePathName = path.basename(settings.sourcePath)
  const symlinkPath = settings.symlinkName
    ? path.join(settings.destinationDirectory, settings.symlinkName)
    : path.join(settings.destinationDirectory, sourcePathName)

  log.info(`Creating symlink ${symlinkPath} -> ${settings.sourcePath}`)

  fs.symlink(settings.sourcePath, symlinkPath, settings.type, err => {
    if (err) {
      throw new Error(`Failed to create symlink: ${err.message}`)
    } else {
      log.info(`Created symlink successfully`)
    }
  })

  if (settings.chmod) {
    fs.chmod(symlinkPath, 0o755, err => {
      if (err) {
        throw new Error(`Failed to change permissions: ${err.message}`)
      }
    })
  }

  return {
    source: settings.sourcePath,
    destination: symlinkPath
  }
}

function createWindowsSymlink(settings: ISettings): SymlinkResult {
  const vbsScript = settings.vbsPath
  if (!vbsScript) {
    throw new Error('Missing VBS Script for creating windows shortcut')
  }

  const windowModes = {
    normal: '1',
    maximized: '3',
    minimized: '7'
  }

  const sourcePathName = path.basename(settings.sourcePath)
  const outputPath = settings.symlinkName
    ? path.join(settings.destinationDirectory, settings.symlinkName + '.lnk')
    : path.join(settings.destinationDirectory, sourcePathName + '.lnk')
  log.info(`Creating symlink ${outputPath} -> ${settings.sourcePath}`)
  const sourcePath = settings.sourcePath
  let args = settings.arguments || ''
  let comment = settings.comment || ''
  const cwd = settings.workingDirectory || ''
  let icon = settings.iconPath
  const windowMode = windowModes[settings.windowMode || 'normal']
  let hotKey = settings.hotKey || ''

  function replaceDoubleQuotes(input: string): string {
    return input.split('"').join('__DOUBLEQUOTE__')
  }
  args = replaceDoubleQuotes(args)
  comment = replaceDoubleQuotes(comment)
  hotKey = replaceDoubleQuotes(hotKey)

  if (!icon) {
    if (sourcePath.endsWith('.dll') || sourcePath.endsWith('.exe')) {
      icon = sourcePath + ',0'
    } else {
      icon = sourcePath
    }
  }

  const wscriptArguments = [
    vbsScript,
    outputPath,
    sourcePath,
    args,
    comment,
    cwd,
    icon,
    windowMode,
    hotKey
  ]

  try {
    const result = spawnSync('wscript', wscriptArguments)
    if (result.error) {
      throw new Error(`Failed to create symlink: ${result.error.message}`)
    }
    if (result.stderr) {
      throw new Error(`Failed to create symlink: ${result.stderr.toString()}`)
    }
    if (result.stdout) {
      log.info(result.stdout.toString())
    }
    log.info(`Created symlink successfully`)
  } catch (error) {
    log.error(`Failed to create symlink: ${error}`)
    throw new Error(`Failed to create symlink`)
  }
  return {
    source: settings.sourcePath,
    destination: outputPath
  }
}
