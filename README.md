# readline-reverse

Readline reversely in nodejs.

[![appveyor](https://ci.appveyor.com/api/projects/status/github/BaffinLee/readline-reverse?branch=master&svg=true)](https://ci.appveyor.com/project/BaffinLee/readline-reverse)
[![travis-ci](https://travis-ci.org/BaffinLee/readline-reverse.svg?branch=master)](https://travis-ci.org/BaffinLee/readline-reverse)
[![codecov](https://codecov.io/gh/BaffinLee/readline-reverse/branch/master/graph/badge.svg)](https://codecov.io/gh/r-lib/objectable)
[![npm](https://img.shields.io/npm/v/readline-reverse.svg)](https://www.npmjs.com/package/readline-reverse)
[![GitHub release](https://img.shields.io/github/release/BaffinLee/readline-reverse.svg)](https://github.com/BaffinLee/readline-reverse/releases)
[![GitHub issues](https://img.shields.io/github/issues/BaffinLee/readline-reverse.svg)](https://github.com/BaffinLee/readline-reverse/issues)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/baffinlee/readline-reverse)

## Feature

- Easy to use.
- Clear source code.
- Test coverage: 100%.
- Optimized.

## Install

```bash
npm install readline-reverse
```

## How to use

```javascript
const ReadlineReverse = require('readline-reverse')
// init
const reader = new ReadlineReverse()
// open file
await reader.open('/path/to/your/file')
// read n lines reversely
const lastThreeLine = await reader.read(3)
// close file
await reader.close()
```

## Api

### constructor(options = {})

| Param | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| `options` | `object` | `{}` | options |
| `options.flags` | `string` | `r` | open file with flag |
| `options.separator` | `string` | `\n` | line separator |
| `options.encoding` | `string` | `utf8` | read file with encoding |
| `options.bufferSize` | `string` | `4096` | read buffer size, better be the average size of one line |

### open(filepath)

| Param | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| `filepath` | `string` |  | path of the file your want to read |

### read(line = 1) ⇒ string[]

| Param | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| `line` | `number` | `1` | number of lines |

### close()

| Param | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| none |  |  |  |

## License

```
MIT License

Copyright (c) 2018 Baffin Lee

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
