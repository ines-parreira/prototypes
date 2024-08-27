import React from 'react'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {formatDatetime} from 'utils'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {DateAndTimeFormatting} from 'constants/datetime'
import {DraftBadge} from 'pages/automate/workflows/components/DraftBadge'

import {ActionTemplate, App} from '../types'

import css from './ActionsPlatformTemplatesTableRow.less'

type Props = {
    template: Pick<
        ActionTemplate,
        'apps' | 'is_draft' | 'name' | 'updated_datetime'
    >
    app?: App
    onClick: () => void
}

const ActionsPlatformTemplatesTableRow = ({template, app, onClick}: Props) => {
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate
    )

    return (
        <TableBodyRow onClick={onClick}>
            <BodyCell innerClassName={css.nameCell}>
                {template.is_draft && <DraftBadge />}
                <img
                    src={app?.icon}
                    alt={app?.name}
                    className={css.icon}
                    title={app?.name}
                />
                <span className={css.name}>{template.name}</span>
            </BodyCell>
            <BodyCell size="smallest" justifyContent="right">
                {formatDatetime(template.updated_datetime, datetimeFormat)}
            </BodyCell>
        </TableBodyRow>
    )
}

export default ActionsPlatformTemplatesTableRow
