declare type Maybe<T> = T | undefined | null

declare type ValueOf<T> = T[keyof T]

declare type ArgumentsOf<F extends Function> = F extends (
    ...args: infer A
) => any
    ? A
    : never

type KnownKeys<T> = {
    [K in keyof T]: string extends K ? never : number extends K ? never : K
} extends {[key in keyof T]: infer U}
    ? {} extends U
        ? never
        : U
    : never
