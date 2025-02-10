export type Require<P extends keyof T, T> = Omit<T, P> & Required<Pick<T, P>>;
