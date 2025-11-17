import type { EdgeProps } from '@xyflow/react'
import { BaseEdge, getSmoothStepPath } from '@xyflow/react'

export default function CustomEdge(props: EdgeProps) {
    const { sourceX, sourceY, targetX, targetY } = props
    const [centerX, centerY] = getEdgeCenter({
        sourceX,
        sourceY,
        targetX,
        targetY,
    })
    const [path, labelX, labelY] = getSmoothStepPath({
        ...props,
        centerX,
        centerY: centerY - 10,
        offset: 0,
    })
    return <BaseEdge path={path} labelX={labelX} labelY={labelY} />
}

function getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
}: {
    sourceX: number
    sourceY: number
    targetX: number
    targetY: number
}): [number, number] {
    const xOffset = Math.abs(targetX - sourceX) / 2
    const centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset

    const yOffset = Math.abs(targetY - sourceY) / 2
    const centerY = targetY < sourceY ? targetY + yOffset : targetY - yOffset

    return [centerX, centerY]
}
