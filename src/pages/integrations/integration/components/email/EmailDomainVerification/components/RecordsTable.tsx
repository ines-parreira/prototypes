import React, {useEffect, useState} from 'react'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableHead from 'pages/common/components/table/TableHead'
import TableBody from 'pages/common/components/table/TableBody'
import {EmailProvider} from 'models/integration/constants'
import {DomainDNSRecord} from 'models/integration/types'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import {
    populateCurrentValuesForDNSRecords,
    removeDomainFromDNSRecords,
} from '../../helpers'

import css from '../EmailDomainVerification.less'
import RecordItem from './RecordItem'

type Props = {
    records: Array<DomainDNSRecord>
    provider?: string
    domain?: string
}

const RecordsTable = ({records: rawRecords, provider, domain}: Props) => {
    const [records, setRecords] = useState(rawRecords)
    useEffect(() => {
        async function transformRecords() {
            if (provider === EmailProvider.Mailgun) {
                setRecords(removeDomainFromDNSRecords(rawRecords, domain))
                return
            }

            try {
                const records = await populateCurrentValuesForDNSRecords(
                    rawRecords
                )
                if (records) {
                    setRecords(removeDomainFromDNSRecords(records, domain))
                }
            } catch (e) {
                setRecords(removeDomainFromDNSRecords(rawRecords, domain))
            }
        }

        void transformRecords()
    }, [rawRecords, provider, domain])

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
                <HeaderCellProperty title="Current Values" />
            </TableHead>
            <TableBody>
                {records.map((record: DomainDNSRecord, index: number) => (
                    <RecordItem key={index} record={record} />
                ))}
            </TableBody>
        </TableWrapper>
    )
}

export default RecordsTable
