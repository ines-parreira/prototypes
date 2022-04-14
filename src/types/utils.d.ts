declare type Maybe<T> = T | undefined | null

declare type ValueOf<T> = T[keyof T]

declare type ArgumentsOf<F extends Function> = F extends (
    ...args: infer A
) => any
    ? A
    : never

type RemoveIndex<T> = {
    [K in keyof T as string extends K
        ? never
        : number extends K
        ? never
        : K]: T[K]
}
