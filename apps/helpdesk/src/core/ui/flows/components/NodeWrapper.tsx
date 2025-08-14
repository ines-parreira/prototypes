import React from 'react'

import { Handle, Position } from 'reactflow'

import css from './NodeWrapper.less'

type NodeWrapperProps = {
    children: React.ReactNode
}

export function NodeWrapper({ children }: NodeWrapperProps) {
    return (
        <div className={css.nodeWrapper}>
            <Handle
                type="target"
                position={Position.Top}
                className={css.sourceHandle}
            />
            {children}
            <Handle
                type="source"
                position={Position.Bottom}
                className={css.targetHandle}
            />
        </div>
    )
}
