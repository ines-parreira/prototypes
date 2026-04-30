import css from './InfobarTicketDetailsHeaderContainer.less'

type InfobarTicketDetailsHeaderContainerProps = {
    children: React.ReactNode
}

export function InfobarTicketDetailsHeaderContainer({
    children,
}: InfobarTicketDetailsHeaderContainerProps) {
    return <header className={css.header}>{children}</header>
}
