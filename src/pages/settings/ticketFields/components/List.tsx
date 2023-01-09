import {Table} from 'reactstrap'
import React from 'react'
import classnames from 'classnames'
import {CustomField} from 'models/customField/types'
import Row from 'pages/settings/ticketFields/components/Row'

export type Props = {
    ticketFields: CustomField[]
    onFieldChange: () => void
}

export default function List({ticketFields, onFieldChange}: Props) {
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
                        <Row
                            key={ticketField.id}
                            ticketField={ticketField}
                            onFieldChange={onFieldChange}
                        />
                    ))}
                </tbody>
            </Table>
        </>
    )
}
