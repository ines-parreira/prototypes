import React from 'react'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableHead from 'pages/common/components/table/TableHead'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableBody from 'pages/common/components/table/TableBody'
import {EmailProvider} from 'models/integration/constants'
import {DomainDNSRecord} from 'models/integration/types'

import css from '../EmailDomainVerification.less'
import RecordItem from './RecordItem'

type Props = {
    records: Array<DomainDNSRecord>
    provider: string
}

const RecordsTable = ({records, provider}: Props) => {
    return (
        <TableWrapper className={css['records-table']}>
            <TableHead>
                <HeaderCell>Status</HeaderCell>
                <HeaderCell>Record Type</HeaderCell>
                <HeaderCell>Host</HeaderCell>
                <HeaderCell>Value</HeaderCell>
                {provider !== EmailProvider.Sendgrid && (
                    <HeaderCell>Current Values</HeaderCell>
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
