import { SetStateAction, WritableAtom } from "jotai";

export type Require<P extends keyof T, T> = Omit<T, P> & Required<Pick<T, P>>;

export type WriteableAtom<T> = WritableAtom<T, [SetStateAction<T>], void>;
