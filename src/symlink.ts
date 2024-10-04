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
      core.debug(`Destination path '${absoluteDestPath}' already exists`)
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
      core.debug(
        `Creating linux symlink for ${absoluteSourcePath} to ${absoluteDestPath}`
      )
      fs.symlinkSync(absoluteSourcePath, absoluteDestPath)
    } else if (isWindows()) {
      core.debug(
        `Creating windows shortcut for ${absoluteSourcePath} to ${absoluteDestPath}`
      )
      const command = `mklink "${absoluteDestPath}" "${absoluteSourcePath}"`
      core.debug(`Running command: ${command}`)
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const exec = require('child_process').exec
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exec(command, (err: any, stdout: any, stderr: any) => {
        if (err) {
          core.error(`Error creating symlink: ${err.message}`)
          reject(err)
        } else if (stderr) {
          core.error(`Error creating symlink: ${stderr}`)
          reject(new Error(stderr))
        } else {
          core.debug(`stdout: ${stdout}`)
          resolve({ source: absoluteSourcePath, destination: absoluteDestPath })
        }
      })
    } else {
      reject('Unsupported OS')
    }

    resolve({ source: absoluteSourcePath, destination: absoluteDestPath })
  })
}
