import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getSmoothStepPath,
} from '@xyflow/react'

import { AddStepButton } from './AddStepButton'

type Props = EdgeProps & {
    children?: React.ReactNode
}

export function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    children,
    style,
}: Props) {
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        centerY: targetY - 30,
    })

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={style}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        pointerEvents: 'all',
                        transformOrigin: 'center',
                        transform: `translate(-50%, -50%) translate(${sourceX}px,${sourceY + 30}px)`,
                    }}
                >
                    {children && <AddStepButton>{children}</AddStepButton>}
                </div>
            </EdgeLabelRenderer>
        </>
    )
}
