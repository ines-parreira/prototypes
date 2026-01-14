import css from './TicketHeaderLayout.less'

type TicketHeaderLayoutProps = {
    children: React.ReactNode
}

export function TicketHeaderContainer({ children }: TicketHeaderLayoutProps) {
    return <div className={css.container}>{children}</div>
}

export function TicketHeaderLeft({ children }: TicketHeaderLayoutProps) {
    return <div className={css.left}>{children}</div>
}

export function TicketHeaderRight({ children }: TicketHeaderLayoutProps) {
    return <div className={css.right}>{children}</div>
}
