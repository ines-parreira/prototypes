import { Box } from '@gorgias/axiom'

import css from './InfobarTicketCustomerHeaderContainer.less'

export interface InfobarTicketCustomerHeaderContainerProps {
    children: React.ReactNode
    onClick?: () => void
}

export function InfobarTicketCustomerHeaderContainer({
    children,
    onClick,
}: InfobarTicketCustomerHeaderContainerProps) {
    return (
        <Box
            justifyContent="space-between"
            alignItems="center"
            className={
                onClick
                    ? `${css.container} ${css.expandable} ${css.clickable}`
                    : css.container
            }
            onClick={onClick}
        >
            {children}
        </Box>
    )
}
