/* eslint-env mocha */
'use strict'

const fse = require('fs-extra')
const path = require('path')
const assert = require('assert')
const ReadlineReverse = require('../src/index')
const tmpPath = path.resolve(__dirname, '../.tmp')
const tmpFile = path.resolve(tmpPath, 'test.txt')

describe('check options', () => {
  it('should apply default options', async () => {
    const reader = new ReadlineReverse()
    assert(reader.options.flags === 'r')
    assert(reader.options.separator === '\n')
    assert(reader.options.encoding === 'utf8')
    assert(reader.options.bufferSize === 4096)
  })

  it('should throw error when separator is empty', async () => {
    let err = null
    try {
      new ReadlineReverse({ separator: '' })
    } catch (e) {
      err = e
    }
    assert(err instanceof Error && err.message === 'need separator')
  })

  it('should throw error when encoding is empty', async () => {
    let err = null
    try {
      new ReadlineReverse({ encoding: '' })
    } catch (e) {
      err = e
    }
    assert(err instanceof Error && err.message === 'need encoding')
  })
})

describe('open file', () => {
  it('should throw error when filepath is empty', async () => {
    let err = null
    let reader = null
    try {
      reader = new ReadlineReverse()
      await reader.open()
    } catch (e) {
      err = e
    }
    assert(err instanceof Error && err.message === 'need file path')
  })

  it('should throw error when filepath is dir', async () => {
    let err = null
    let reader = null
    try {
      reader = new ReadlineReverse()
      await reader.open('./')
    } catch (e) {
      err = e
    }
    assert(err instanceof Error && err.message === 'should be file')
  })

  it('should throw error when filepath not exists', async () => {
    let err = null
    let reader = null
    try {
      reader = new ReadlineReverse()
      await reader.open('./not_exists_file')
    } catch (e) {
      err = e
    }
    assert(err instanceof Error && err.code === 'ENOENT')
  })

  it('should get correct size and open', async () => {
    const BUFFER = Symbol.for('ReadlineReverse.buffer')
    const FD = Symbol.for('ReadlineReverse.fd')

    let reader = new ReadlineReverse()
    await fse.outputFile(tmpFile, 'ten bytes.')
    await reader.open(tmpFile)
    assert(reader[BUFFER].length === 10)
    assert(reader[FD])
    await reader.close()

    reader = new ReadlineReverse({ bufferSize: 5 })
    await reader.open(tmpFile)
    assert(reader[BUFFER].length === 5)
    await reader.close()

    await fse.remove(tmpPath)
  })
})

describe('read line', () => {
  let reader = null

  beforeEach(async () => {
    const str = `\nline 1\nline 2\nline 3\nline 4\nline 5\nline 6\n`
    await fse.outputFile(tmpFile, str)
    reader = new ReadlineReverse()
    await reader.open(tmpFile)
  })

  afterEach(async () => {
    await reader.close()
    await fse.remove(tmpPath)
  })

  it('should throw error when call read before open', async () => {
    let err = null
    await reader.close()
    try {
      await reader.read()
    } catch (e) {
      err = e
    }
    await reader.open(tmpFile)
    assert(err instanceof Error && err.message === 'should call open method before read')
  })

  it('should get 1 line correctly', async () => {
    let lines = []
    lines = await reader.read()
    assert(lines[0] === '')
    lines = await reader.read()
    assert(lines[0] === 'line 6')
  })

  it('should get n lines correctly', async () => {
    const lines = await reader.read(6)
    assert(lines.length === 6)
    assert(lines[0] === 'line 2')
    assert(lines[4] === 'line 6')
    assert(lines[5] === '')
  })

  it('should get all lines correctly', async () => {
    const lines = await reader.read(10)
    assert(lines.length === 8)
    assert(lines[0] === '')
    assert(lines[1] === 'line 1')
    assert(lines[6] === 'line 6')
    assert(lines[7] === '')
  })
})

describe('test config', async () => {
  it('should read file by bufferSize', async () => {
    const str = '\nline 1\nline 2'
    await fse.outputFile(tmpFile, str)
    const reader = new ReadlineReverse({ bufferSize: 3 })
    await reader.open(tmpFile)
    let lines = await reader.read()
    assert(lines[0] === 'line 2')
    await reader.close()
    await fse.remove(tmpPath)
  })

  it('should throw error when max line length exceed, case 1', async () => {
    const str = 'ten bytes.'
    await fse.outputFile(tmpFile, str)
    const reader = new ReadlineReverse({ maxLineLength: 9 })
    await reader.open(tmpFile)
    let err = null
    try {
      await reader.read()
    } catch (e) {
      err = e
    }
    assert(err instanceof Error && err.message === 'max line length exceed')
    await reader.close()
    await fse.remove(tmpPath)
  })

  it('should throw error when max line length exceed, case 2', async () => {
    const str = 'ten bytes.\nten bytes.'
    await fse.outputFile(tmpFile, str)
    const reader = new ReadlineReverse({ maxLineLength: 9 })
    await reader.open(tmpFile)
    let err = null
    try {
      await reader.read()
    } catch (e) {
      err = e
    }
    assert(err instanceof Error && err.message === 'max line length exceed')
    await reader.close()
    await fse.remove(tmpPath)
  })

  it('should read file by separator', async () => {
    let lines = ''

    let str = '\nline 1\nline 2\n'
    await fse.outputFile(tmpFile, str)
    let reader = new ReadlineReverse({ separator: '\n' })
    await reader.open(tmpFile)
    lines = await reader.read(2)
    assert(lines[0] === 'line 2')
    assert(lines[1] === '')
    await reader.close()

    str = '\r\nline 1\r\nline 2\r\n'
    await fse.outputFile(tmpFile, str)
    reader = new ReadlineReverse({ separator: '\r\n' })
    await reader.open(tmpFile)
    lines = await reader.read(2)
    assert(lines[0] === 'line 2')
    assert(lines[1] === '')
    await reader.close()

    await fse.remove(tmpPath)
  })
})

describe('close file', () => {
  let reader = null

  beforeEach(async () => {
    await fse.outputFile(tmpFile, 'test')
    reader = new ReadlineReverse()
  })

  afterEach(async () => {
    await fse.remove(tmpPath)
  })

  it('should throw error when call close before open', async () => {
    let err = null
    try {
      await reader.close()
    } catch (e) {
      err = e
    }
    assert(err instanceof Error && err.message === 'should call open method before close')
  })

  it('should close correctly', async () => {
    const FD = Symbol.for('ReadlineReverse.fd')
    await reader.open(tmpFile)
    await reader.close()
    assert(reader[FD] === undefined)
  })
})
