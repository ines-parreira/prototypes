import { useCallback, useState } from 'react'

import { isEqual } from 'lodash'

import { Box } from '@gorgias/axiom'

import { FlowItem } from './FlowItem'
import type { FlowsListProps, Workflow } from './types'

import css from './FlowsList.less'

export function FlowsList({
    items,
    channelType,
    configurationsMap,
    getEditFlowLink,
    onReorder,
    onRemove,
}: FlowsListProps) {
    const [dirtyEntrypoints, setDirtyEntrypoints] = useState<Workflow[]>([])

    const displayItems = dirtyEntrypoints.length > 0 ? dirtyEntrypoints : items

    const handleFlowItemMove = useCallback(
        (dragIndex: number, hoverIndex: number) => {
            const nextDirtyEntrypoints =
                dirtyEntrypoints.length > 0
                    ? [...dirtyEntrypoints]
                    : items.slice()
            const dirtyEntrypoint = nextDirtyEntrypoints[dragIndex]

            if (!dirtyEntrypoint) {
                return
            }

            nextDirtyEntrypoints.splice(dragIndex, 1)
            nextDirtyEntrypoints.splice(hoverIndex, 0, dirtyEntrypoint)

            setDirtyEntrypoints(nextDirtyEntrypoints)
        },
        [dirtyEntrypoints, items],
    )

    const handleFlowItemDrop = useCallback(() => {
        if (dirtyEntrypoints.length === 0) return
        if (!isEqual(dirtyEntrypoints, items)) {
            onReorder(dirtyEntrypoints)
            setDirtyEntrypoints([])
        }
    }, [dirtyEntrypoints, items, onReorder])

    const handleCancel = useCallback(() => {
        setDirtyEntrypoints([])
    }, [])

    if (items.length === 0) {
        return null
    }

    return (
        <Box flexDirection="column" className={css.flowsList}>
            {displayItems.map((workflow, index) => (
                <FlowItem
                    key={workflow.workflow_id}
                    index={index}
                    label={configurationsMap[workflow.workflow_id]?.name ?? ''}
                    channelType={channelType}
                    editUrl={getEditFlowLink(workflow.workflow_id)}
                    onMove={handleFlowItemMove}
                    onDrop={handleFlowItemDrop}
                    onCancel={handleCancel}
                    onDelete={() => onRemove(workflow.workflow_id)}
                />
            ))}
        </Box>
    )
}
