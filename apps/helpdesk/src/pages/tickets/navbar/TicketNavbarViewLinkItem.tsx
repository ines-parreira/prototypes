import { useMemo } from 'react'

import { Link, matchPath, useLocation } from 'react-router-dom'

import type { IconName } from '@gorgias/axiom'
import { Box, Icon, Quantity } from '@gorgias/axiom'
import type { View } from '@gorgias/helpdesk-types'

import { Navigation } from 'components/Navigation/Navigation'
import ViewName from 'pages/common/components/ViewName/ViewName'
import { useSplitTicketView } from 'split-ticket-view-toggle'

type Props = {
    className?: string
    icon: IconName
    label?: string
    view: Pick<View, 'id' | 'name' | 'slug' | 'decoration'>
    viewCount?: number
}

export function TicketNavbarViewLinkItem({
    icon,
    view,
    viewCount,
    label,
}: Props) {
    const { isEnabled: splitTicketViewEnabled } = useSplitTicketView()
    const { pathname } = useLocation()
    const match = matchPath<{ viewId: string }>(pathname, {
        path: splitTicketViewEnabled
            ? `/app/views/:viewId`
            : `/app/tickets/:viewId?/:slug?/`,
    })

    const viewIdParam = match?.params.viewId
    const viewId = viewIdParam ? parseInt(viewIdParam, 10) : 0

    const isActiveView = view.id === viewId

    const linkTo = useMemo(
        () =>
            splitTicketViewEnabled
                ? `/app/views/${view.id}`
                : `/app/tickets/${view.id}/${encodeURIComponent(view.slug || '')}`,
        [splitTicketViewEnabled, view],
    )

    return (
        <Navigation.SectionItem
            as={Link}
            to={linkTo}
            id={`ticket-navbar-view-${view.id}`}
        >
            <Box
                alignItems="center"
                gap="xs"
                w="100%"
                justifyContent="space-between"
            >
                <Box alignItems="center" gap="xs">
                    <Icon name={icon} size="sm" />
                    <ViewName
                        viewName={label || view.name || ''}
                        emoji={view.decoration?.emoji}
                    />
                </Box>
                {!!viewCount && (
                    <Quantity
                        quantity={viewCount}
                        color={isActiveView ? 'purple' : undefined}
                    />
                )}
            </Box>
        </Navigation.SectionItem>
    )
}
