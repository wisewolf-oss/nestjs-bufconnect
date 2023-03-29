import * as http from 'http';
import { Logger } from '@nestjs/common';
import { HttpServerInstance } from '../nestjs-bufconnect.interface';

/**
 * The HTTPServer class provides a simple wrapper around Node.js `http.Server` instances,
 * allowing you to start and stop an HTTP server with promises.
 */
export class HTTPServer {
  private readonly ServerInstance: HttpServerInstance | null = null;

  private server: http.Server | null = null;

  /**
   * Creates a new HTTPServer instance.
   * @param {http.Server} serverInstance - The Node.js `http.Server` instance to manage.
   */
  constructor(serverInstance: HttpServerInstance) {
    this.ServerInstance = serverInstance;
  }

  /**
   * Starts the HTTP server, listening on the specified port.
   * @param {number} port - The port on which the server should listen.
   * @param {() => void} [callback] - An optional callback function that will be called when the server starts listening.
   * @returns {Promise<void>} A promise that resolves when the server starts listening.
   */
  listen(port: number, callback?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ServerInstance === null) {
        Logger.error('Server instance is not provided');
        reject(new Error('Server instance is not provided'));
      } else {
        this.server = this.ServerInstance;
        this.server.listen(port, () => {
          if (callback) callback();
          resolve();
        });
      }
    });
  }

  /**
   * Stops the HTTP server.
   * @param {() => void} [callback] - An optional callback function that will be called when the server stops.
   * @returns {Promise<void>} A promise that resolves when the server stops.
   */
  close(callback?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server === null) {
        Logger.warn('Server is not running');
        reject(new Error('Server is not running'));
      } else {
        this.server.close(() => {
          this.server = null;
          if (callback) callback();
          resolve();
        });
      }
    });
  }
}
