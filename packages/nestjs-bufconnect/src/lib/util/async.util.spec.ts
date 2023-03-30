import { lastValueFrom, Observable } from 'rxjs';
import { transformToObservable } from './async.util';

describe('async', () => {
  describe('transformToObservable', () => {
    it('should return the same Observable when given an Observable', () => {
      const input = new Observable();
      const result = transformToObservable(input);

      expect(result).toBe(input);
    });

    it('should create a new Observable when given an object with subscribe', () => {
      const input = {
        subscribe: () => {},
      };

      const result = transformToObservable(input);

      expect(result).toBeInstanceOf(Observable);
    });

    it('should create a new Observable when given an object with toPromise', async () => {
      const expectedResult = 'test-result';
      const input = {
        toPromise: () => Promise.resolve(expectedResult),
      };

      const result = transformToObservable(input);
      const resultValue = await lastValueFrom(result);

      expect(result).toBeInstanceOf(Observable);
      expect(resultValue).toBe(expectedResult);
    });

    it('should create a new Observable when given a plain value', async () => {
      const input = 'test-value';

      const result = transformToObservable(input);
      const resultValue = await lastValueFrom(result);

      expect(result).toBeInstanceOf(Observable);
      expect(resultValue).toBe(input);
    });

    it('should propagate error when given an object with toPromise that rejects', async () => {
      const input = {
        toPromise: () => Promise.reject(new Error('test-error')),
      };

      const result = transformToObservable(input);

      await expect(await lastValueFrom(result)).rejects.toThrow('test-error');
    });
  });
});
