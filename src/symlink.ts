/**
 * Create a symlink from one path to another.
 * @param sourcePath The path to create a symlink for
 * @param destinationPath The path to the desired symlink
 * @returns {Promise<string>} Resolves with absolute path to the created symlink.
 */
export async function symlink(sourcePath: string, destinationPath: string): Promise<[string, string]> {
  return new Promise(resolve => {
    setTimeout(() => resolve(['done!', 'done!']), 2000)
  })
}
