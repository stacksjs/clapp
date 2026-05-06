import { Readable, Writable } from 'node:stream';
export declare class MockWritable extends Writable {
  buffer: string[];
  _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): void;
}
export declare class MockReadable extends Readable {
  protected _buffer: unknown[] | null;
  _read(): void;
  pushValue(val: unknown): void;
  close(): void;
}
