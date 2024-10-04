import * as os from 'os'

export function isLinux(): boolean {
  return os.platform() === 'linux'
}

export function isWindows(): boolean {
  return os.platform() === 'win32'
}
