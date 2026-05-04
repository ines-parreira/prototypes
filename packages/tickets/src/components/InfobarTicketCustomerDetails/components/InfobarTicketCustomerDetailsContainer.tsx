import { Box } from '@gorgias/axiom'

import css from './InfobarTicketCustomerDetailsContainer.less'

type InfobarTicketCustomerDetailsContainerProps = {
    children: React.ReactNode
}

export function InfobarTicketCustomerDetailsContainer({
    children,
}: InfobarTicketCustomerDetailsContainerProps) {
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
