import { ConnectRouter } from '@bufbuild/connect';
import { connectNodeAdapter } from '@bufbuild/connect-node';
import { isString } from '@nestjs/common/utils/shared.utils';
import {
  CustomTransportStrategy,
  MessageHandler,
  Server,
} from '@nestjs/microservices';
import * as http from 'http';

import { CustomMetadataStore } from './nestjs-bufconnect.provider';
import { HTTPServer } from './server';
import { BufConnectServerOptions } from './nestjs-bufconnect.interface';
import { DEFAULT_BUFCONNECT_SERVER_OPTIONS } from './nestjs-bufconnect.constants';
import { addServicesToRouter, createServiceHandlersMap } from './util';

/**
 * A custom transport strategy for NestJS microservices that integrates with the '@bufbuild/connect' package.
 *
 * Example usage:
 *
 * ```ts
 * import { NestFactory } from '@nestjs/core';
 * import { MicroserviceOptions, Transport } from '@nestjs/microservices';
 * import { ServerBufConnect } from '@wisewolf-oss/nestjs-bufconnect';
 * import { AppModule } from './app/app.module';
 *
 * async function bootstrap() {
 *   const app = await NestFactory.createMicroservice<MicroserviceOptions>(
 *     AppModule,
 *     {
 *       strategy: new ServerBufConnect(),
 *     }
 *   );
 *
 *   await app.listen();
 * }
 *
 * bootstrap();
 * ```
 */
export class ServerBufConnect
  extends Server
  implements CustomTransportStrategy
{
  private readonly CustomMetadataStore: CustomMetadataStore | null = null;

  private server: HTTPServer | null = null;

  private readonly Options: BufConnectServerOptions;

  /**
   * Constructor for ServerBufConnect.
   */
  constructor(options: Partial<BufConnectServerOptions> = {}) {
    super();
    this.CustomMetadataStore = CustomMetadataStore.getInstance();
    this.Options = { ...DEFAULT_BUFCONNECT_SERVER_OPTIONS, ...options };
  }

  /**
   * Starts the HTTP server, listening on the specified port.
   * @param {callback} [callback] - An optional callback to be executed when the server starts listening.
   * @returns {Promise<void>} A promise that resolves when the server starts listening.
   */
  async listen(
    callback: (error?: unknown, ...optionalParameters: unknown[]) => void
  ): Promise<void> {
    try {
      const router = this.buildRouter();
      const serverInstance = http.createServer(
        connectNodeAdapter({
          routes: router,
        })
      );
      this.server = new HTTPServer(serverInstance);
      await this.server.listen(this.Options.serverPort, () => {
        callback();
      });
    } catch (error) {
      callback(error);
    }
  }

  /**
   * Stops the HTTP server.
   * @returns {Promise<void>} A promise that resolves when the server stops.
   */
  public async close(): Promise<void> {
    await this.server?.close();
  }

  /**
   * Adds a message handler for the given pattern.
   * @param pattern - The pattern associated with the message handler.
   * @param callback - The message handler function.
   * @param isEventHandler - Optional flag to mark the message handler as an event handler. Defaults to false.
   */
  public override addHandler(
    pattern: unknown,
    callback: MessageHandler,
    isEventHandler = false
  ) {
    const route = isString(pattern) ? pattern : JSON.stringify(pattern);

    const callbackWithEventHandler: MessageHandler<unknown, unknown, unknown> =
      Object.assign((message: unknown) => callback(message), {
        isEventHandler,
      });

    this.messageHandlers.set(route, callbackWithEventHandler);
  }

  /**
   * Builds the ConnectRouter with the server's message handlers.
   * @returns A function that takes a ConnectRouter and configures it with the server's message handlers.
   */
  buildRouter() {
    return (router: ConnectRouter) => {
      if (this.CustomMetadataStore) {
        const serviceHandlersMap = createServiceHandlersMap(
          this.getHandlers(),
          this.CustomMetadataStore
        );
        addServicesToRouter(
          router,
          serviceHandlersMap,
          this.CustomMetadataStore
        );
      }
    };
  }
}
