export type WindowMode = 'normal' | 'maximized' | 'minimized'
export type LinuxType = 'file' | 'dir'

export interface ISettings {
  sourcePath: string
  destinationDirectory: string
  symlinkName?: string
  comment?: string
  iconPath?: string
  arguments?: string
  windowMode?: WindowMode
  hotKey?: string
  workingDirectory?: string
  vbsPath?: string
  type?: LinuxType
  chmod?: boolean
}
