import {Table} from 'reactstrap'
import React from 'react'
import classnames from 'classnames'
import {CustomField} from 'models/customField/types'
import TicketFieldRow from 'pages/settings/ticketFields/components/Row'

export type Props = {
    ticketFields: CustomField[]
}

export default function List({ticketFields}: Props) {
    if (!ticketFields.length) {
        return null
    }

    return (
        <>
            <Table hover>
                <thead className="border-0">
                    <tr>
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
                    {ticketFields.map((ticketField) => (
                        <TicketFieldRow
                            key={ticketField.id}
                            ticketField={ticketField}
                        />
                    ))}
                </tbody>
            </Table>
        </>
    )
}
