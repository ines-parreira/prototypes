import { Handle, NodeProps, Position } from '@xyflow/react'

import css from './NodeWrapper.less'

type NodeWrapperProps = NodeProps & {
    children: React.ReactNode
}

export function NodeWrapper({ children }: NodeWrapperProps) {
    return (
        <div className={css.nodeWrapper}>
            <Handle
                type="target"
                position={Position.Top}
                className={css.handle}
            />
            {children}
            <Handle
                type="source"
                position={Position.Bottom}
                className={css.handle}
            />
        </div>
    )
}
