import React, {ComponentType} from 'react'

import useAppNode from './useAppNode'
import {AppNodeContextType} from './AppNodeContext'

export type WithAppNodeProps = {
    appNode: AppNodeContextType
}

function withAppNode<T>(
    WrappedComponent: ComponentType<T & WithAppNodeProps>
): ComponentType<T> {
    const displayName =
        WrappedComponent.displayName || WrappedComponent.name || 'Component'

    const ComponentWithAppNode = (props: T) => {
        const appNode = useAppNode()

        return <WrappedComponent {...props} appNode={appNode} />
    }
    ComponentWithAppNode.displayName = `withAppNode(${displayName})`

    return ComponentWithAppNode
}

export default withAppNode
