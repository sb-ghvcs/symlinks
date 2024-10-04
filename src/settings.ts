export type WindowMode = 'normal' | 'maximized' | 'minimized'
export type LinuxType = 'Link' | 'Directory' | 'Application'

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
  terminal?: boolean
  chmod?: boolean
}
