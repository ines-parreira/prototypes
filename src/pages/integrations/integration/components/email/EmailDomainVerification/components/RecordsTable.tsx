import { EmailDNSRecord, EmailDomain } from '@gorgias/helpdesk-queries'

import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import { removeDomainFromDNSRecords } from '../../helpers'
import RecordItem from './RecordItem'
import RecordsTableSkeleton from './RecordsTableSkeleton'

import css from './RecordsTable.less'

type Props = {
    domainName: string
    isLoading?: boolean
    domain?: EmailDomain
}

const RecordsTable = ({ domainName, isLoading, domain }: Props) => {
    const records = removeDomainFromDNSRecords(
        domain?.data.sending_dns_records ?? [],
        domainName,
    )

    return (
        <TableWrapper className={css.recordsTable}>
            <TableHead>
                <HeaderCellProperty
                    title="Type"
                    className={css.recordTypeHeader}
                />
                <HeaderCellProperty title="Host" />
                <HeaderCellProperty title="Value" />
                <HeaderCellProperty title="Status" />
            </TableHead>
            <TableBody>
                {isLoading ? (
                    <RecordsTableSkeleton />
                ) : (
                    records.map((record: EmailDNSRecord, index: number) => (
                        <RecordItem key={index} record={record} />
                    ))
                )}
            </TableBody>
        </TableWrapper>
    )
}

export default RecordsTable
