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

type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[]
        ? DeepPartial<U>[]
        : T[P] extends object | undefined
        ? DeepPartial<T[P]>
        : T[P]
}

type Awaited<T> = T extends null | undefined
    ? T // special case for `null | undefined` when not in `--strictNullChecks` mode
    : T extends object & {then(onfulfilled: infer F, ...args: infer _): any} // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
    ? F extends (value: infer V, ...args: infer _) => any // if the argument to `then` is callable, extracts the first argument
        ? Awaited<V> // recursively unwrap the value
        : never // the argument to `then` was not callable
    : T // non-object or non-thenable

// https://juhanajauhiainen.com/posts/how-to-type-an-object-with-exclusive-or-properties-in-typescript
type AllKeys<T> = T extends unknown ? keyof T : never
type Id<T> = T extends infer U ? {[K in keyof U]: U[K]} : never
type _ExclusifyUnion<T, K extends PropertyKey> = T extends unknown
    ? Id<T & Partial<Record<Exclude<K, keyof T>, never>>>
    : never
type ExclusifyUnion<T> = _ExclusifyUnion<T, AllKeys<T>>
