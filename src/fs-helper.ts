import which from 'which'
import path from 'path'
import * as fs from 'fs'

export function getParentDirectory(inputPath: string): string {
  // Check if the input path exists
  if (!fs.existsSync(inputPath)) {
    throw new Error('Path does not exist')
  }

  // Check if the input path is a directory
  if (fs.statSync(inputPath).isDirectory()) {
    return inputPath
  }

  // If it's a file, return the parent directory
  return path.dirname(inputPath)
}

export function resolvePATH(filePath: string): string {
  if (filePath) {
    return which.sync(filePath, { nothrow: true }) || filePath
  }
  return filePath
}
