import type { ComponentProps, MouseEvent, ReactNode } from 'react'

import { Link } from 'react-router-dom'

import { DataTableBaseCell } from '@gorgias/axiom'

import css from './TicketTableCellLink.module.less'

export type TicketTableCellLinkProps = Omit<
    ComponentProps<typeof DataTableBaseCell>,
    'children' | 'p'
> & {
    children: ReactNode
    to: string
    onNavigateToTicket?: () => void
}

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>) {
    return (
        event.button === 0 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey
    )
}

export function TicketTableCellLink({
    children,
    className,
    to,
    onNavigateToTicket,
    alignItems = 'stretch',
    ...cellProps
}: TicketTableCellLinkProps) {
    const resolvedClassName = className ? `${css.cell} ${className}` : css.cell

    return (
        <DataTableBaseCell
            {...cellProps}
            p={0}
            className={resolvedClassName}
            alignItems={alignItems}
        >
            <Link
                to={to}
                className={css.link}
                onClick={(event) => {
                    if (event.defaultPrevented) {
                        return
                    }

                    if (!isPlainLeftClick(event)) {
                        // Don't run side effects for special clicks
                        return
                    }

                    onNavigateToTicket?.()
                }}
            >
                {children}
            </Link>
        </DataTableBaseCell>
    )
}
