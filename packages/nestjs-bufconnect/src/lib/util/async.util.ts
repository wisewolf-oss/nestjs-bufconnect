import { Observable } from 'rxjs';
import { ResultOrDeferred } from '../nestjs-bufconnect.interface';

/**
 * Checks if the given input is an AsyncGenerator.
 *
 * @param input - The object to check.
 * @returns True if the input is an AsyncGenerator, false otherwise.
 */
export function isAsyncGenerator<T>(
  input: unknown
): input is AsyncGenerator<T> {
  return (
    typeof input === 'object' && input !== null && Symbol.asyncIterator in input
  );
}

/**
 * Converts an Observable to an AsyncGenerator.
 *
 * @param observable - The Observable to be converted.
 * @returns An AsyncGenerator that yields values from the provided Observable.
 */
export async function* observableToAsyncGenerator<T>(
  observable: Observable<T>
): AsyncGenerator<T> {
  const queue: T[] = [];
  let didComplete = false;
  let error: unknown = null;

  const subscriber = observable.subscribe({
    next: (value) => {
      queue.push(value);
    },
    error: (innerError) => {
      error = innerError;
      didComplete = true;
    },
    complete: () => {
      didComplete = true;
    },
  });

  try {
    while (!didComplete || queue.length > 0) {
      if (queue.length > 0) {
        const item = queue.shift();
        if (item !== undefined) {
          yield item;
        }
      } else {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    if (error) {
      throw new Error(String(error));
    }
  } finally {
    subscriber.unsubscribe();
  }
}

/**
 * Checks if the given object is an instance of Observable.
 *
 * @param object - The object to check.
 * @returns True if the object is an instance of Observable, false otherwise.
 */
export const isObservable = <T>(object: unknown): object is Observable<T> =>
  object instanceof Observable;

/**
 * Checks if the given object has a 'subscribe' function.
 *
 * @param object - The object to check.
 * @returns True if the object has a 'subscribe' function, false otherwise.
 */
export const hasSubscribe = (
  object: unknown
): object is { subscribe: () => void } =>
  typeof object === 'object' &&
  object !== null &&
  typeof (object as { subscribe?: () => void }).subscribe === 'function';

/**
 * Checks if the given object has a 'toPromise' function.
 *
 * @param object - The object to check.
 * @returns True if the object has a 'toPromise' function, false otherwise.
 */
export const hasToPromise = (
  object: unknown
): object is { toPromise: () => Promise<unknown> } =>
  typeof object === 'object' &&
  object !== null &&
  typeof (object as { toPromise?: () => Promise<unknown> }).toPromise ===
    'function';

/**
 * Transforms a given ResultOrDeferred into an Observable.
 *
 * @param resultOrDeferred - The ResultOrDeferred to be transformed.
 * @returns An Observable instance of the result or deferred.
 */
export const transformToObservable = <T>(
  resultOrDeferred: ResultOrDeferred<T>
): Observable<T> => {
  if (isObservable<T>(resultOrDeferred)) {
    return resultOrDeferred;
  }
  if (hasSubscribe(resultOrDeferred)) {
    return new Observable(() => resultOrDeferred.subscribe());
  }
  if (hasToPromise(resultOrDeferred)) {
    return new Observable((subscriber) => {
      resultOrDeferred
        .toPromise()
        .then((response: T) => {
          subscriber.next(response);
          subscriber.complete();
        })
        .catch((error: unknown) => subscriber.error(error));
    });
  }
  return new Observable((subscriber) => {
    subscriber.next(resultOrDeferred);
    subscriber.complete();
  });
};

/**
 * Converts an Observable or AsyncGenerator to an AsyncGenerator.
 *
 * @param input - The Observable or AsyncGenerator to be converted.
 * @returns An AsyncGenerator that yields values from the provided input.
 * @throws An Error if the input is neither an Observable nor an AsyncGenerator.
 */
export async function* toAsyncGenerator<T>(
  input: Observable<T> | AsyncGenerator<T>
): AsyncGenerator<T> {
  if (isObservable(input)) {
    yield* observableToAsyncGenerator(input);
  } else if (isAsyncGenerator(input)) {
    yield* input;
  } else {
    throw new Error(
      'Unsupported input type. Expected an Observable or an AsyncGenerator.'
    );
  }
}
