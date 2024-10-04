import * as core from '@actions/core'
import { symlink } from './symlink'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const sourcePath: string = core.getInput('source-path')
    const destinationPath: string = core.getInput('destination-path')

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`Creating symlink for ${sourcePath} to ${destinationPath}...`)

    const [sourceSymlinkPath, createdSymlinkPath] = await symlink(
      sourcePath,
      destinationPath
    )

    // Set outputs for other workflow steps to use
    core.setOutput('source-path', sourceSymlinkPath)
    core.setOutput('output-path', createdSymlinkPath)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
