import {
  connectNodeAdapter,
  createGrpcTransport,
} from '@bufbuild/connect-node';
import { ConnectRouter, createPromiseClient } from '@bufbuild/connect';
import * as http2 from 'http2';
import { GrpcMethodStreamingType, MessageHandler } from '@nestjs/microservices';
import { CustomMetadataStore } from './nestjs-bufconnect.provider';
import {
  BufConnectMethod,
  BufConnectService,
} from './nestjs-bufconnect.decorator';
import { ElizaTestService, SayR } from '../test-utils/mocks/service.test';
import {
  addServicesToRouter,
  createPattern,
  createServiceHandlersMap,
} from './util';

@BufConnectService(ElizaTestService)
class TestService {
  // eslint-disable-next-line class-methods-use-this
  @BufConnectMethod()
  say(request: SayR): SayR {
    return { sentence: `you said: ${request.sentence}` } as SayR;
  }
}
describe('BufConnectMethod decorators', () => {
  it('should properly decorate a class with BufConnectService and BufConnectMethod and run', async () => {
    let port = -1;
    function routes(router: ConnectRouter) {
      const customMetadataStore = CustomMetadataStore.getInstance();
      const handlers = new Map<string, MessageHandler>();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/require-await
      const handler: MessageHandler = async (data: any) => {
        const serviceInstance = new TestService();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return serviceInstance.say(data);
      };

      const pattern = createPattern(
        ElizaTestService.typeName,
        'say',
        GrpcMethodStreamingType.NO_STREAMING
      );
      handlers.set(pattern, handler);

      const serviceHandlersMap = createServiceHandlersMap(
        handlers,
        customMetadataStore
      );
      addServicesToRouter(router, serviceHandlersMap, customMetadataStore);
    }

    function startServer() {
      return new Promise<http2.Http2Server>((resolve) => {
        const handler = connectNodeAdapter({ routes });
        const server = http2.createServer(handler).listen(0, () => {
          const a = server.address();
          if (a !== null && typeof a !== 'string') {
            port = a.port;
          }
          resolve(server);
        });
      });
    }

    async function runClient() {
      const transport = createGrpcTransport({
        baseUrl: `http://localhost:${port}`,
        httpVersion: '2',
      });
      const client = createPromiseClient(ElizaTestService, transport);
      const response = await client.say({ sentence: 'I feel happy.' });
      expect(response.sentence).toBe('you said: I feel happy.');
    }

    const server = await startServer();
    await runClient();
    server.close();
  });
});
