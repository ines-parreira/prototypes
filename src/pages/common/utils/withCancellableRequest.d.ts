import {ComponentType} from 'react'
import {CancelToken} from 'axios'

type InjectedRequest<T> = T extends (
    a: infer A,
    b: infer B,
    c: infer C,
    d: infer D
) => (...args: any) => infer R
    ? D extends CancelToken
        ? (a: A, b: B, c: C) => R
        : C extends CancelToken
        ? (a: A, b: B) => R
        : B extends CancelToken
        ? (a: A) => R
        : never
    : never

export type CancellableRequestInjectedProps<
    RequestName extends string,
    CancelName extends string,
    Request
> = {
    [requestName in RequestName]: InjectedRequest<Request>
} &
    {[cancelName in CancelName]: () => void}

declare function withCancellableRequest<
    RequestName extends string,
    CancelName extends string,
    Request
>(
    name: string,
    request: Request
): <P>(
    WrappedComponent: ComponentType<P>
) => ComponentType<
    P & CancellableRequestInjectedProps<RequestName, CancelName, Request>
>

export default withCancellableRequest
