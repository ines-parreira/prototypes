import {EmailDNSRecord} from '@gorgias/api-queries'
import classnames from 'classnames'
import _isEmpty from 'lodash/isEmpty'

import React from 'react'

import useId from 'hooks/useId'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

import CopyButton from './CopyButton'

import css from './RecordItem.less'
import RecordStatus from './RecordStatus'

type Props = {
    record: EmailDNSRecord
    isPending?: boolean
    isRequested?: boolean
}

const RecordItem = ({record, isPending, isRequested}: Props) => {
    const id = useId()
    const hostID = 'record-host-' + id
    const valueID = 'record-value-' + id

    return (
        <TableBodyRow className={css.row}>
            <BodyCell>
                <RecordStatus
                    isVerified={record.verified}
                    isPending={isPending}
                    isRequested={isRequested}
                />
            </BodyCell>
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
                {_isEmpty(record.current_values)
                    ? 'None found'
                    : record.current_values}
            </BodyCell>
        </TableBodyRow>
    )
}

export default RecordItem
