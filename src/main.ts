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
    const override: boolean = core.getBooleanInput('override')

    const { source, destination } = await symlink(
      sourcePath,
      destinationPath,
      override
    )

    // Set outputs for other workflow steps to use
    core.setOutput('source-path', source)
    core.setOutput('output-path', destination)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
