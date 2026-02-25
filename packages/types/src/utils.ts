export type Maybe<T> = T | undefined | null

export type UnionOmit<T, K extends string | number | symbol> = T extends unknown
    ? Omit<T, K>
    : never

export type ValueOf<T> = T[keyof T]

export type ArgumentsOf<F extends Function> = F extends (
    ...args: infer A
) => any
    ? A
    : never

export type RemoveIndex<T> = {
    [K in keyof T as string extends K
        ? never
        : number extends K
          ? never
          : K]: T[K]
}

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[]
        ? DeepPartial<U>[]
        : T[P] extends object | undefined
          ? DeepPartial<T[P]>
          : T[P]
}

export type AllKeys<T> = T extends unknown ? keyof T : never

export type UnionPick<T, K extends keyof T> = T extends unknown
    ? Pick<T, K>
    : never

export type PickOne<T, F extends keyof T> = Pick<T, F> & {
    [K in keyof Omit<T, F>]?: never
}

export type XOR<T, K = keyof T> = K extends keyof T ? PickOne<T, K> : never

export type Prettify<T> = {
    [K in keyof T]: T[K]
} & {}
