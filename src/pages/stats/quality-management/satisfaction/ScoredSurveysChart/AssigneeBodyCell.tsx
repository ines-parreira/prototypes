import React from 'react'

import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import {NOT_AVAILABLE_PLACEHOLDER} from 'pages/stats/common/utils'

export type Props = Omit<BodyCellProps, 'children' | 'ref'> & {
    assignee: string | null
}

export default function AssigneeBodyCell({
    assignee,
    width,
    height,
    innerClassName,
    justifyContent,
}: Props) {
    return (
        <BodyCell
            width={width}
            height={height}
            innerClassName={innerClassName}
            justifyContent={justifyContent}
        >
            {assignee || NOT_AVAILABLE_PLACEHOLDER}
        </BodyCell>
    )
}
