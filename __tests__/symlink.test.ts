import { symlink } from '../src/symlink'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

let tempDir: string

jest.mock('path', () => {
  const originalPath = jest.requireActual('path')
  return {
    ...originalPath,
    resolve: jest.fn((...args) => originalPath.join(tempDir, ...args))
  }
})

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-'))
})

afterEach(() => {
  fs.rmdirSync(tempDir, { recursive: true })
})

describe('symlink.ts', () => {
  it('creates a symlink', async () => {
    const source = path.join(tempDir, 'test')
    const destination = path.join(tempDir, 'test2')

    // Create a dummy file to link
    fs.writeFileSync(source, 'dummy content')

    const result = await symlink('test', 'test2')
    expect(path.resolve(result.source)).toBe(path.resolve(source))
    expect(path.resolve(result.destination)).toBe(path.resolve(destination))
  })
})
