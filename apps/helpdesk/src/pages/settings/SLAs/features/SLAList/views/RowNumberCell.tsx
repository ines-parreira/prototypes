import type { PropsWithRef } from 'react'
import React from 'react'

import { Text } from '@gorgias/axiom'

import type { Props as BodyCellProps } from 'pages/common/components/table/cells/BodyCell'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

export default function RowNumberCell({
    rowIndex,
    bodyCellProps,
}: {
    rowIndex: number
    bodyCellProps?: PropsWithRef<BodyCellProps>
}) {
    return (
        <BodyCell {...bodyCellProps}>
            <Text color="var(--content-neutral-tertiary)">{rowIndex + 1}</Text>
        </BodyCell>
    )
}
