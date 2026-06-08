import { useEffect, useMemo, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useStore } from 'zustand'

import {
    Box,
    Button,
    Card,
    createColumnHelper,
    DataTable,
    DataTableBaseCell,
    DataTableTextCell,
    Dot,
    Heading,
    Icon,
    Panel,
    PanelHeader,
    Quantity,
    SidePanel,
    Tag,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { useAllViews } from '../hooks/useAllViews'
import { useSchedulerConfig } from '../hooks/useSchedulerConfig'
import { isViewDeactivated } from '../predicates/isViewDeactivated'
import type { RefreshConfig } from '../scheduler/refreshConfig'
import { getTtlSecondsForView } from '../scheduler/refreshConfig'
import type { ViewEvent } from '../store/viewEventLog'
import { viewEventLogStore } from '../store/viewEventLog'
import { viewsCountStore } from '../store/viewsCountStore'
import { getActiveViewIdFromUrl } from '../utils/activeView'

type ViewCountDebugPanelProps = {
    isOpen?: boolean
    onOpenChange?: (isOpen: boolean) => void
}

type RecentRow = {
    viewId: number
    name: string
    count: number
    lastFetchedAt: string | null
    viewedAt: string
    isActiveView: boolean
}

export function ViewCountDebugPanel({
    isOpen = false,
    onOpenChange,
}: ViewCountDebugPanelProps) {
    const config = useSchedulerConfig()
    const recent = useStore(viewsCountStore, (s) => s.recent)
    const counts = useStore(viewsCountStore, (s) => s.counts)
    const allViews = useAllViews()
    const events = useStore(viewEventLogStore, (s) => s.events)

    useNow()
    const activeViewId = getActiveViewIdFromUrl()

    const viewName = useMemo(() => {
        const m = new Map<number, string>()
        for (const v of allViews) m.set(v.id, v.name ?? '')
        return m
    }, [allViews])

    const recentRows: RecentRow[] = useMemo(() => {
        return Object.entries(recent)
            .sort(
                (a, b) => Date.parse(b[1].viewedAt) - Date.parse(a[1].viewedAt),
            )
            .slice(0, config.maxRecentViews)
            .map(([id, entry]) => {
                const viewId = Number(id)
                return {
                    viewId,
                    name: viewName.get(viewId) ?? '',
                    count: counts[viewId]?.count ?? 0,
                    lastFetchedAt: counts[viewId]?.lastFetchedAt ?? null,
                    viewedAt: entry.viewedAt,
                    isActiveView: viewId === activeViewId,
                }
            })
    }, [recent, counts, viewName, config.maxRecentViews, activeViewId])

    return (
        <SidePanel
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            withoutOverlay
            withoutPadding
            width="75vw"
        >
            <Panel
                withoutBorder
                elevation="high"
                h="100%"
                overflow="auto"
                pb="lg"
            >
                <PanelHeader
                    title="View Count Refresh Debug (v3)"
                    trailingSlot={
                        <Button
                            icon={<Icon name="close" />}
                            variant="tertiary"
                            size="sm"
                            aria-label="Close"
                            onClick={() => onOpenChange?.(false)}
                        />
                    }
                    {...({
                        style: { background: 'var(--elevation-neutral-high)' },
                    } as object)}
                />
                <Box flexDirection="column" gap="md" w="100%" px="lg">
                    <StatsBar events={events} config={config} />
                    <Heading size="sm">
                        Recent set ({recentRows.length} /{' '}
                        {config.maxRecentViews})
                    </Heading>
                    <Box mx="calc(-1 * var(--spacing-lg))">
                        <DataTable
                            data={recentRows}
                            columns={getRecentColumns(config)}
                            elevation="high"
                        />
                    </Box>

                    <Box mt="xl">
                        <Heading size="sm">Event Log</Heading>
                    </Box>
                    <Box mx="calc(-1 * var(--spacing-lg))">
                        <DataTable
                            data={events}
                            columns={getEventColumns()}
                            sorting={{
                                enable: true,
                                defaultValue: [{ id: 'timestamp', desc: true }],
                            }}
                            pagination={{
                                enable: true,
                                defaultValue: {
                                    pageIndex: 0,
                                    pageSize: 10,
                                },
                            }}
                            elevation="high"
                        />
                    </Box>
                </Box>
            </Panel>
        </SidePanel>
    )
}

// --- Internal helpers ---

function formatAge(iso: string, now: number): string {
    const seconds = Math.round((now - new Date(iso).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    return `${Math.round(minutes / 60)}h`
}

function useNow(): number {
    const [now, setNow] = useState(Date.now)
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), Duration.seconds(1))
        return () => clearInterval(id)
    }, [])
    return now
}

