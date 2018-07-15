declare module 'readline-reverse' {
  interface options {
    flags?: string;
    separator?: string;
    encoding?: string;
    bufferSize?: number;
    maxLineLength?: number;
  }

  class ReadlineReverse {
    constructor (options?: options)
    open (filepath: string) : Promise<void>
    read (line?: number) : Promise<string[]>
    close () : Promise<void>
  }

  export = ReadlineReverse;
}
