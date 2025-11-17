import { useId } from '@repo/hooks'
import classnames from 'classnames'

import type { EmailDNSRecord } from '@gorgias/helpdesk-queries'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

import CopyButton from './CopyButton'
import RecordDiffStatus from './RecordDiffStatus'

import css from './RecordItem.less'

type Props = {
    record: EmailDNSRecord
}

const RecordItem = ({ record }: Props) => {
    const id = useId()
    const hostID = 'record-host-' + id
    const valueID = 'record-value-' + id

    return (
        <TableBodyRow className={css.row}>
            <BodyCell className="text-uppercase">{record.record_type}</BodyCell>
            <BodyCell innerClassName={css.hostCellInner}>
                <span id={hostID}>
                    <strong>{record.host}</strong>
                </span>
                <CopyButton clipboardTarget={`#${hostID}`} fillStyle="ghost" />
            </BodyCell>
            <BodyCell
                className={classnames(css.cell, css.valueCell)}
                innerClassName={css.valueCellInner}
            >
                <div id={valueID} className={css.valueText}>
                    {record.value}
                </div>
                <CopyButton clipboardTarget={`#${valueID}`} />
            </BodyCell>
            <BodyCell className={classnames(css.cell, css.currentValuesCell)}>
                <RecordDiffStatus record={record} />
            </BodyCell>
        </TableBodyRow>
    )
}

export default RecordItem
