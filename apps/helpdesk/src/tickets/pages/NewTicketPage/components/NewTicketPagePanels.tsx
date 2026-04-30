import { useMemo } from 'react'
import type { ReactNode } from 'react'

import { Panel } from '@repo/layout'
import { useTicketInfobarNavigation } from '@repo/navigation'

const ticketDetailPanelConfig = {
    defaultSize: Infinity,
    minSize: 300,
    maxSize: Infinity,
}

export function NewTicketPageTicketDetailPanel({
    children,
}: {
    children: ReactNode
}) {
    return (
        <Panel name="ticket-detail" config={ticketDetailPanelConfig}>
            {children}
        </Panel>
    )
}

const infobarNavigationPanelConfig = {
    defaultSize: 49,
    minSize: 49,
    maxSize: 49,
}

export function NewTicketPageInfobarNavigationPanel({
    children,
}: {
    children: ReactNode
}) {
    return (
        <Panel name="infobar-navigation" config={infobarNavigationPanelConfig}>
            {children}
        </Panel>
    )
}

const expandedInfobarPanelConfig = {
    defaultSize: 340,
    minSize: 340,
    maxSize: 0.33,
}

const collapsedInfobarPanelConfig = {
    defaultSize: 0,
    minSize: 0,
    maxSize: 0,
}

export function NewTicketPageInfobarPanel({
    children,
}: {
    children: ReactNode
}) {
    const { isExpanded } = useTicketInfobarNavigation()
    const name = `infobar-${isExpanded ? 'expanded' : 'collapsed'}`
    const config = useMemo(
        () =>
            isExpanded
                ? expandedInfobarPanelConfig
                : collapsedInfobarPanelConfig,
        [isExpanded],
    )

    return (
        /**
         * Using the key prop is required to force the panel to always re-render correctly
         */
        <Panel key={name} name={name} config={config}>
            {children}
        </Panel>
    )
}
