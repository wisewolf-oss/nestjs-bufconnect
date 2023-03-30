import { ConnectRouter, createConnectRouter } from '@bufbuild/connect';
import { MessageHandler } from '@nestjs/microservices';
import { CustomMetadataStore } from '../nestjs-bufconnect.provider';
import { ElizaTestService, SayR } from '../../test-utils/mocks/service.test';
import { addServicesToRouter, createServiceHandlersMap } from './router.util';

describe('router', () => {
  let router: ConnectRouter;
  let customMetadataStore: CustomMetadataStore;
  let handlers: Map<string, MessageHandler>;

  const sayHandler: MessageHandler = async (message: SayR) =>
    new Promise((resolve) => {
      resolve({ sentence: `You said: ${message.sentence}` });
    });

  beforeEach(() => {
    router = createConnectRouter();
    customMetadataStore = CustomMetadataStore.getInstance();
    customMetadataStore.set(ElizaTestService.typeName, ElizaTestService);

    handlers = new Map<string, MessageHandler>();
  });

  describe('createServiceHandlersMap', () => {
    it('should create a service handlers map', () => {
      handlers.set(
        JSON.stringify({ service: ElizaTestService.typeName, rpc: 'say' }),
        sayHandler
      );

      const serviceHandlersMap = createServiceHandlersMap(
        handlers,
        customMetadataStore
      );

      expect(serviceHandlersMap[ElizaTestService.typeName]).toBeDefined();
      expect(serviceHandlersMap[ElizaTestService.typeName]).toHaveProperty(
        'say'
      );
    });
  });

  describe('addServicesToRouter', () => {
    it('should add services to the router', () => {
      handlers.set(
        JSON.stringify({ service: ElizaTestService.typeName, rpc: 'say' }),
        sayHandler
      );

      const serviceHandlersMap = createServiceHandlersMap(
        handlers,
        customMetadataStore
      );

      addServicesToRouter(router, serviceHandlersMap, customMetadataStore);

      expect(router.handlers).toHaveLength(1);
      expect(router.handlers[0].service).toBe(ElizaTestService);
      expect(router.handlers[0].service.methods).toHaveProperty('say');
    });
  });
});
