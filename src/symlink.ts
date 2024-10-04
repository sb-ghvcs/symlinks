import * as core from '@actions/core'
import * as fs from 'fs'
import * as path from 'path'
import { isLinux, isWindows } from './os-helper'
import { directoryExistsSync, existsSync } from './fs-helper'

/**
 * Create a symlink from one path to another.
 * @param sourcePath The path to create a symlink for
 * @param destinationPath The path to the desired symlink
 * @returns {Promise<string>} Resolves with absolute path to the created symlink.
 */
export async function symlink(
  sourcePath: string,
  destinationPath: string,
  override = false
): Promise<{
  source: string
  destination: string
}> {
  return new Promise((resolve, reject) => {
    if (!sourcePath || !destinationPath) {
      reject('Source and destination paths must not be empty')
    }

    const absoluteSourcePath = path.resolve(sourcePath)
    const absoluteDestPath = path.resolve(destinationPath)

    const parentDir = path.dirname(absoluteDestPath)
    if (!directoryExistsSync(parentDir, true)) {
      fs.mkdirSync(parentDir, { recursive: true })
    }

    if (existsSync(absoluteDestPath)) {
      const stats = fs.lstatSync(absoluteDestPath)
      if (
        stats.isSymbolicLink() ||
        (isWindows() && path.extname(absoluteDestPath) === '.lnk')
      ) {
        const existingTarget = fs.readlinkSync(absoluteDestPath)
        if (existingTarget === absoluteSourcePath) {
          resolve({ source: absoluteSourcePath, destination: absoluteDestPath })
        } else if (override) {
          fs.unlinkSync(absoluteDestPath)
        } else {
          reject(
            `Destination path '${absoluteDestPath}' already exists and does not point to the source path`
          )
        }
      } else if (!override) {
        reject(`Destination path '${absoluteDestPath}' already exists`)
      }
    }

    if (isLinux()) {
      fs.symlinkSync(absoluteSourcePath, absoluteDestPath)
    } else if (isWindows()) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const shortcut = require('windows-shortcuts')
      core.debug(`Creating shortcut for ${absoluteSourcePath} to ${absoluteDestPath}`)
      shortcut.create(
        absoluteDestPath,
        { target: absoluteSourcePath },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err: any) => {
          if (err) throw err
        }
      )
    } else {
      reject('Unsupported OS')
    }

    resolve({ source: absoluteSourcePath, destination: absoluteDestPath })
  })
}
