import * as http from 'http';
import { Logger } from '@nestjs/common';
import { HttpServerInstance } from '../nestjs-bufconnect.interface';
import { HTTPServer } from './server';

describe('HTTPServer', () => {
  let httpServerInstance: HttpServerInstance;
  let httpServer: HTTPServer;

  beforeEach(() => {
    httpServerInstance = http.createServer();
    httpServer = new HTTPServer(httpServerInstance);
  });

  afterEach(async () => {
    if (httpServerInstance.listening) {
      await httpServer.close();
    }
  });

  it('should create an HTTPServer instance', () => {
    expect(httpServer).toBeDefined();
  });

  it('should start listening on the specified port', async () => {
    const port = 3000;
    const callback = jest.fn();

    await httpServer.listen(port, callback);

    expect(httpServerInstance.listening).toBe(true);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should fail to start listening if the server instance is not provided', async () => {
    const loggerSpy = jest.spyOn(Logger, 'error');
    const invalidHttpServer = new HTTPServer(
      null as unknown as HttpServerInstance
    );

    await expect(invalidHttpServer.listen(3000)).rejects.toThrow(
      'Server instance is not provided'
    );
    expect(loggerSpy).toHaveBeenCalledWith('Server instance is not provided');
  });

  it('should stop listening', async () => {
    const callback = jest.fn();
    await httpServer.listen(3000);
    expect(httpServerInstance.listening).toBe(true);

    await httpServer.close(callback);

    expect(httpServerInstance.listening).toBe(false);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should fail to stop listening if the server is not running', async () => {
    const loggerSpy = jest.spyOn(Logger, 'warn');
    await expect(httpServer.close()).rejects.toThrow('Server is not running');
    expect(loggerSpy).toHaveBeenCalledWith('Server is not running');
  });
});