function useHasHydratedCounts(): boolean {
    const [hasHydrated, setHasHydrated] = useState(() =>
        viewsCountStore.persist.hasHydrated(),
    )
    useEffect(() => {
        if (hasHydrated) return
        return viewsCountStore.persist.onFinishHydration(() =>
            setHasHydrated(true),
        )
    }, [hasHydrated])
    return hasHydrated
}

function LeaderCard() {
    const isLeader = useStore(viewsCountStore, (s) => s.isLeader)
    return (
        <Tooltip
            trigger={
                <StatCardShell label="Leader">
                    <Box flexDirection="row" alignItems="center" gap="xs">
                        <Dot color={isLeader ? 'green' : 'grey'} size="md" />
                        <Heading size="lg">{isLeader ? 'Yes' : 'No'}</Heading>
                    </Box>
                </StatCardShell>
            }
        >
            <TooltipContent title="Whether this tab holds the v3 scheduler lock (only one tab refreshes at a time)" />
        </Tooltip>
    )
}

function NextTickCard() {
    const nextTickAt = useStore(viewsCountStore, (s) => s.nextTickAt)
    const isLeader = useStore(viewsCountStore, (s) => s.isLeader)
    const now = useNow()

    const display = (() => {
        if (!isLeader) return '—'
        if (nextTickAt === null) return '—'
        const remaining = Math.max(0, nextTickAt - now)
        if (remaining < 1000) return 'now'
        return `${Math.ceil(remaining / 1000)}s`
    })()

    return (
        <Tooltip
            trigger={
                <StatCardShell label="Next tick">
                    <Heading size="lg">{display}</Heading>
                </StatCardShell>
            }
        >
            <TooltipContent
                title={
                    isLeader
                        ? nextTickAt
                            ? `Fires at ${new Date(nextTickAt).toLocaleTimeString()}`
                            : 'Waiting for the first tick'
                        : 'Only the leader tab schedules ticks'
                }
            />
        </Tooltip>
    )
}

function MessagesCard({ events }: { events: ViewEvent[] }) {
    const now = useNow()
    const fiveMinAgo = now - Duration.minutes(5)
    const count = events.filter((e) => e.timestamp >= fiveMinAgo).length
    return (
        <Tooltip
            trigger={
                <StatCardShell label="Messages (5m)">
                    <Heading size="lg">{count}</Heading>
                </StatCardShell>
            }
        >
            <TooltipContent title="WS messages sent/received in the last 5 minutes" />
        </Tooltip>
    )
}

function TotalViewsCard() {
    const allViews = useAllViews()
    return (
        <Tooltip
            trigger={
                <StatCardShell label="Total views">
                    <Heading size="lg">{allViews.length}</Heading>
                </StatCardShell>
            }
        >
            <TooltipContent title="Total views known to the client" />
        </Tooltip>
    )
}

function DeactivatedViewsCard() {
    const allViews = useAllViews()
    const deactivatedCount = useMemo(
        () => allViews.filter(isViewDeactivated).length,
        [allViews],
    )
    return (
        <Tooltip
            trigger={
                <StatCardShell label="Deactivated">
                    <Heading size="lg">{deactivatedCount}</Heading>
                </StatCardShell>
            }
        >
            <TooltipContent title="Views with a `deactivated_datetime` set. The takeover scan skips these — the server returns 0 for them and they don't render a count badge." />
        </Tooltip>
    )
}

function StaleViewsCard({ config }: { config: RefreshConfig }) {
    const allViews = useAllViews()
    const counts = useStore(viewsCountStore, (s) => s.counts)
    const hasHydrated = useHasHydratedCounts()
    const now = useNow()

    const activeViews = useMemo(
        () => allViews.filter((v) => !isViewDeactivated(v)),
        [allViews],
    )

    const staleCount = useMemo(() => {
        const thresholdMs = Duration.seconds(config.initialFetchTtlSeconds)
        let stale = 0
        for (const view of activeViews) {
            const entry = counts[view.id]
            if (!entry?.lastFetchedAt) {
                stale += 1
                continue
            }
            if (now - Date.parse(entry.lastFetchedAt) >= thresholdMs) stale += 1
        }
        return stale
    }, [activeViews, counts, config.initialFetchTtlSeconds, now])

    return (
        <Tooltip
            trigger={
                <StatCardShell label="Stale views">
                    <Heading size="lg">
                        {hasHydrated
                            ? `${staleCount} / ${activeViews.length}`
                            : '—'}
                    </Heading>
                </StatCardShell>
            }
        >
            <TooltipContent
                title={
                    hasHydrated
                        ? `Views whose persisted count is missing or older than initialFetchTtlSeconds (${config.initialFetchTtlSeconds}s). The next leader takeover will dispatch these.`
                        : 'Waiting for persisted counts to hydrate from local storage.'
                }
            />
        </Tooltip>
    )
}

