'use strict'

const assert = require('assert')
const fs = require('fs')
const { promisify } = require('util')

const open = promisify(fs.open)
const stat = promisify(fs.stat)
const read = promisify(fs.read)
const close = promisify(fs.close)

const FD = Symbol.for('ReadlineReverse.fd')
const BUFFER = Symbol.for('ReadlineReverse.buffer')
const FILE_POSITION = Symbol.for('ReadlineReverse.filePosition')
const BUFFER_POSITION = Symbol.for('ReadlineReverse.bufferPosition')
const EMPTY_FIRST_LINE = Symbol.for('ReadlineReverse.emptyFirstLine')
const READ_TRUNK = Symbol.for('ReadlineReverse.readTrunk')
const READ_LINE = Symbol.for('ReadlineReverse.readLine')

const defaultOptions = {
  flags: 'r',
  separator: '\n',
  encoding: 'utf8',
  bufferSize: 4096,
  maxLineLength: 0
}

module.exports = class ReadlineReverse {
  /**
   * ReadlineReverse
   * @param {object} [options = {}] options
   * @param {string} [options.flags = 'r'] open file flag
   * @param {string} [options.separator = '\n'] line separator
   * @param {string} [options.encoding = 'utf8'] file encoding
   * @param {number} [options.bufferSize = 4096] read buffer size, better bigger than average size of one line
   * @param {number} [options.maxLineLength = 0] max line length, will throw error when exceed, 0 represent unlimited
   * @throws {AssertionError} need separator
   * @throws {AssertionError} need encoding
   */
  constructor (options = {}) {
    this.options = Object.assign({}, defaultOptions, options)
    assert(this.options.separator, 'need separator')
    assert(this.options.encoding, 'need encoding')
  }

  /**
   * open file
   * @param {string} filepath path of the file your want to read
   * @throws {AssertionError} ned file path
   * @throws {AssertionError} should be file
   */
  async open (filepath) {
    assert(filepath, 'need file path')
    this.filepath = filepath
    const stats = await stat(this.filepath)
    assert(stats.isFile(), 'should be file')
    const size = Math.min(this.options.bufferSize, stats.size)
    this[FILE_POSITION] = stats.size - 1
    this[BUFFER_POSITION] = -1
    this[EMPTY_FIRST_LINE] = false
    this[BUFFER] = Buffer.alloc(size)
    this[FD] = await open(this.filepath, this.options.flags)
  }

  /**
   * read trunk
   * @returns {boolean} false if nothing to read
   * @private
   */
  async [READ_TRUNK] () {
    if (this[FILE_POSITION] < 0) return false
    const position = this[FILE_POSITION] - this[BUFFER].length + 1
    const { bytesRead } = await read(this[FD], this[BUFFER], 0, this[BUFFER].length, Math.max(position, 0))
    this[FILE_POSITION] = position - 1
    this[BUFFER_POSITION] = bytesRead - 1
    return bytesRead > 0
  }

  /**
   * read line
   * @throws {Error} max line length exceed
   * @returns {string|boolean} line string or false if nothing to read
   * @private
   */
  async [READ_LINE] () {
    let index = 0
    let length = 0
    let tmp = false
    let res = false
    /* eslint-disable no-constant-condition */
    while (true) {
      if (this[BUFFER_POSITION] < 0) {
        tmp = await this[READ_TRUNK]()
        if (tmp === false) break
      }
      if (res === false) res = ''
      index = this[BUFFER].lastIndexOf(this.options.separator, this[BUFFER_POSITION])
      if (index === -1) {
        length += this[BUFFER_POSITION] + 1
        if (this.options.maxLineLength > 0 && length > this.options.maxLineLength) throw new Error('max line length exceed')
        res = this[BUFFER].toString(this.options.encoding, 0, this[BUFFER_POSITION] + 1) + res
        this[BUFFER_POSITION] = -1
      } else {
        length += this[BUFFER_POSITION] + 1 - index - this.options.separator.length
        if (this.options.maxLineLength > 0 && length > this.options.maxLineLength) throw new Error('max line length exceed')
        res = this[BUFFER].toString(this.options.encoding, index + this.options.separator.length, this[BUFFER_POSITION] + 1) + res
        this[BUFFER_POSITION] = index - 1
        // if there are more than one line and the first line is empty
        if (index === 0 && this[FILE_POSITION] < 0) this[EMPTY_FIRST_LINE] = true
        break
      }
    }
    // fix for empty first line case
    if (res === false && this[EMPTY_FIRST_LINE]) {
      this[EMPTY_FIRST_LINE] = false
      res = ''
    }
    return res
  }

  /**
   * read lines
   * @param {number} [line = 1] number of lines
   * @throws {AssertionError} should call open method before read
   * @returns {string[]} lines
   */
  async read (line = 1) {
    assert(this[FD] !== undefined, 'should call open method before read')
    const res = []
    let remain = line
    let tmp = ''
    while (remain > 0) {
      tmp = await this[READ_LINE]()
      if (tmp === false) break
      res.push(tmp)
      remain--
    }
    return res.reverse()
  }

  /**
   * close file
   * @throws {AssertionError} should call open method before close
   */
  async close () {
    assert(this[FD] !== undefined, 'should call open method before close')
    await close(this[FD])
    this[BUFFER] = undefined
    this[FD] = undefined
  }
}
