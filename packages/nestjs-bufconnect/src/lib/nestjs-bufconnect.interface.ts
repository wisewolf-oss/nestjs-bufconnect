/**
 * This module provides types and interfaces for configuring a server instance with various protocols
 * (HTTP, HTTPS, HTTP2, HTTP2_INSECURE) and their options. It also provides types for handling
 * server instances and other utility types.
 */
import { ConnectRouterOptions } from '@bufbuild/connect';
import { IncomingMessage, ServerResponse } from 'http';
import * as http from 'http';
import * as https from 'https';
import * as http2 from 'http2';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import { Observable } from 'rxjs';

/**
 * Enum representing the supported server protocols.
 */
export enum ServerProtocol {
  HTTP = 'http',
  HTTPS = 'https',
  HTTP2 = 'http2',
  HTTP2_INSECURE = 'http2_insecure',
}

/**
 * Base interface for server options, containing common properties.
 */
export interface BaseServerOptions {
  port: number;
  connectOptions?: ConnectRouterOptions;
  callback?: () => void;
}

/**
 * Interface for HTTP server options.
 */
export interface HttpOptions extends BaseServerOptions {
  protocol: ServerProtocol.HTTP;
  serverOptions?: http.ServerOptions;
}

/**
 * Interface for HTTPS server options.
 */
export interface HttpsOptions extends BaseServerOptions {
  protocol: ServerProtocol.HTTPS;
  serverOptions: https.ServerOptions;
}

/**
 * Interface for HTTP2 server options (secure).
 */
export interface Http2Options extends BaseServerOptions {
  protocol: ServerProtocol.HTTP2;
  serverOptions: http2.SecureServerOptions;
}

/**
 * Interface for HTTP2 server options (insecure).
 */
export interface Http2InsecureOptions extends BaseServerOptions {
  protocol: ServerProtocol.HTTP2_INSECURE;
  serverOptions?: http2.ServerOptions;
}

/**
 * Union type for all supported server options.
 */
export type ServerTypeOptions =
  | HttpOptions
  | HttpsOptions
  | Http2Options
  | Http2InsecureOptions;

/**
 * Union type for all supported server instances or a null instance.
 */
export type ServerInstance =
  | http.Server
  | https.Server
  | http2.Http2Server
  | null;

/**
 * Type representing a function for handling HTTP/1.x requests and responses.
 */
export type Http1ServerInstance = (
  request: IncomingMessage,
  response: ServerResponse
) => void;

/**
 * Type representing a function for handling HTTP/2 requests and responses.
 */
export type Http2ServerInstance = (
  request: Http2ServerRequest,
  response: Http2ServerResponse
) => void;

/**
 * Interface representing a class with a prototype property that has a record of string keys mapping
 * to property descriptors.
 */
export interface ConstructorWithPrototype {
  prototype: Record<string, PropertyDescriptor>;
}

/**
 * Interface representing a method key object with a string key property.
 */
export interface MethodKey {
  key: string;
}

/**
 * Type representing an array of MethodKey objects.
 */
export type MethodKeys = Array<MethodKey>;

/**
 * Interface representing a property descriptor with a value that is a function with a specific
 * signature (accepting an array of arguments of type 'never' and returning a value of type 'never').
 */
export interface FunctionPropertyDescriptor extends PropertyDescriptor {
  value: (...arguments_: never[]) => never;
}

/**
 * Union type representing various possible result types or ways to handle deferred
 */
export type ResultOrDeferred<T> =
  | Observable<T>
  | { subscribe: () => void }
  | { toPromise: () => Promise<T> }
  | T;
