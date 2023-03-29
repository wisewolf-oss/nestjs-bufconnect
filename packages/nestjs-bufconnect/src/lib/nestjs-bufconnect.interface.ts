import { Observable } from 'rxjs';
import http from 'http';
import { ConnectRouterOptions } from '@bufbuild/connect';

/**
 * Defines the options for the BufConnectServer, extending the base ConnectRouterOptions.
 */
export interface BufConnectServerOptions extends ConnectRouterOptions {
  /**
   * The port number on which the server will listen for incoming connections.
   */
  serverPort: number;
}

/**
 * Alias for the `http.Server` type from the Node.js `http` module.
 */
export type HttpServerInstance = http.Server;

/**
 * Represents a class with a prototype property that has a record of string keys mapping
 * to property descriptors.
 */
export interface ConstructorWithPrototype {
  prototype: Record<string, PropertyDescriptor>;
}

/**
 * Represents a method key object with a string key property.
 */
export interface MethodKey {
  key: string;
}

/**
 * Represents an array of MethodKey objects.
 */
export type MethodKeys = Array<MethodKey>;

/**
 * Represents a property descriptor with a value that is a function with a specific
 * signature (accepting an array of arguments of type 'never' and returning a value of type 'never').
 */
export interface FunctionPropertyDescriptor extends PropertyDescriptor {
  value: (...arguments_: never[]) => never;
}

export type ResultOrDeferred<T> =
  | Observable<T>
  | { subscribe: () => void }
  | { toPromise: () => Promise<T> }
  | T;
