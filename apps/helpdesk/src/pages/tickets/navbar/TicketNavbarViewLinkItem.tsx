import { forwardRef, useMemo } from 'react'

import { NavigationSectionItem } from '@repo/navigation'
import { useViewCount } from '@repo/views'
import { matchPath, useLocation } from 'react-router-dom'

import type { IconName } from '@gorgias/axiom'
import { Box, Icon, Quantity, Tooltip, TooltipContent } from '@gorgias/axiom'
import type { View, ViewDecoration } from '@gorgias/helpdesk-types'

import { useSplitTicketView } from 'split-ticket-view-toggle'

type Props = {
    canduId?: string | null
    icon?: IconName
    label?: string
    view: Pick<View, 'id' | 'name' | 'slug'> & {
        decoration?: Maybe<ViewDecoration>
        deactivated_datetime?: Maybe<string>
    }
    onClick?: () => void
}

export const TicketNavbarViewLinkItem = forwardRef<HTMLAnchorElement, Props>(
    function TicketNavbarViewLinkItem(
        { canduId, icon, view, label, onClick }: Props,
        ref,
    ) {
        const viewCount = useViewCount(view.id)
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
            <NavigationSectionItem
                ref={ref}
                canduId={canduId}
                onClick={onClick}
                id={`view-${view.id}`}
                to={linkTo}
                label={
                    <>
                        {typeof view.decoration?.emoji === 'string' && (
                            <Box display="inline" pr="xxxs">
                                {view.decoration.emoji}
                            </Box>
                        )}
                        {label ?? view.name}
                    </>
                }
                isActive={() => isActiveView}
                leadingSlot={icon}
                trailingSlot={
                    !!view.deactivated_datetime ? (
                        <Tooltip
                            trigger={
                                <Icon
                                    name="octagon-error"
                                    size="sm"
                                    color="red"
                                />
                            }
                        >
                            <TooltipContent
                                title={'This view is deactivated'}
                            />
                        </Tooltip>
                    ) : (
                        !!viewCount && (
                            <Quantity
                                quantity={viewCount}
                                color={isActiveView ? 'purple' : undefined}
                                compact
                                maxQuantity={5000}
                            />
                        )
                    )
                }
            />
        )
    },
)
