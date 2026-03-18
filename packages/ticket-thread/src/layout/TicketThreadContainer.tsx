import { forwardRef } from 'react'

import type { BoxProps } from '@gorgias/axiom'
import { Box } from '@gorgias/axiom'

import { ExpandedMessagesProvider } from '../contexts/ExpandedMessages'

import css from './TicketThreadContainer.less'

type TicketThreadContainerProps = BoxProps & {
    children?: React.ReactNode
}

export const TicketThreadContainer = forwardRef<
    HTMLDivElement,
    TicketThreadContainerProps
>(function TicketThreadContainer({ children, ...props }, ref) {
    return (
        <ExpandedMessagesProvider>
            <Box className={css.ticketThreadContainer} ref={ref} {...props}>
                {children}
            </Box>
        </ExpandedMessagesProvider>
    )
})
