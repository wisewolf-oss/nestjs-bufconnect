import { Observable } from 'rxjs';
import { ResultOrDeferred } from '../nestjs-bufconnect.interface';

/**
 * Checks if the given object is an instance of Observable.
 *
 * @param object - The object to check.
 * @returns True if the object is an instance of Observable, false otherwise.
 */
const isObservable = <T>(object: unknown): object is Observable<T> =>
  object instanceof Observable;

/**
 * Checks if the given object has a 'subscribe' function.
 *
 * @param object - The object to check.
 * @returns True if the object has a 'subscribe' function, false otherwise.
 */
const hasSubscribe = (object: unknown): object is { subscribe: () => void } =>
  typeof object === 'object' &&
  object !== null &&
  typeof (object as { subscribe?: () => void }).subscribe === 'function';

/**
 * Checks if the given object has a 'toPromise' function.
 *
 * @param object - The object to check.
 * @returns True if the object has a 'toPromise' function, false otherwise.
 */
const hasToPromise = (
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
