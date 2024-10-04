import { isLinux, isWindows } from '@actions/core/lib/platform'
import { ISettings } from './settings'

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
  return {
    source: settings.sourcePath,
    destination: `${settings.destinationDirectory}/${settings.symlinkName}`
  }
}

function createWindowsSymlink(settings: ISettings): SymlinkResult {
  return {
    source: settings.sourcePath,
    destination: `${settings.destinationDirectory}/${settings.symlinkName}`
  }
}
