import _truncate from 'lodash/truncate'
import React from 'react'

import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import {NOT_AVAILABLE_PLACEHOLDER} from 'pages/stats/common/utils'

const MAX_COMMENT_LENGTH = 250

export type Props = Omit<BodyCellProps, 'children' | 'ref'> & {
    comment: string | null
}

export default function CommentBodyCell({
    comment,
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
            {_truncate(comment || NOT_AVAILABLE_PLACEHOLDER, {
                length: MAX_COMMENT_LENGTH,
                omission: '...',
            })}
        </BodyCell>
    )
}
