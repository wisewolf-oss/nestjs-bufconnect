import {
  ConnectRouter,
  HandlerContext,
  MethodImpl,
  ServiceImpl,
} from '@bufbuild/connect';
import { AnyMessage, ServiceType } from '@bufbuild/protobuf';
import { MessageHandler } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CustomMetadataStore } from '../nestjs-bufconnect.provider';
import { transformToObservable } from './async.util';

/**
 * Adds services to the given ConnectRouter using the provided serviceHandlersMap and customMetadataStore.
 *
 * @param router - The ConnectRouter to add services to.
 * @param serviceHandlersMap - An object containing service implementations for each service name.
 * @param customMetadataStore - A store containing metadata for the services.
 */
export const addServicesToRouter = (
  router: ConnectRouter,
  serviceHandlersMap: Record<string, Partial<ServiceImpl<ServiceType>>>,
  customMetadataStore: CustomMetadataStore
) => {
  Object.keys(serviceHandlersMap).forEach((serviceName) => {
    const service = customMetadataStore.get(serviceName);
    if (service) {
      router.service(service, serviceHandlersMap[serviceName]);
    }
  });
};

/**
 * Creates a map of service handlers using the provided handlers and customMetadataStore.
 * The map is keyed by service names with values being partial implementations of the ServiceType.
 *
 * @param handlers - A map of message handlers, keyed by JSON string patterns.
 * @param customMetadataStore - A store containing metadata for the services.
 * @returns A map of service handlers keyed by service names.
 */
export const createServiceHandlersMap = (
  handlers: Map<string, MessageHandler>,
  customMetadataStore: CustomMetadataStore
): Record<string, Partial<ServiceImpl<ServiceType>>> => {
  const serviceHandlersMap: Record<
    string,
    Partial<ServiceImpl<ServiceType>>
  > = {};

  handlers.forEach((handlerMetadata, pattern) => {
    const parsedPattern = JSON.parse(pattern);

    if (handlerMetadata) {
      const service = customMetadataStore.get(parsedPattern.service as string);
      const methodProto = service?.methods[parsedPattern.rpc];

      if (service && methodProto) {
        const handler = handlerMetadata as MethodImpl<typeof methodProto>;

        if (!serviceHandlersMap[parsedPattern.service]) {
          serviceHandlersMap[parsedPattern.service] = {};
        }

        serviceHandlersMap[parsedPattern.service][parsedPattern.rpc] = async (
          request: unknown,
          context: unknown
        ) => {
          const result = handler(
            request as AnyMessage & AsyncIterable<AnyMessage>,
            context as HandlerContext
          );

          const resultOrDeferred =
            result instanceof Promise ? await result : result;

          return lastValueFrom(transformToObservable(resultOrDeferred));
        };
      }
    }
  });

  return serviceHandlersMap;
};
