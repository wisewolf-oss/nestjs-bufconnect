import { ConnectRouter, createConnectRouter } from '@connectrpc/connect';
import { MessageHandler } from '@nestjs/microservices';
import { MethodType } from '../nestjs-bufconnect.interface';
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
        JSON.stringify({
          service: ElizaTestService.typeName,
          rpc: 'say',
          streaming: MethodType.NO_STREAMING,
        }),
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

    it('should not add handler if handlerMetadata is not defined', () => {
      // Add an undefined handler for the test
      handlers.set(
        JSON.stringify({
          service: ElizaTestService.typeName,
          rpc: 'undefinedHandler',
          streaming: MethodType.NO_STREAMING,
        }),
        {} as MessageHandler
      );

      const serviceHandlersMap = createServiceHandlersMap(
        handlers,
        customMetadataStore
      );

      expect(serviceHandlersMap[ElizaTestService.typeName]).toBeUndefined();
    });

    it('should not add handler if service is not found in customMetadataStore', () => {
      const invalidServiceName = 'InvalidService';

      handlers.set(
        JSON.stringify({
          service: invalidServiceName,
          rpc: 'say',
          streaming: MethodType.NO_STREAMING,
        }),
        sayHandler
      );

      const serviceHandlersMap = createServiceHandlersMap(
        handlers,
        customMetadataStore
      );

      expect(serviceHandlersMap[invalidServiceName]).toBeUndefined();
    });

    it('should not add handler if methodProto is not found', () => {
      const invalidMethodName = 'invalidMethod';

      handlers.set(
        JSON.stringify({
          service: ElizaTestService.typeName,
          rpc: invalidMethodName,
          streaming: MethodType.NO_STREAMING,
        }),
        sayHandler
      );

      const serviceHandlersMap = createServiceHandlersMap(
        handlers,
        customMetadataStore
      );

      // Check if the serviceHandlersMap entry for ElizaTestService.typeName exists
      if (serviceHandlersMap[ElizaTestService.typeName]) {
        // Check for the absence of the invalidMethodName property
        expect(
          serviceHandlersMap[ElizaTestService.typeName]
        ).not.toHaveProperty(invalidMethodName);
      } else {
        // If the entry does not exist, the test case is successful as the handler was not added
        expect(serviceHandlersMap[ElizaTestService.typeName]).toBeUndefined();
      }
    });
  });

  describe('addServicesToRouter', () => {
    it('should add services to the router', () => {
      handlers.set(
        JSON.stringify({
          service: ElizaTestService.typeName,
          rpc: 'say',
          streaming: MethodType.NO_STREAMING,
        }),
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

    it('should create a service handlers map with RX_STREAMING', () => {
      handlers.set(
        JSON.stringify({
          service: ElizaTestService.typeName,
          rpc: 'say',
          streaming: MethodType.RX_STREAMING,
        }),
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
});