function RecentViewsCard({ config }: { config: RefreshConfig }) {
    const recent = useStore(viewsCountStore, (s) => s.recent)
    const count = Object.keys(recent).length
    return (
        <Tooltip
            trigger={
                <StatCardShell label="Recent views">
                    <Heading size="lg">
                        {count} / {config.maxRecentViews}
                    </Heading>
                </StatCardShell>
            }
        >
            <TooltipContent title="Views in the LRU polled this tick" />
        </Tooltip>
    )
}

function ViewsLast5MinCard({ events }: { events: ViewEvent[] }) {
    const now = useNow()
    const fiveMinAgo = now - Duration.minutes(5)
    const distinct = new Set<number>()
    for (const e of events) {
        if (e.timestamp < fiveMinAgo) continue
        for (const id of e.viewIds) distinct.add(id)
    }
    return (
        <Tooltip
            trigger={
                <StatCardShell label="Views (5m)">
                    <Heading size="lg">{distinct.size}</Heading>
                </StatCardShell>
            }
        >
            <TooltipContent title="Distinct view IDs touched by events in the last 5 minutes" />
        </Tooltip>
    )
}

function StatCardShell({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {
    return (
        <Card
            elevation="mid"
            p="sm"
            flexDirection="column"
            alignItems="flex-start"
            gap="xxs"
            w="100%"
            h="100%"
        >
            <Text size="sm" color="content-neutral-secondary">
                {label}
            </Text>
            {children}
        </Card>
    )
}

function StatsBar({
    events,
    config,
}: {
    events: ViewEvent[]
    config: RefreshConfig
}) {
    return (
        <Box style={statsRowStyle} mb="md">
            <LeaderCard />
            <NextTickCard />
            <TotalViewsCard />
            <DeactivatedViewsCard />
            <StaleViewsCard config={config} />
            <RecentViewsCard config={config} />
            <MessagesCard events={events} />
            <ViewsLast5MinCard events={events} />
        </Box>
    )
}

const statsRowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 'var(--spacing-sm)',
} as const

function FetchAgeCell({
    lastFetchedAt,
    count,
    isActiveView,
    config,
}: {
    lastFetchedAt: string | null
    count: number
    isActiveView: boolean
    config: RefreshConfig
}) {
    const now = useNow()
    if (!lastFetchedAt) {
        return (
            <DataTableBaseCell>
                <Tag color="red" size="sm">
                    never
                </Tag>
            </DataTableBaseCell>
        )
    }
    const seconds = Math.round((now - new Date(lastFetchedAt).getTime()) / 1000)
    const ttl = getTtlSecondsForView({ count, isActiveView, config })
    const expired = seconds >= ttl
    return (
        <DataTableBaseCell>
            <Tooltip
                trigger={
                    <Tag color={expired ? 'orange' : 'green'} size="sm">
                        {formatAge(lastFetchedAt, now)}
                    </Tag>
                }
            >
                <TooltipContent title={new Date(lastFetchedAt).toISOString()} />
            </Tooltip>
        </DataTableBaseCell>
    )
}

function getTtlBandColor(
    ttlSeconds: number,
): 'green' | 'teal' | 'blue' | 'orange' | 'red' {
    if (ttlSeconds <= 60) return 'green'
    if (ttlSeconds <= 180) return 'teal'
    if (ttlSeconds <= 300) return 'blue'
    if (ttlSeconds <= 600) return 'orange'
    return 'red'
}

function formatTtl(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const minutes = seconds / 60
    return Number.isInteger(minutes) ? `${minutes}m` : `${minutes.toFixed(1)}m`
}

function TtlCell({
    count,
    isActiveView,
    config,
}: {
    count: number
    isActiveView: boolean
    config: RefreshConfig
}) {
    const ttl = getTtlSecondsForView({ count, isActiveView, config })
    return (
        <DataTableBaseCell>
            <Tooltip
                trigger={
                    <Tag color={getTtlBandColor(ttl)} size="sm">
                        {formatTtl(ttl)}
                    </Tag>
                }
            >
                <TooltipContent
                    title={`${isActiveView ? 'Active view' : 'Refresh'} TTL for ${count} ticket${count === 1 ? '' : 's'}: ${ttl}s`}
                />
            </Tooltip>
        </DataTableBaseCell>
    )
}

function ViewedAgeCell({ value }: { value: string }) {
    const now = useNow()
    return (
        <DataTableBaseCell>
            <Tooltip trigger={<Tag size="sm">{formatAge(value, now)}</Tag>}>
                <TooltipContent title={new Date(value).toISOString()} />
            </Tooltip>
        </DataTableBaseCell>
    )
}

function buildRecentColumns(config: RefreshConfig) {
    const columnHelper = createColumnHelper<RecentRow>()

    return [
        columnHelper.accessor('viewId', {
            header: 'View ID',
            cell: (info) => <DataTableTextCell {...info} />,
            hug: true,
        }),
        columnHelper.accessor('name', {
            header: 'Name',
            cell: (info) => (
                <DataTableBaseCell>
                    <Text size="sm" overflow="ellipsis">
                        {info.getValue()}
                    </Text>
                </DataTableBaseCell>
            ),
            minSize: 200,
            maxSize: 200,
        }),
        columnHelper.accessor('count', {
            header: 'Count',
            cell: (info) => (
                <DataTableBaseCell>
                    <Tag size="sm">{String(info.getValue())}</Tag>
                </DataTableBaseCell>
            ),
            hug: true,
        }),
        columnHelper.accessor('viewedAt', {
            header: 'Viewed',
            cell: (info) => <ViewedAgeCell value={info.getValue()} />,
            hug: true,
        }),
        columnHelper.accessor('lastFetchedAt', {
            header: 'Fetched',
            cell: (info) => (
                <FetchAgeCell
                    lastFetchedAt={info.getValue()}
                    count={info.row.original.count}
                    isActiveView={info.row.original.isActiveView}
                    config={config}
                />
            ),
            hug: true,
        }),
        columnHelper.accessor(
            (row) =>
                getTtlSecondsForView({
                    count: row.count,
                    isActiveView: row.isActiveView,
                    config,
                }),
            {
                id: 'ttl',
                header: 'TTL',
                cell: (info) => (
                    <TtlCell
                        count={info.row.original.count}
                        isActiveView={info.row.original.isActiveView}
                        config={config}
                    />
                ),
                hug: true,
            },
        ),
    ]
}

function getRecentColumns(config: RefreshConfig) {
    // Columns close over config (for per-count TTL coloring) so they have to
    // be rebuilt whenever the flag-driven config changes.
    return buildRecentColumns(config)
}

function buildEventColumns() {
    const columnHelper = createColumnHelper<ViewEvent>()

    return [
        columnHelper.accessor('timestamp', {
            header: 'Time',
            cell: (info) => (
                <DataTableBaseCell>
                    <Text size="sm">
                        {new Date(info.getValue()).toLocaleTimeString()}
                    </Text>
                </DataTableBaseCell>
            ),
            hug: true,
        }),
        columnHelper.accessor('direction', {
            header: 'Direction',
            cell: (info) => (
                <DataTableBaseCell>
                    <Tag
                        size="sm"
                        color={info.getValue() === 'inbound' ? 'green' : 'blue'}
                    >
                        {info.getValue()}
                    </Tag>
                </DataTableBaseCell>
            ),
            hug: true,
        }),
        columnHelper.accessor('type', {
            header: 'Event',
            cell: (info) => <DataTableTextCell {...info} />,
            hug: true,
        }),
        columnHelper.accessor((row) => row.viewIds.length, {
            id: 'viewCount',
            header: 'Count',
            cell: (info) => (
                <DataTableBaseCell>
                    <Quantity quantity={info.getValue()} size="sm" />
                </DataTableBaseCell>
            ),
            hug: true,
        }),
        columnHelper.accessor('viewIds', {
            header: 'View IDs',
            cell: (info) => (
                <DataTableBaseCell>
                    <Text size="sm">{info.getValue().join(', ')}</Text>
                </DataTableBaseCell>
            ),
        }),
    ]
}

let cachedEventColumns: ReturnType<typeof buildEventColumns> | null = null
function getEventColumns() {
    if (!cachedEventColumns) cachedEventColumns = buildEventColumns()
    return cachedEventColumns
}
