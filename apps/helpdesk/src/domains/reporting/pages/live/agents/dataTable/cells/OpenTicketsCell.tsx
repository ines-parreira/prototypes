import { useMemo } from 'react'
import type { ComponentProps } from 'react'

import { logEvent, SegmentEvent, StatViewLinkClickedStat } from '@repo/logging'
import { ticketMessageSourceToIconName } from '@repo/tickets'
import { useHistory } from 'react-router-dom'

import {
    Button,
    DataTableOverflowListCell,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { CellContext, IconName } from '@gorgias/axiom'

import { buildViewLinkTo } from 'domains/reporting/pages/common/ViewLink'
import { useOpenTicketsViewLinks } from 'domains/reporting/pages/live/agents/dataTable/hooks/useOpenTicketsViewLinks'
import type { LiveAgentRow } from 'domains/reporting/pages/live/agents/dataTable/types'
import { useChannels } from 'services/channels'
import type { ViewFilter } from 'state/views/types'

type OpenTicketsBadge = {
    label: string
    icon?: IconName
    quantity: number
    variant: ComponentProps<typeof Button>['variant']
    viewName: string
    filters: ViewFilter[]
    analyticsStat: StatViewLinkClickedStat
}

type Props = {
    cell: CellContext<LiveAgentRow, unknown>
    openTickets: number
    channelsBreakdown: Partial<Record<string, number>>
}

export function OpenTicketsCell({
    cell,
    openTickets,
    channelsBreakdown,
}: Props) {
    const { userId: agentId, userName: agentName } = cell.row.original
    const history = useHistory()

    const channels = useChannels()
    const channelNameBySlug = useMemo(() => {
        const map = new Map<string, string>()
        channels.forEach((channel) => map.set(channel.slug, channel.name))
        return map
    }, [channels])

    const { openTicketsFilters, getChannelFilters } =
        useOpenTicketsViewLinks(agentId)

    // One badge per channel (not grouped), even when several channels resolve to
    // the same icon (e.g. Aircall + Twilio both use the phone icon) — the
    // tooltip disambiguates them by channel name. Each badge links to the
    // matching open-tickets view.
    const channelBadges: OpenTicketsBadge[] = Object.entries(channelsBreakdown)
        .filter((entry): entry is [string, number] => Boolean(entry[1]))
        .map(([slug, quantity]): OpenTicketsBadge => {
            const name = channelNameBySlug.get(slug) ?? slug
            return {
                label: name,
                icon: ticketMessageSourceToIconName(slug),
                quantity,
                variant: 'tertiary',
                viewName: `Open tickets assigned to: ${agentName}, channel: ${name}`,
                filters: getChannelFilters(slug),
                analyticsStat:
                    StatViewLinkClickedStat.TicketsOpenPerAgentPerChannelLive,
            }
        })

    // The total (no icon, secondary) is first so it stays visible the longest as
    // the overflow list collapses the per-channel badges into a "+N" indicator.
    const badges: OpenTicketsBadge[] = [
        {
            label: 'Total open tickets',
            quantity: openTickets,
            variant: 'secondary',
            viewName: `Open tickets assigned to: ${agentName}`,
            filters: openTicketsFilters,
            analyticsStat: StatViewLinkClickedStat.TicketsOpenPerAgentLive,
        },
        ...channelBadges,
    ]

    return (
        <DataTableOverflowListCell {...cell} items={badges} gap="xxs">
            {(badge) => (
                <Tooltip
                    trigger={
                        <Button
                            variant={badge.variant}
                            size="sm"
                            leadingSlot={badge.icon}
                            onClick={() => {
                                logEvent(SegmentEvent.StatViewLinkClicked, {
                                    stat: badge.analyticsStat,
                                })
                                history.push(
                                    buildViewLinkTo(
                                        badge.viewName,
                                        badge.filters,
                                    ),
                                )
                            }}
                        >
                            {String(badge.quantity)}
                        </Button>
                    }
                >
                    <TooltipContent title={badge.label} />
                </Tooltip>
            )}
        </DataTableOverflowListCell>
    )
}
