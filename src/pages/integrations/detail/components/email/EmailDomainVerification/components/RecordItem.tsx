import React from 'react'
import _uniqueId from 'lodash/uniqueId'
import classnames from 'classnames'
import _isEmpty from 'lodash/isEmpty'

import BodyCell from '../../../../../../common/components/table/cells/BodyCell'
import {DomainDNSRecord} from '../../../../../../../models/integration/types'
import TableBodyRow from '../../../../../../common/components/table/TableBodyRow'

import css from '../EmailDomainVerification.less'

import RecordStatus from './RecordStatus'
import CopyButton from './CopyButton'

type Props = {
    record: DomainDNSRecord
}

const RecordItem = ({record}: Props) => {
    const hostID = _uniqueId('record-host-')
    const valueID = _uniqueId('record-value-')

    return (
        <TableBodyRow className={css.row}>
            <BodyCell>
                <RecordStatus isVerified={record.verified} />
            </BodyCell>
            <BodyCell>{record.record_type}</BodyCell>
            <BodyCell>
                <span id={hostID}>{record.host}</span>
                <CopyButton clipboardTarget={`#${hostID}`} />
            </BodyCell>
            <BodyCell className={classnames(css.cell, css['value-cell'])}>
                <span id={valueID}>{record.value}</span>
                <CopyButton clipboardTarget={`#${valueID}`} />
            </BodyCell>
            <BodyCell
                className={classnames(css.cell, css['current-values-cell'])}
                size="small"
            >
                {_isEmpty(record.current_values)
                    ? 'None found'
                    : record.current_values}
            </BodyCell>
        </TableBodyRow>
    )
}

export default RecordItem
