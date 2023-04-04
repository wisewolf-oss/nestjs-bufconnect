import * as http from 'http';
import * as https from 'https';
import * as http2 from 'http2';
import { ConnectRouter } from '@bufbuild/connect';
import { connectNodeAdapter } from '@bufbuild/connect-node';
import {
  Http2InsecureOptions,
  Http2Options,
  ServerTypeOptions,
  HttpsOptions,
  ServerProtocol,
  HttpOptions,
  ServerInstance,
} from '../nestjs-bufconnect.interface';

/**
 * The HTTPServer class is responsible for creating and managing the server instance based on the given options.
 * It supports HTTP, HTTPS, and HTTP2 (secure and insecure) protocols.
 */
export class HTTPServer {
  private serverPrivate: ServerInstance = null;

  set server(value: http.Server | https.Server | http2.Http2Server | null) {
    this.serverPrivate = value;
  }

  get server(): http.Server | https.Server | http2.Http2Server | null {
    return this.serverPrivate;
  }

  /**
   * Constructor for the HTTPServer class.
   * @param options - Server configuration options.
   * @param router - A function that takes a ConnectRouter and configures it with the server's message handlers.
   */
  constructor(
    private readonly options: ServerTypeOptions,
    private readonly router: (router: ConnectRouter) => void
  ) {}

  /**
   * Starts the server and listens for incoming requests.
   * @returns A promise that resolves when the server starts listening.
   */
  async listen(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.startServer(resolve, reject);
    });
  }

  /**
   * Creates an HTTP server.
   * @returns An instance of an HTTP server.
   */
  createHttpServer(): http.Server {
    const { serverOptions = {}, connectOptions = {} } = this
      .options as HttpOptions;

    return http.createServer(
      serverOptions,
      connectNodeAdapter({
        ...connectOptions,
        routes: this.router,
      })
    );
  }

  /**
   * Creates an HTTPS server.
   * @returns An instance of an HTTPS server.
   */
  createHttpsServer(): https.Server {
    const { serverOptions = {}, connectOptions = {} } = this
      .options as HttpsOptions;

    return https.createServer(
      serverOptions,
      connectNodeAdapter({ ...connectOptions, routes: this.router })
    );
  }

  /**
   * Creates an HTTP2 server with secure connection.
   * @returns An instance of an HTTP2 server with secure connection.
   */
  createHttp2Server(): http2.Http2Server {
    const { serverOptions = {}, connectOptions = {} } = this
      .options as Http2Options;

    return http2.createSecureServer(
      serverOptions,
      connectNodeAdapter({ ...connectOptions, routes: this.router })
    );
  }

  /**
   * Creates an HTTP2 server with secure connection.
   * @returns An instance of an HTTP2 server with secure connection.
   */
  createHttp2InsecureServer(): http2.Http2Server {
    const { serverOptions = {}, connectOptions = {} } = this
      .options as Http2InsecureOptions;

    return http2.createServer(
      serverOptions,
      connectNodeAdapter({ ...connectOptions, routes: this.router })
    );
  }

  /**
   * Starts the server based on the provided protocol in the options.
   * @param resolve - A function that resolves the promise when the server starts successfully.
   * @param reject - A function that rejects the promise with an error when the server fails to start.
   */
  startServer(resolve: () => void, reject: (error: Error) => void): void {
    try {
      switch (this.options.protocol) {
        case ServerProtocol.HTTP: {
          this.server = this.createHttpServer();
          break;
        }
        case ServerProtocol.HTTPS: {
          this.server = this.createHttpsServer();
          break;
        }
        case ServerProtocol.HTTP2: {
          this.server = this.createHttp2Server();
          break;
        }
        case ServerProtocol.HTTP2_INSECURE: {
          this.server = this.createHttp2InsecureServer();
          break;
        }
        default: {
          // eslint-disable-next-line no-throw-literal
          throw new Error('Invalid protocol option');
        }
      }

      this.server.listen(this.options.port, () => {
        if (this.options.callback) this.options.callback();
        resolve();
      });
    } catch (error) {
      if (error instanceof Error) {
        reject(error);
      } else {
        reject(new Error('Unknown error occurred'));
      }
    }
  }

  /**
   * Stops the server and releases all resources.
   * @param callback - An optional callback function to be executed when the server stops.
   * @returns A promise that resolves when the server stops.
   */
  close(callback?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server === null) {
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
