import { Box } from '@gorgias/axiom'

import css from './InfobarTicketCustomerHeaderContainer.less'

export interface InfobarTicketCustomerHeaderContainerProps {
    children: React.ReactNode
}

export function InfobarTicketCustomerHeaderContainer({
    children,
}: InfobarTicketCustomerHeaderContainerProps) {
    return (
        <Box
            justifyContent="space-between"
            alignItems="center"
            className={css.container}
        >
            {children}
        </Box>
    )
}
