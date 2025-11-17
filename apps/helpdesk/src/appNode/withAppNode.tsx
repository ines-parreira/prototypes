import type { ComponentType } from 'react'
import React from 'react'

import type { AppNodeContextType } from './AppNodeContext'
import useAppNode from './useAppNode'

export type WithAppNodeProps = {
    appNode: AppNodeContextType
}

function withAppNode<T>(
    WrappedComponent: ComponentType<T & WithAppNodeProps>,
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
