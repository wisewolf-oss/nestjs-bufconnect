import { lastValueFrom, Observable, of } from 'rxjs';
import {
  isAsyncGenerator,
  observableToAsyncGenerator,
  toAsyncGenerator,
  transformToObservable,
} from './async.util';

describe('async', () => {
  describe('transformToObservable', () => {
    it('should return the same Observable when given an Observable', () => {
      const input = new Observable();
      const result = transformToObservable(input);

      expect(result).toBe(input);
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

      await expect(lastValueFrom(result)).rejects.toThrow('test-error');
    });
  });

  describe('isAsyncGenerator', () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    it('should return true if the input is an AsyncGenerator', async () => {
      // eslint-disable-next-line @typescript-eslint/require-await
      async function* asyncGenerator() {
        yield 1;
        yield 2;
        yield 3;
      }

      const asyncGen = asyncGenerator();
      expect(isAsyncGenerator(asyncGen)).toBe(true);
    });

    it('should return false if the input is not an AsyncGenerator', () => {
      const notAsyncGenerator = {};
      expect(isAsyncGenerator(notAsyncGenerator)).toBe(false);
    });
  });

  describe('observableToAsyncGenerator', () => {
    it('should convert an Observable to an AsyncGenerator', async () => {
      const source$ = of(1, 2, 3);
      const asyncGen = observableToAsyncGenerator(source$);
      const result: number[] = [];

      async function collectValuesFromAsyncGenerator(
        asyncIterator: AsyncGenerator<number>
      ): Promise<number[]> {
        const next = await asyncIterator.next();
        if (next.done) return result;

        result.push(next.value);
        return collectValuesFromAsyncGenerator(asyncIterator);
      }

      const collectedValues = await collectValuesFromAsyncGenerator(asyncGen);
      expect(collectedValues).toEqual([1, 2, 3]);
    });
  });

  describe('toAsyncGenerator', () => {
    async function collectValuesFromAsyncGenerator<T>(
      asyncIterator: AsyncGenerator<T>
    ): Promise<T[]> {
      const result: T[] = [];

      async function collectValuesRecursively() {
        const next = await asyncIterator.next();
        if (next.done) return;

        result.push(next.value);
        await collectValuesRecursively();
      }

      await collectValuesRecursively();
      return result;
    }

    it('should convert an Observable to an AsyncGenerator', async () => {
      const source$ = of(1, 2, 3);
      const asyncGen = toAsyncGenerator(source$);

      const collectedValues = await collectValuesFromAsyncGenerator(asyncGen);
      expect(collectedValues).toEqual([1, 2, 3]);
    });

    it('should return the same AsyncGenerator when passed an AsyncGenerator', async () => {
      // eslint-disable-next-line @typescript-eslint/require-await
      async function* asyncGeneratorWithValues() {
        yield 10;
        yield 9;
        yield 8;
      }

      const asyncGen1 = asyncGeneratorWithValues();
      const convertedAsyncGen = toAsyncGenerator(asyncGen1);

      // Create a new generator instance for the original generator
      const asyncGen2 = asyncGeneratorWithValues();

      const collectedValuesFromOriginal = await collectValuesFromAsyncGenerator(
        asyncGen2
      );

      const collectedValuesFromConverted =
        await collectValuesFromAsyncGenerator(convertedAsyncGen);

      expect(collectedValuesFromOriginal).toEqual([10, 9, 8]);
      expect(collectedValuesFromConverted).toEqual([10, 9, 8]);
    });

    it('should throw an error for unsupported input types', async () => {
      const unsupportedInput = {};

      async function collectValuesFromUnsupportedAsyncGenerator(): Promise<void> {
        // eslint-disable-next-line no-useless-catch
        try {
          const asyncGen = toAsyncGenerator(
            unsupportedInput as unknown as Observable<unknown>
          );

          await collectValuesFromAsyncGenerator(asyncGen);
          // eslint-disable-next-line sonarjs/no-useless-catch
        } catch (error) {
          throw error;
        }
      }

      await expect(
        collectValuesFromUnsupportedAsyncGenerator()
      ).rejects.toThrowError(
        'Unsupported input type. Expected an Observable or an AsyncGenerator.'
      );
    });
  });
});
