import {
  createGrpcMethodMetadata,
  MessagePattern,
  Transport,
} from '@nestjs/microservices';

import { ServiceType } from '@bufbuild/protobuf';
import { METHOD_DECORATOR_KEY } from './nestjs-bufconnect.constants';
import {
  ConstructorWithPrototype,
  FunctionPropertyDescriptor,
  MethodKey,
  MethodKeys,
} from './nestjs-bufconnect.interface';
import { CustomMetadataStore } from './nestjs-bufconnect.provider';

function isFunctionPropertyDescriptor(
  descriptor: PropertyDescriptor | undefined
): descriptor is FunctionPropertyDescriptor {
  return descriptor !== undefined && typeof descriptor.value === 'function';
}

/**
 * Decorator for defining a gRPC service and its methods. It uses the metadata from
 * `BufConnectMethod` to initialize the service and its methods.
 *
 * @param serviceName - A `BufConnectServiceDefinition` object that defines the gRPC service.
 * @returns A class decorator that can be applied to a class implementing the gRPC service.
 */
export const BufConnectService =
  (serviceName: ServiceType): ClassDecorator =>
  (target: ConstructorWithPrototype) => {
    const methodKeys: MethodKeys =
      Reflect.getMetadata(METHOD_DECORATOR_KEY, target) || [];

    methodKeys.forEach((methodImpl) => {
      const functionName = methodImpl.key;

      const descriptor = Object.getOwnPropertyDescriptor(
        target.prototype,
        functionName
      );

      if (isFunctionPropertyDescriptor(descriptor)) {
        const metadata = createGrpcMethodMetadata(
          descriptor.value,
          functionName,
          serviceName.typeName,
          functionName
        );

        const customMetadataStore = CustomMetadataStore.getInstance();
        customMetadataStore.set(serviceName.typeName, serviceName);

        MessagePattern(metadata, Transport.GRPC)(
          target.prototype,
          functionName,
          descriptor
        );
      }
    });
  };

/**
 * Decorator for a gRPC method within a `BufConnectService`. It stores the method's metadata,
 * which is later used by `BufConnectService` to initialize the method.
 *
 * @returns A method decorator that can be applied to a method implementing a gRPC method.
 */
export const BufConnectMethod =
  (): MethodDecorator => (target: object, key: string | symbol) => {
    const metadata: MethodKey = {
      key: key.toString(),
    };

    const existingMethods =
      Reflect.getMetadata(METHOD_DECORATOR_KEY, target.constructor) ||
      new Set();

    if (!existingMethods.has(metadata)) {
      existingMethods.add(metadata);
      Reflect.defineMetadata(
        METHOD_DECORATOR_KEY,
        existingMethods,
        target.constructor
      );
    }
  };
