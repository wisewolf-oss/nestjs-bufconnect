import { ServiceType } from '@bufbuild/protobuf';

/**
 * Provides a storage mechanism for custom metadata associated with ServiceType instances from the '@bufbuild/protobuf' package.
 *
 * This is a singleton class, so use `CustomMetadataStore.getInstance()` to get the instance.
 *
 * Example usage:
 *
 * ```ts
 * const customMetadataStore = CustomMetadataStore.getInstance();
 *
 * customMetadataStore.set('myKey', myServiceType);
 * const myServiceTypeFromStore = customMetadataStore.get('myKey');
 * ```
 */
export class CustomMetadataStore {
  private static instance: CustomMetadataStore;

  private customMetadata: Map<string, ServiceType> = new Map();

  /**
   * Private constructor to enforce the singleton pattern.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /**
   * getInstance returns the singleton instance of the CustomMetadataStore,
   * creating it if it does not already exist.
   * @returns {CustomMetadataStore} The singleton instance of CustomMetadataStore.
   */
  public static getInstance(): CustomMetadataStore {
    if (!CustomMetadataStore.instance) {
      CustomMetadataStore.instance = new CustomMetadataStore();
    }
    return CustomMetadataStore.instance;
  }

  /**
   * set stores a ServiceType instance with the associated key in the store.
   * @param {string} key - The key to associate with the ServiceType instance.
   * @param {ServiceType} value - The ServiceType instance to store.
   */
  set(key: string, value: ServiceType): void {
    this.customMetadata.set(key, value);
  }

  /**
   * get retrieves the ServiceType instance associated with the given key,
   * returning undefined if the key is not found in the store.
   * @param {string} key - The key associated with the desired ServiceType instance.
   * @returns {ServiceType | undefined} The ServiceType instance associated with the key,
   *                                    or undefined if not found.
   */
  get(key: string): ServiceType | undefined {
    return this.customMetadata.get(key) ?? undefined;
  }
}
