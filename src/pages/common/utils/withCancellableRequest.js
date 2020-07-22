//@flow
import React, {type ComponentType} from 'react'
import {connect} from 'react-redux'

import {useCancellableRequest} from '../../../hooks'

const withCancellableRequest = <Props>(
    requestName: string,
    request: Function
) => <P: Props>(WrappedComponent: ComponentType<Props>): ComponentType<P> => {
    if (requestName.length < 2) {
        throw new Error(
            'The argument requestName of withCancellableRequest expect a length greater than 1'
        )
    }

    return connect(null, {
        request,
    })(
        ({
            request: connectedRequest,
            ...props
        }: P & {request: typeof request}) => {
            const [
                cancellableRequest,
                cancel,
            ] = useCancellableRequest((cancelToken) => (...args) =>
                connectedRequest(...args, cancelToken)
            )
            const injectedProps = {
                [requestName]: cancellableRequest,
                [`cancel${requestName
                    .charAt(0)
                    .toUpperCase()}${requestName.slice(1)}`]: cancel,
            }
            return <WrappedComponent {...props} {...injectedProps} />
        }
    )
}

export default withCancellableRequest
