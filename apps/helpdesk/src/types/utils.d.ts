declare type Maybe<T> = T | undefined | null

declare type UnionOmit<
    T,
    K extends string | number | symbol,
> = T extends unknown ? Omit<T, K> : never

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

type AllKeys<T> = T extends unknown ? keyof T : never

type UnionPick<T, K extends keyof T> = T extends unknown ? Pick<T, K> : never

type PickOne<T, F extends keyof T> = Pick<T, F> & {
    [K in keyof Omit<T, F>]?: never
}

type XOR<T, K = keyof T> = K extends keyof T ? PickOne<T, K> : never

type ArrayItem<T extends any[]> = T extends (infer U)[] ? U : never
