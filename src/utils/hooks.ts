import { atom as defaultAtom, useAtomValue, type PrimitiveAtom } from 'jotai';

const nullAtom = defaultAtom(null);

export function useAtomValueOr<T>(atom: PrimitiveAtom<T> | null | undefined): T | null;
export function useAtomValueOr<T>(atom: PrimitiveAtom<T> | null | undefined, defaultValue: T): T;
export function useAtomValueOr<T>(
  atom: PrimitiveAtom<T | null | undefined> | null | undefined,
  defaultValue = null as null | T,
): T | null {
  const value = useAtomValue(atom ?? nullAtom);
  return value ?? defaultValue;
}
