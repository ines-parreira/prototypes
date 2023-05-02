import React from 'react'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableHead from 'pages/common/components/table/TableHead'
import TableBody from 'pages/common/components/table/TableBody'
import {EmailProvider} from 'models/integration/constants'
import {DomainDNSRecord} from 'models/integration/types'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'

import css from '../EmailDomainVerification.less'
import RecordItem from './RecordItem'

type Props = {
    records: Array<DomainDNSRecord>
    provider?: string
}

const RecordsTable = ({records, provider}: Props) => {
    return (
        <TableWrapper className={css['records-table']}>
            <TableHead>
                <HeaderCellProperty
                    title="Status"
                    className={css.statusHeader}
                />
                <HeaderCellProperty
                    title="Type"
                    className={css.recordTypeHeader}
                />
                <HeaderCellProperty title="Host" />
                <HeaderCellProperty title="Value" />
                {provider !== EmailProvider.Sendgrid && (
                    <HeaderCellProperty title="Current Values" />
                )}
            </TableHead>
            <TableBody>
                {records.map((record: DomainDNSRecord, index: number) => (
                    <RecordItem
                        key={index}
                        record={record}
                        provider={provider}
                    />
                ))}
            </TableBody>
        </TableWrapper>
    )
}

export default RecordsTable
