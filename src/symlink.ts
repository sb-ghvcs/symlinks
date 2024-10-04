import { isLinux, isWindows } from '@actions/core/lib/platform'
import { ISettings } from './settings'
// import { generateLinuxFiledata } from './os-helpers/linux-helper'
// import { chmodSync, writeFileSync } from 'fs'
// import { log } from './log'

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
  // const fileContents = generateLinuxFiledata(settings)
  // let created = true;
  // try {
  //   writeFileSync(settings.destinationDirectory, fileContents);
  // } catch (error) {
  //   created = false;
  //   log.error(`Could not create linux shortcut: ${error}`)
  // }

  // if (created && settings.chmod) {
  //   try {
  //     chmodSync()
  //   }
  // }

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
