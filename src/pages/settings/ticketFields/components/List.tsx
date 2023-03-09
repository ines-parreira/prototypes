import {Table} from 'reactstrap'
import React from 'react'
import classnames from 'classnames'
import {CustomField} from 'models/customField/types'
import Row from 'pages/settings/ticketFields/components/Row'
import ReactSortable from 'pages/common/components/dragging/ReactSortable'

export type Props = {
    ticketFields: CustomField[]
    canReorder: boolean
    onReorder: (
        updatedPriorities: Pick<CustomField, 'id' | 'priority'>[]
    ) => void
}

export default function List({ticketFields, canReorder, onReorder}: Props) {
    if (!ticketFields.length) {
        return null
    }

    const handleReordering = (newOrderIds: string[]) => {
        const ticketFieldNewOrderIds = newOrderIds.map((id) => parseInt(id))
        const sortedPriorities = ticketFields
            .filter((customField) =>
                ticketFieldNewOrderIds.includes(customField.id)
            )
            .map((customField) => customField.priority)
            .sort()

        const updatedPriorities = ticketFieldNewOrderIds.map(
            (ticketFieldId: number) => {
                return {
                    id: ticketFieldId,
                    priority: sortedPriorities.pop() as number,
                }
            }
        )

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
                <ReactSortable
                    tag="tbody"
                    options={{
                        sort: true,
                        draggable: '.draggable',
                        handle: '.drag-handle',
                        chosenClass: 'chosen',
                        ghostClass: 'ghost',
                        animation: 150,
                    }}
                    onChange={handleReordering}
                >
                    {ticketFields.map((ticketField) => (
                        <Row
                            key={ticketField.id}
                            ticketField={ticketField}
                            canReorder={canReorder}
                        />
                    ))}
                </ReactSortable>
            </Table>
        </>
    )
}
