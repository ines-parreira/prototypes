import React, {PropsWithRef} from 'react'

import {UISLAPolicy} from 'pages/settings/SLAs/features/SLAList/types'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {DateAndTimeFormatting} from 'constants/datetime'
import {formatDatetime} from 'utils'

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
        DateAndTimeFormatting.CompactDate
    )

    const {updatedDatetime, uuid} = policy
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
