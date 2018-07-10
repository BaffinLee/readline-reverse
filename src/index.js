const assert = require('assert')
const fs = require('fs')
const { promisify } = require('util')

const open = promisify(fs.open)
const stat = promisify(fs.stat)
const read = promisify(fs.read)
const close = promisify(fs.close)

const FD = Symbol.for('ReadlineReverse.fd')
const BUFFER = Symbol.for('ReadlineReverse.buffer')
const SIZE = Symbol.for('ReadlineReverse.size')
const POSITION = Symbol.for('ReadlineReverse.position')
const LINES = Symbol.for('ReadlineReverse.lines')
const READ_TRUNK = Symbol.for('ReadlineReverse.readTrunk')
const SPLIT_TRUNK = Symbol.for('ReadlineReverse.splitTrunk')

const defaultOptions = {
  flags: 'r',
  separator: '\n',
  encoding: 'utf8',
  bufferSize: 4096
}

module.exports = class ReverseReader {
  constructor (filepath, options = {}) {
    assert(filepath, 'need file path')
    this.filepath = filepath
    this.options = Object.assign({}, defaultOptions, options)
    assert(this.options.separator, 'need separator')
    assert(this.options.encoding, 'need encoding')
  }

  async open () {
    const stats = await stat(this.filepath)
    assert(stats.isFile(), 'should be file')
    const size = Math.min(this.options.bufferSize, stats.size)
    this[SIZE] = size
    this[POSITION] = size
    this[BUFFER] = Buffer.alloc(size)
    this[LINES] = []
    this[FD] = await open(this.filepath, this.options.flags)
  }

  async [READ_TRUNK] () {
    const { bytesRead } = await read(this[FD], this[BUFFER], 0, this[SIZE], this[POSITION])
    if (bytesRead > 0) this[SPLIT_TRUNK]()
  }

  [SPLIT_TRUNK] () {
    let index = this[BUFFER].lastIndexOf(this.options.separator)
    let last = this[BUFFER].length - 1
    let buf = null
    while (index !== -1) {
      buf = this[BUFFER].slice(index, last)
      this[LINES].push(buf.toString(this.options.encoding))
      last = index
      index = this[BUFFER].lastIndexOf(this.options.separator, last)
    }
  }

  async read (line = 1) {
    const res = []
    let remain = line
    while (remain > 0) {
      if (this[LINES].length === 0) await this[READ_TRUNK]()
      if (this[LINES].length === 0) break
      res.push(this[LINES].pop())
      remain--
    }
    return res
  }

  async close () {
    await close(this[FD])
  }
}
