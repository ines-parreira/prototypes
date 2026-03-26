import type { ReactNode } from 'react'

import { Box, Size } from '@gorgias/axiom'

import css from 'domains/reporting/pages/common/filters/MultiSelectFilterTrigger.less'

export const MultiSelectFilterTrigger = ({
    children,
}: {
    children: ReactNode
}) => (
    <Box
        justifyContent="center"
        flexWrap="nowrap"
        gap={Size.Xxxs}
        className={css.compactTrigger}
        height={24}
        alignItems="center"
    >
        {children}
    </Box>
)
