import React from 'react'

import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import {NOT_AVAILABLE_PLACEHOLDER} from 'pages/stats/common/utils'
import {formatDatetime} from 'utils'

export type Props = Omit<BodyCellProps, 'children' | 'ref'> & {
    surveyScoredDate: string | null
}

export default function ScoredDateBodyCell({
    surveyScoredDate,
    width,
    height,
    justifyContent,
    innerClassName,
}: Props) {
    const date = surveyScoredDate
        ? formatDatetime(surveyScoredDate, 'M/DD/YYYY')
        : NOT_AVAILABLE_PLACEHOLDER

    return (
        <BodyCell
            width={width}
            height={height}
            innerClassName={innerClassName}
            justifyContent={justifyContent}
        >
            {date}
        </BodyCell>
    )
}
