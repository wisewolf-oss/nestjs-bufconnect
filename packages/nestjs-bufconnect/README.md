[![GitHub license](https://img.shields.io/github/license/wisewolf-oss/nestjs-bufconnect?style=flat-square)](https://github.com/wisewolf-oss/nestjs-bufconnect/blob/main/LICENSE)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-conventionalcommits-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![codecov](https://codecov.io/gh/wisewolf-oss/nestjs-bufconnect/branch/beta/graph/badge.svg?token=M9I2MDMKJ2)](https://codecov.io/gh/wisewolf-oss/nestjs-bufconnect)
[![npm version](https://badge.fury.io/js/@wolfcoded%2Fnestjs-bufconnect.svg)](https://badge.fury.io/js/@wolfcoded%2Fnestjs-bufconnect)

#### Build Status

- @beta [![beta](https://github.com/wisewolf-oss/nestjs-bufconnect/actions/workflows/workflow-cicd.yml/badge.svg?branch=beta)](https://github.com/wisewolf-oss/nestjs-bufconnect/actions?query=branch%3Abeta)
- @main [![main](https://github.com/wisewolf-oss/nestjs-bufconnect/actions/workflows/workflow-cicd.yml/badge.svg?branch=main)](https://github.com/wisewolf-oss/nestjs-bufconnect/actions?query=branch%3Amain)

# NestJs BufConnect

NestJs BufConnect is a custom transport strategy for [NestJs microservices](https://docs.nestjs.com/microservices/basics) that integrates with the [Buf's gRPC implementation](https://connect.build/). The library provides easy-to-use decorators for gRPC services and methods, allowing you to define and implement gRPC services seamlessly in your NestJs applications.

**This project is in active development**

## Features

- Decorators for defining gRPC services and methods
- Integration with Buf's gRPC implementation
- Custom transport strategy for NestJs microservices
- Support for NestJs pipes, interceptors, guards, etc
- HTTP, HTTPS, and HTTP2 support (secure and insecure)
  - Able to configure http server options without being constrained by abstraction
- Support for gRPC streaming (**coming soon**)

## Installation

```bash
pnpm add @wolfcoded/nestjs-bufconnect
yarn add @wolfcoded/nestjs-bufconnect
npm install @wolfcoded/nestjs-bufconnect --save
```

## Usage

1. Import `ServerBufConnect` from the `@wolfcoded/nestjs-bufconnect` package.
   ```typescript
   import { ServerBufConnect } from '@wolfcoded/nestjs-bufconnect';
   ```
2. Create a new instance of `ServerBufConnect` and pass it as the strategy in your microservice options.

   ```typescript
   import { NestFactory } from '@nestjs/core';
   import { MicroserviceOptions } from '@nestjs/microservices';
   import {
     HttpOptions,
     ServerBufConnect,
     ServerProtocol,
   } from '@wolfcoded/nestjs-bufconnect';
   import { AppModule } from './app/app.module';

   const serverOptions: HttpOptions = {
     protocol: ServerProtocol.HTTP,
     port: 3000,
   };

   const app = await NestFactory.createMicroservice<MicroserviceOptions>(
     AppModule,
     {
       strategy: new ServerBufConnect(serverOptions),
     }
   );

   bootstrap();
   ```

3. Use the `BufConnectService` and `BufConnectMethod` decorators to define your gRPC services and methods.

   ```typescript
   import { Get } from '@nestjs/common';

   import {
     BufConnectMethod,
     BufConnectService,
   } from '@wolfcoded/nestjs-bufconnect';
   import { AppService } from './app.service';
   import { ElizaService } from '../gen/eliza_connect';
   import { SayRequest } from '../gen/eliza_pb';

   @BufConnectService(ElizaService)
   export class AppController {
     constructor(private readonly appService: AppService) {}
     // Standard controller method
     @Get()
     getData() {
       return this.appService.getData();
     }

     @BufConnectMethod()
     async say(request: SayRequest) {
       console.log('calling say');
       return {
         sentence: `say() said: ${request.sentence}`,
       };
     }
   }
   ```

### HTTP Support

NestJs BufConnect now provides support for different server protocols, including HTTP, HTTPS, and HTTP2 (secure and insecure). You can configure the desired protocol in the server options passed to the `ServerBufConnect` instance:

```typescript
import {
  HttpOptions,
  ServerBufConnect,
  ServerProtocol,
} from '@wolfcoded/nestjs-bufconnect';

const serverOptions: HttpOptions = {
  protocol: ServerProtocol.HTTP, // or ServerProtocol.HTTPS, ServerProtocol.HTTP2, ServerProtocol.HTTP2_INSECURE
  port: 3000,
};

const strategy = new ServerBufConnect(serverOptions);
```

For HTTPS and HTTP2, you will need to provide additional options such as `key`, `cert`, and other relevant configuration options.

For example:

```typescript
import {
  HttpsOptions,
  ServerBufConnect,
  ServerProtocol,
} from '@wolfcoded/nestjs-bufconnect';

const serverOptions: HttpsOptions = {
  protocol: ServerProtocol.HTTPS,
  port: 3000,
  serverOptions: {
    key: fs.readFileSync('path/to/your/private-key.pem'),
    cert: fs.readFileSync('path/to/your/certificate.pem'),
  },
};

const strategy = new ServerBufConnect(serverOptions);
```

This flexibility allows you to choose the right protocol for your application's requirements and security needs.

#### NOTE

You can generate a self-signed certificate quickly to get up and running quickly.

Install [selfsigned](https://www.npmjs.com/package/selfsigned)

```typescript
import * as selfsigned from 'selfsigned';
const attributes = [{ name: 'commonName', value: 'NestJsBufConnect' }];
const pems = selfsigned.generate(attributes, { days: 1 });
```

## Todo

- [ ] Add support for client-side gRPC services
- [ ] Add support for gRPC streaming (already stubbed)

# MIT License

Copyright 2023 Patrick Wolf <patrick.wolf@wisewolf.ai>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
