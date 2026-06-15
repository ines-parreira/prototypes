import { Box } from '@gorgias/axiom'

import css from './Layout.less'

export type MessageHeaderContainerProps = {
    children: React.ReactNode
}

export function MessageHeaderContainer({
    children,
}: MessageHeaderContainerProps) {
    return (
        <Box
            justifyContent="space-between"
            alignItems="center"
            flex={1}
            gap="xs"
            className={css.header}
        >
            {children}
        </Box>
    )
}
