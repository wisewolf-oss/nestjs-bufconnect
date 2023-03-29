import { BufConnectServerOptions } from './nestjs-bufconnect.interface';

/**
 * A constant string used as a key for storing and retrieving method decorator metadata.
 * This key is used with `Reflect` to associate metadata with gRPC methods.
 */
export const METHOD_DECORATOR_KEY = 'bufconnect:method:decorator:key';
export const DEFAULT_BUFCONNECT_SERVER_OPTIONS: BufConnectServerOptions = {
  serverPort: 8080,
};
