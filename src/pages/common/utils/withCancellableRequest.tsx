import React, {ComponentType} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {CancelToken} from 'axios'

import useCancellableRequest from '../../../hooks/useCancellableRequest'

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

const withCancellableRequest = <
    RequestName extends string,
    CancelName extends string,
    Request extends (...args: any[]) => (...args: any[]) => Promise<unknown>
>(
    requestName: RequestName,
    request: Request
) => <P,>(
    WrappedComponent: ComponentType<P>
): ComponentType<
    Omit<
        P,
        keyof CancellableRequestInjectedProps<RequestName, CancelName, Request>
    >
> => {
    if (requestName.length < 2) {
        throw new Error(
            'The argument requestName of withCancellableRequest expect a length greater than 1'
        )
    }

    const connector = connect(null, {
        request,
    })

    return connector(((props: P & ConnectedProps<typeof connector>) => {
        const {request: connectedRequest, ...ownProps} = props
        const initialProps = ({...ownProps} as unknown) as P
        const [
            cancellableRequest,
            cancel,
        ] = useCancellableRequest((cancelToken) => async (...args) =>
            await connectedRequest(...args, cancelToken)
        )
        const injectedProps = {
            [requestName]: cancellableRequest,
            [`cancel${requestName.charAt(0).toUpperCase()}${requestName.slice(
                1
            )}` as CancelName]: cancel,
        }
        return <WrappedComponent {...initialProps} {...injectedProps} />
    }) as any)
}

export default withCancellableRequest
