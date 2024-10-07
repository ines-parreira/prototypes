import React, {useState, useEffect} from 'react'
import {CustomField} from 'custom-fields/types'
import Row from 'pages/settings/customFields/components/Row'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableHead from 'pages/common/components/table/TableHead'
import TableBody from 'pages/common/components/table/TableBody'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'

import css from './List.less'

export type Props = {
    customFields: CustomField[]
    canReorder: boolean
    onReorder: (
        updatedPriorities: [Pick<CustomField, 'id' | 'priority'>[]]
    ) => void
}

export default function List({customFields, canReorder, onReorder}: Props) {
    const [draggedFields, setDraggedFields] = useState<CustomField[]>([])

    useEffect(() => {
        setDraggedFields(customFields)
    }, [customFields])

    if (!customFields.length) {
        return null
    }

    const handleMoveEntity = (dragIndex: number, hoverIndex: number) => {
        const newDraggedFields = [...draggedFields]

        const original = newDraggedFields[dragIndex]
        newDraggedFields.splice(dragIndex, 1)
        newDraggedFields.splice(hoverIndex, 0, original)

        setDraggedFields(newDraggedFields)
    }

    const handleDropEntity = () => {
        // Scenario, initial draggedFields:
        // field1 = {id: 1, priority: 99}
        // field2 = {id: 2, priority: 98}
        // field3 = {id: 3, priority: 97}

        // If we were to drag field3 to be the first we will have this in draggedFields:
        // field3 = {id: 3, priority: 97}
        // field1 = {id: 1, priority: 99}
        // field2 = {id: 2, priority: 98}

        // At this point we're swapping the priorities around to reflect the new order in the array so that it becomes:
        // field3 = {id: 3, priority: 99}
        // field1 = {id: 1, priority: 98}
        // field2 = {id: 2, priority: 97}

        const sortedPriorities = draggedFields
            .map((customField) => customField.priority)
            .sort((a, b) => +a - +b)

        const updatedPriorities = draggedFields.map((customField) => {
            return {
                id: customField.id,
                priority: sortedPriorities.pop() as number,
            }
        })

        onReorder([updatedPriorities])
    }

    return (
        <TableWrapper>
            <TableHead>
                {canReorder && <HeaderCell size="smallest" />}
                <HeaderCell className={css.headerCell}>FIELD</HeaderCell>
                <HeaderCell size="smallest"></HeaderCell>
                <HeaderCell size="smallest" className={css.headerCell}>
                    LAST UPDATED
                </HeaderCell>
                <HeaderCell size="smallest"></HeaderCell>
            </TableHead>
            <TableBody>
                {draggedFields.map((customField, index) => (
                    <Row
                        key={customField.id}
                        position={index}
                        customField={customField}
                        canReorder={canReorder}
                        onMoveEntity={handleMoveEntity}
                        onDropEntity={handleDropEntity}
                    />
                ))}
            </TableBody>
        </TableWrapper>
    )
}
