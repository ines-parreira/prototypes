import css from './InfobarTicketDetailsHeaderContainer.less'

type InfobarTicketDetailsHeaderContainerProps = {
    children: React.ReactNode
    onClick?: () => void
}

export function InfobarTicketDetailsHeaderContainer({
    children,
    onClick,
}: InfobarTicketDetailsHeaderContainerProps) {
    return (
        <header
            className={
                onClick
                    ? `${css.header} ${css.expandable} ${css.clickable}`
                    : css.header
            }
            onClick={onClick}
        >
            {children}
        </header>
    )
}
