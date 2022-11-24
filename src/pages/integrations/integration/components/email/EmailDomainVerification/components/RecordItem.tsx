import React from 'react'
import classnames from 'classnames'
import _isEmpty from 'lodash/isEmpty'

import useId from 'hooks/useId'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {DomainDNSRecord} from 'models/integration/types'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

import {EmailProvider} from 'models/integration/constants'

import css from '../EmailDomainVerification.less'
import RecordStatus from './RecordStatus'
import CopyButton from './CopyButton'

type Props = {
    record: DomainDNSRecord
    provider: string
}

const RecordItem = ({record, provider}: Props) => {
    const id = useId()
    const hostID = 'record-host-' + id
    const valueID = 'record-value-' + id

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
            {provider !== EmailProvider.Sendgrid && (
                <BodyCell
                    className={classnames(css.cell, css['current-values-cell'])}
                >
                    {_isEmpty(record.current_values)
                        ? 'None found'
                        : record.current_values}
                </BodyCell>
            )}
        </TableBodyRow>
    )
}

export default RecordItem
