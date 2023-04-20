import {Table} from 'reactstrap'
import React, {useState, useEffect} from 'react'
import classnames from 'classnames'
import {CustomField} from 'models/customField/types'
import Row from 'pages/settings/ticketFields/components/Row'

export type Props = {
    ticketFields: CustomField[]
    canReorder: boolean
    onReorder: (
        updatedPriorities: Pick<CustomField, 'id' | 'priority'>[]
    ) => void
}

export default function List({ticketFields, canReorder, onReorder}: Props) {
    const [draggedFields, setDraggedFields] = useState<CustomField[]>([])

    useEffect(() => {
        setDraggedFields(ticketFields)
    }, [ticketFields])

    if (!ticketFields.length) {
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

        const updatedPriorities = draggedFields.map((ticketField) => {
            return {
                id: ticketField.id,
                priority: sortedPriorities.pop() as number,
            }
        })

        onReorder(updatedPriorities)
    }

    return (
        <>
            <Table hover>
                <thead className="border-0">
                    <tr>
                        {canReorder && <th></th>}
                        <th>Field</th>
                        <th></th>
                        <th
                            className={classnames(
                                'p-0 align-middle smallest pr-4'
                            )}
                        >
                            last updated
                        </th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {draggedFields.map((ticketField, index) => (
                        <Row
                            key={ticketField.id}
                            position={index}
                            ticketField={ticketField}
                            canReorder={canReorder}
                            onMoveEntity={handleMoveEntity}
                            onDropEntity={handleDropEntity}
                        />
                    ))}
                </tbody>
            </Table>
        </>
    )
}
