import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getSmoothStepPath,
} from '@xyflow/react'

import { AddStepButton } from './AddStepButton'

type Props = EdgeProps & {
    children?: React.ReactNode
    isDisabled?: boolean
}

const HANDLE_OFFSET = 3
const CHILDREN_OFFSET = 15

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
    isDisabled,
}: Props) {
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY: sourceY - HANDLE_OFFSET,
        sourcePosition,
        targetX,
        targetY: targetY + HANDLE_OFFSET,
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
                        transform: `translate(-50%, -50%) translate(${sourceX}px,${sourceY + CHILDREN_OFFSET}px)`,
                    }}
                >
                    {children && (
                        <AddStepButton isDisabled={isDisabled}>
                            {children}
                        </AddStepButton>
                    )}
                </div>
            </EdgeLabelRenderer>
        </>
    )
}
