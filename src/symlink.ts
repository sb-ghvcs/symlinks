import { isLinux, isWindows } from '@actions/core/lib/platform'
import { ISettings } from './settings'
import * as fs from 'fs'
import { log } from './log'
import path from 'path'

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
  return {
    source: settings.sourcePath,
    destination: `${settings.destinationDirectory}/${settings.symlinkName}`
  }
}
