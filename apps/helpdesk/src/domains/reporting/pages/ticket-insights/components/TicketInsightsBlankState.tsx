import type { ReactNode } from 'react'

import classnames from 'classnames'

import { Button } from '@gorgias/axiom'

import graphsImage from 'domains/reporting/assets/img/graphs.png'
import css from 'domains/reporting/pages/ticket-insights/components/TicketInsightsBlankState.less'

export function TicketInsightsBlankStateImage() {
    return (
        <img
            src={graphsImage}
            alt="Nothing to report on"
            className={css.image}
        />
    )
}

export function TicketInsightsBlankStateTitle({
    children,
}: {
    children: ReactNode
}) {
    return <h3 className={css.title}>{children}</h3>
}

export function TicketInsightsBlankStateText({
    children,
}: {
    children: ReactNode
}) {
    return <p className={css.text}>{children}</p>
}

export function TicketInsightsBlankStateCallToAction({
    children,
    href,
}: {
    children: ReactNode
    href: string
}) {
    return (
        <Button as="a" target="_blank" href={href}>
            {children}
        </Button>
    )
}

export function TicketInsightsBlankState({
    children,
}: {
    children: ReactNode
}) {
    return <div className={classnames(css.wrapper)}>{children}</div>
}
