/**
 * A constant string used as a key for storing and retrieving method decorator metadata.
 * This key is used with `Reflect` to associate metadata with gRPC methods.
 */
export const METHOD_DECORATOR_KEY = Symbol('METHOD_DECORATOR_KEY');

/**
 * A constant string used as a key for storing and retrieving stream method decorator metadata.
 * This key is used with `Reflect` to associate metadata with gRPC stream methods.
 */
export const STREAM_METHOD_DECORATOR_KEY = Symbol(
  'STREAM_METHOD_DECORATOR_KEY'
);

/**
 * A constant symbol used as a key for storing and retrieving the Buf transport metadata.
 * This key is used with `Reflect` to associate metadata with the Buf transport.
 */
export const BUF_TRANSPORT = Symbol('BUF_TRANSPORT');
