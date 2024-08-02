import React from 'react'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {formatDatetime} from 'utils'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {DateAndTimeFormatting} from 'constants/datetime'

import {ActionTemplate} from '../types'
import {GetAppFromTemplate} from '../hooks/useGetAppFromTemplate'

import css from './ActionsPlatformTemplatesTableRow.less'

type Props = {
    template: Pick<ActionTemplate, 'apps' | 'name' | 'updated_datetime'>
    getAppFromTemplate: GetAppFromTemplate
}

const ActionsPlatformTemplatesTableRow = ({
    template,
    getAppFromTemplate,
}: Props) => {
    const app = getAppFromTemplate(template.apps[0])
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate
    )

    return (
        <TableBodyRow>
            <BodyCell>
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
