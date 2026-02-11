import { Box } from '@gorgias/axiom'

import css from './InfobarTicketDetailsContainer.less'

export function InfobarTicketDetailsContainer({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Box
            className={css.container}
            flexDirection="column"
            gap="xs"
            paddingTop="md"
            paddingBottom="sm"
        >
            {children}
        </Box>
    )
}
