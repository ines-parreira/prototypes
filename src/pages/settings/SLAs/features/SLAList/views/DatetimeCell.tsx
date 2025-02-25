import React, { PropsWithRef } from 'react'

import { DateAndTimeFormatting } from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import { UISLAPolicy } from 'pages/settings/SLAs/features/SLAList/types'
import { formatDatetime } from 'utils'

import CellLinkWrapper from './CellLinkWrapper'

import css from './DatetimeCell.less'

export default function DatetimeCell({
    policy,
    bodyCellProps,
}: {
    policy: UISLAPolicy
    bodyCellProps?: PropsWithRef<BodyCellProps>
}) {
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate,
    )

    const { updatedDatetime, uuid } = policy
    return (
        <BodyCell {...bodyCellProps}>
            <CellLinkWrapper to={`/app/settings/sla/${uuid}`}>
                {!!updatedDatetime && (
                    <span className={css.datetime}>
                        {formatDatetime(updatedDatetime, datetimeFormat)}
                    </span>
                )}
            </CellLinkWrapper>
        </BodyCell>
    )
}
