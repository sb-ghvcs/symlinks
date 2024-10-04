import * as core from '@actions/core'
import { ISettings, LinuxType, WindowMode } from './settings'
import { WindowsHelper } from './os-helpers/windows-helper'
import { LinuxHelper } from './os-helpers/linux-helper'
import { getParentDirectory } from './fs-helper'
import { lstatSync } from 'fs'
import { isLinux, isWindows } from '@actions/core/lib/platform'

class InputHelper {
  private static getCommonInputs(result: ISettings): ISettings {
    result.symlinkName = core.getInput('symlink-name')
    const comment = core.getInput('comment')
    if (comment.length === 0) {
      result.comment = undefined
    } else {
      result.comment = comment
    }
    const shortcutArguments = core.getInput('arguments')
    if (shortcutArguments.length === 0) {
      result.arguments = undefined
    } else {
      result.arguments = shortcutArguments
    }
    return result
  }

  private static getWindowsInputs(result: ISettings): ISettings {
    const windowsHelper = new WindowsHelper()
    const sourcePath = core.getInput('source-path')
    const validatedSourcePath = windowsHelper.getResolvedPath(sourcePath)
    result.sourcePath = validatedSourcePath

    const destinationDirectory = core.getInput('destination-directory')
    const validatedDestinationDirectory =
      windowsHelper.getResolvedPath(destinationDirectory)
    result.destinationDirectory = validatedDestinationDirectory

    const sourceDirectory = getParentDirectory(validatedSourcePath)
    const iconPath = core.getInput('icon-path')
    if (iconPath.length === 0) {
      result.iconPath = undefined
    } else {
      const validatedIconPath = windowsHelper.getIcon(iconPath, sourceDirectory)
      result.iconPath = validatedIconPath
    }

    const windowMode = core.getInput('window-mode') as WindowMode
    if (
      windowMode !== 'normal' &&
      windowMode !== 'maximized' &&
      windowMode !== 'minimized'
    ) {
      throw new Error(
        `Invalid input: window-mode must be "normal", "maximized", or "minimized".`
      )
    }
    result.windowMode = windowMode
    const hotKey = core.getInput('hot-key')
    if (hotKey.length === 0) {
      result.hotKey = undefined
    } else {
      result.hotKey = hotKey
    }
    const workingDirectory = core.getInput('working-directory')
    if (workingDirectory.length === 0) {
      result.workingDirectory = undefined
    } else {
      const validatedWorkingDirectory =
        windowsHelper.getResolvedPath(workingDirectory)
      if (!lstatSync(validatedWorkingDirectory).isDirectory()) {
        throw new Error(
          `Invalid working-directory: ${validatedWorkingDirectory} must be a valid directory.`
        )
      }
      result.workingDirectory = validatedWorkingDirectory
    }
    return result
  }

  private static getLinuxInputs(result: ISettings): ISettings {
    const linuxHelper = new LinuxHelper()
    const sourcePath = core.getInput('source-path')
    const shortcutType = core.getInput('type') as LinuxType
    const validatedSourcePath = linuxHelper.getResolvedPath(
      sourcePath,
      shortcutType
    )
    result.sourcePath = validatedSourcePath

    const destinationDirectory = core.getInput('destination-directory')
    const validatedDestinationDirectory =
      linuxHelper.getResolvedPath(destinationDirectory)
    result.destinationDirectory = validatedDestinationDirectory

    const sourceDirectory = getParentDirectory(validatedSourcePath)
    const iconPath = core.getInput('icon-path')
    if (iconPath.length === 0) {
      result.iconPath = undefined
    } else {
      const validatedIconPath = linuxHelper.getIcon(iconPath, sourceDirectory)
      result.iconPath = validatedIconPath
    }
    result.type = shortcutType
    result.terminal = core.getBooleanInput('terminal')
    result.chmod = core.getBooleanInput('chmod')
    return result
  }

  getInputs(): ISettings {
    let result = {} as ISettings

    result = InputHelper.getCommonInputs(result)
    if (isWindows) {
      result = InputHelper.getWindowsInputs(result)
    } else if (isLinux) {
      result = InputHelper.getLinuxInputs(result)
    }

    return result
  }
}

export const inputHelper = new InputHelper()
