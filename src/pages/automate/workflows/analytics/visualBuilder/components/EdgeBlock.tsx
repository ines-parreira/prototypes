import React from 'react'
import css from './EdgeBlock.less'

export type VisualBuilderEdgeProps = {
    incomingChoice?: {
        label: string
        eventId: string
        nodeId: string
    }
    incomingCondition?: {
        id: string
        label: string
        nodeId: string
        isFallback: boolean
    }
    httpRequestCondition?: {
        id: string
        label: string
        nodeId: string
        isFallback: boolean
    }
}

export default function EdgeBlock({
    incomingChoice,
    httpRequestCondition,
    incomingCondition,
}: VisualBuilderEdgeProps) {
    const label =
        incomingChoice?.label ||
        incomingCondition?.label ||
        httpRequestCondition?.label
    return (
        <div className={css.addNodeIconContainer}>
            {label && <div className={css.edgeLabel}>{label}</div>}
        </div>
    )
}
