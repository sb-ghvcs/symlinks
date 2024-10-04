import * as core from '@actions/core'
import { symlink } from './symlink'
import { InputHelper } from './input-helper'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const inputSettings = InputHelper.getInputs()
    const { source, destination } = await symlink(inputSettings)
    // Set outputs for other workflow steps to use
    core.setOutput('source-path', source)
    core.setOutput('output-path', destination)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
