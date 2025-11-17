import React, { useMemo, useState } from 'react'

import _isEqual from 'lodash/isEqual'
import _uniqueId from 'lodash/uniqueId'

import type { SelfServiceReportIssueCase } from 'models/selfServiceConfiguration/types'

import ReportOrderIssueScenarioItem from './ReportOrderIssueScenarioItem'

type Props = {
    items: SelfServiceReportIssueCase[]
    onHasHoveredItemChange: (hasHoveredItem: boolean) => void
    onReorder: (items: SelfServiceReportIssueCase[]) => void
}

const ReportOrderIssueScenarioList = ({
    items,
    onHasHoveredItemChange,
    onReorder,
}: Props) => {
    const itemsWithId = useMemo(
        () => items.map((item) => ({ ...item, id: _uniqueId() })),
        [items],
    )

    const [dirtyItemsWithId, setDirtyItemsWithId] = useState(itemsWithId)

    const handleMove = (dragIndex: number, hoverIndex: number) => {
        const nextDirtyItemsWithId = [...dirtyItemsWithId]
        const dirtyItemWithId = nextDirtyItemsWithId[dragIndex]

        if (!dirtyItemWithId) {
            return
        }

        nextDirtyItemsWithId.splice(dragIndex, 1)
        nextDirtyItemsWithId.splice(hoverIndex, 0, dirtyItemWithId)

        setDirtyItemsWithId(nextDirtyItemsWithId)
    }
    const handleDrop = () => {
        if (!_isEqual(dirtyItemsWithId, itemsWithId)) {
            onReorder(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                dirtyItemsWithId.map(({ id, ...dirtyItem }) => dirtyItem),
            )
        }
    }
    const handleCancel = () => {
        setDirtyItemsWithId(itemsWithId)
    }
    const handleMouseEnter = () => {
        onHasHoveredItemChange(true)
    }
    const handleMouseLeave = () => {
        onHasHoveredItemChange(false)
    }

    return (
        <table>
            <tbody>
                {dirtyItemsWithId.map(({ id, ...item }, index) => (
                    <ReportOrderIssueScenarioItem
                        key={id}
                        id={id}
                        position={index}
                        onMove={handleMove}
                        onDrop={handleDrop}
                        onCancel={handleCancel}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        isDraggable={index !== dirtyItemsWithId.length - 1}
                        item={item}
                    />
                ))}
            </tbody>
        </table>
    )
}

export default ReportOrderIssueScenarioList
