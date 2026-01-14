import { Box } from '@gorgias/axiom'

import css from './TicketLayout.less'

type TicketLayoutProps = {
    children: React.ReactNode
}

export function TicketLayout({ children }: TicketLayoutProps) {
    return (
        <Box flexDirection="column" width="100%" flexGrow={1}>
            {children}
        </Box>
    )
}

export function TicketLayoutContent({ children }: TicketLayoutProps) {
    return <div className={css.content}>{children}</div>
}
