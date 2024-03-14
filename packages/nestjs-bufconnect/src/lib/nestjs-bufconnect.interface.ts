/**
 * This module provides types and interfaces for configuring a server instance with various protocols
 * (HTTP, HTTPS, HTTP2, HTTP2_INSECURE) and their options. It also provides types for handling
 * server instances and other utility types.
 */
import { ConnectRouterOptions } from '@connectrpc/connect';
import * as http from 'http';
import * as https from 'https';
import * as http2 from 'http2';
import { Observable } from 'rxjs';

/**
 * Represents a pattern for BufConnect, which includes the service name, RPC method name, and streaming method type.
 */
export interface BufConnectPattern {
  service: string;
  rpc: string;
  streaming: MethodType;
}

/**
 * Enum representing the different method types for gRPC streaming.
 */
export enum MethodType {
  NO_STREAMING = 'no_stream',
  RX_STREAMING = 'rx_stream',
}

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
 * Interface for HTTP server options, extending the BaseServerOptions with an HTTP protocol type and HTTP server options.
 */
export interface HttpOptions extends BaseServerOptions {
  protocol: ServerProtocol.HTTP;
  serverOptions?: http.ServerOptions;
}

/**
 * Interface for HTTPS server options, extending the BaseServerOptions with an HTTPS protocol type and HTTPS server options.
 */
export interface HttpsOptions extends BaseServerOptions {
  protocol: ServerProtocol.HTTPS;
  serverOptions: https.ServerOptions;
}

/**
 * Interface for HTTP2 server options (secure), extending the BaseServerOptions with an HTTP2 protocol type and secure HTTP2 server options.
 */
export interface Http2Options extends BaseServerOptions {
  protocol: ServerProtocol.HTTP2;
  serverOptions: http2.SecureServerOptions;
}

/**
 * Interface for HTTP2 server options (insecure), extending the BaseServerOptions with an HTTP2_INSECURE protocol type and HTTP2 server options.
 */
export interface Http2InsecureOptions extends BaseServerOptions {
  protocol: ServerProtocol.HTTP2_INSECURE;
  serverOptions?: http2.ServerOptions;
}

/**
 * Union type for all supported server options (HTTP, HTTPS, HTTP2, HTTP2_INSECURE).
 */
export type ServerTypeOptions =
  | HttpOptions
  | HttpsOptions
  | Http2Options
  | Http2InsecureOptions;

/**
 * Union type for all supported server instances (http.Server, https.Server, http2.Http2Server) or a null instance.
 */
export type ServerInstance =
  | http.Server
  | https.Server
  | http2.Http2Server
  | null;

/**
 * Interface representing a class with a prototype property that has a record of string keys mapping to property descriptors.
 */
export interface ConstructorWithPrototype {
  prototype: Record<string, PropertyDescriptor>;
}

/**
 * Interface representing a method key object with a string key property and a method type.
 */
export interface MethodKey {
  key: string;
  methodType: MethodType;
}

/**
 * Type representing an array of MethodKey objects.
 */
export type MethodKeys = Array<MethodKey>;

/**
 * Interface representing a property descriptor with a value that is a function with a specific signature.
 */
export interface FunctionPropertyDescriptor extends PropertyDescriptor {
  value: (...arguments_: never[]) => never;
}

/**
 * Interface representing a property descriptor with a value that is a function with a specific signature.
 */
export type ResultOrDeferred<T> =
  | Observable<T>
  | { subscribe: () => void }
  | { toPromise: () => Promise<T> }
  | T;
