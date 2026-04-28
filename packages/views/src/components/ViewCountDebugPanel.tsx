import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useStore } from 'zustand'

import {
    Banner,
    Box,
    Card,
    createColumnHelper,
    DataTable,
    DataTableBaseCell,
    DataTableTextCell,
    Disclosure,
    DisclosureHeader,
    DisclosurePanel,
    Dot,
    Heading,
    Icon,
    OverlayContent,
    OverlayHeader,
    Quantity,
    SidePanel,
    Tag,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { useAllViews } from '../hooks/useAllViews'
import {
    isViewActive,
    isViewDeactivated,
    isViewInViewport,
    isViewLarge,
    isViewRealtime,
    isViewRecentlyViewed,
    isViewStale,
    isViewSystem,
    isViewVisible,
} from '../predicates'
import { DEFAULT_REFRESH_CONFIG } from '../scheduler/selectViewsToRefresh'
import type { ViewEvent } from '../store/viewEventLog'
import { viewEventLogStore } from '../store/viewEventLog'
import { viewsCountStore } from '../store/viewsCountStore'

type ViewCountDebugPanelProps = {
    isOpen?: boolean
    onOpenChange?: (isOpen: boolean) => void
}

export function ViewCountDebugPanel({
    isOpen = false,
    onOpenChange,
}: ViewCountDebugPanelProps) {
    const isEnabled = useFlag(FeatureFlagKey.ImprovedViewCountUpdates)
    const counts = useStore(viewsCountStore, (s) => s.counts)
    const scores = useStore(viewsCountStore, (s) => s.scores)
    const expandedSectionIds = useStore(
        viewsCountStore,
        (s) => s.expandedSectionIds,
    )
    const allViews = useAllViews()
    const activeViewId = useStore(viewsCountStore, (s) => s.activeViewId)
    const viewportViewIds = useStore(viewsCountStore, (s) => s.viewportViewIds)
    const events = useStore(viewEventLogStore, (s) => s.events)

    const rows = useMemo<Row[]>(() => {
        if (!isEnabled) return []
        return allViews.map((v) => {
            const entry = counts[v.id]
            return {
                viewId: v.id,
                name: v.name ?? '',
                count: entry?.count,
                score: scores[v.id],
                lastFetchedAt: entry?.lastFetchedAt ?? null,
                lastViewedAt: entry?.lastViewedAt ?? null,
                isRealtimeView: isViewRealtime(v),
                isRecentlyViewed: isViewRecentlyViewed(v),
                isStale: isViewStale(v),
                isLarge: isViewLarge(v),
                isVisible: isViewVisible(v),
                isInViewport: isViewInViewport(v.id),
                isSystemView: isViewSystem(v),
                isActive: isViewActive(v.id),
                isDeactivated: isViewDeactivated(v),
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps -- activeViewId, expandedSectionIds, and viewportViewIds invalidate predicates that read from the store
    }, [
        isEnabled,
        allViews,
        counts,
        scores,
        activeViewId,
        expandedSectionIds,
        viewportViewIds,
    ])

    return (
        <SidePanel
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            withoutOverlay
            width="75vw"
        >
            <OverlayHeader title="View Count Refresh Debug" />
            <OverlayContent>
                <Box
                    flexDirection="column"
                    gap="md"
                    w="100%"
                    maxHeight="calc(100vh - 120px)"
                >
                    {isEnabled ? (
                        <>
                            <StatsBar rows={rows} events={events} />
                            <Box flexGrow={1}>
                                <DataTable
                                    data={rows}
                                    columns={getColumns()}
                                    sorting={{
                                        enable: true,
                                        defaultValue: [
                                            { id: 'lastFetchedAt', desc: true },
                                        ],
                                    }}
                                    search={{ enable: true }}
                                    pagination={{
                                        enable: true,
                                        defaultValue: {
                                            pageIndex: 0,
                                            pageSize: 50,
                                        },
                                    }}
                                    elevation="high"
                                    withBorder
                                />
                            </Box>
                        </>
                    ) : (
                        <Banner
                            intent="warning"
                            isClosable={false}
                            title="Legacy view count scheduling in use"
                            description="The ImprovedViewCountUpdates flag is disabled, so view counts are fetched by the legacy scheduler."
                        />
                    )}

                    <Disclosure defaultExpanded={!isEnabled} w="100%">
                        <DisclosureHeader title="Event Log" />
                        <DisclosurePanel>
                            <Box flexDirection="column" flexGrow={1} w="100%">
                                <DataTable
                                    data={events}
                                    columns={getEventColumns()}
                                    sorting={{
                                        enable: true,
                                        defaultValue: [
                                            { id: 'timestamp', desc: true },
                                        ],
                                    }}
                                    pagination={{
                                        enable: true,
                                        defaultValue: {
                                            pageIndex: 0,
                                            pageSize: 20,
                                        },
                                    }}
                                    elevation="high"
                                    withBorder
                                />
                            </Box>
                        </DisclosurePanel>
                    </Disclosure>
                </Box>
            </OverlayContent>
        </SidePanel>
    )
}

// --- Internal helpers ---

type Row = {
    viewId: number
    name: string
    count: number | undefined
    score: number | undefined
    lastFetchedAt: string | null
    lastViewedAt: string | null
    isRealtimeView: boolean
    isRecentlyViewed: boolean
    isStale: boolean
    isLarge: boolean
    isVisible: boolean
    isInViewport: boolean
    isSystemView: boolean
    isActive: boolean
    isDeactivated: boolean
}

type Stats = {
    total: number
    deactivated: number
    visible: number
    inViewport: number
    system: number
    realtime: number
    recent: number
    messages5m: number
    notFetched: number
    stale: number
    largeCount: number
    p10Age: string
    p50Age: string
    p90Age: string
    p99Age: string
}

const NOT_FETCHED_AGE_SECONDS = 86400

function percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0
    const idx = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[Math.max(0, idx)]
}

function formatSeconds(s: number): string {
    if (s < 60) return `${Math.round(s)}s`
    if (s < 3600) return `${Math.round(s / 60)}m`
    return `${Math.round(s / 3600)}h`
}

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
        const id = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(id)
    }, [])
    return now
}

function computeStats(rows: Row[], events: ViewEvent[], now: number): Stats {
    const activeRows = rows.filter((r) => !r.isDeactivated)
    const staleTimes = activeRows
        .map((r) =>
            r.lastFetchedAt
                ? (now - new Date(r.lastFetchedAt).getTime()) / 1000
                : NOT_FETCHED_AGE_SECONDS,
        )
        .sort((a, b) => a - b)

    const fiveMinAgo = now - 5 * 60 * 1000
    const messages5m = events.filter((e) => e.timestamp >= fiveMinAgo).length

    return {
        total: rows.length,
        deactivated: rows.filter((r) => r.isDeactivated).length,
        visible: rows.filter((r) => r.isVisible).length,
        inViewport: rows.filter((r) => r.isInViewport).length,
        system: rows.filter((r) => r.isSystemView).length,
        realtime: rows.filter((r) => r.isRealtimeView).length,
        recent: rows.filter((r) => r.isRecentlyViewed).length,
        messages5m,
        notFetched: rows.filter((r) => r.lastFetchedAt === null).length,
        stale: rows.filter((r) => r.isStale).length,
        largeCount: rows.filter((r) => r.isLarge).length,
        p10Age: formatSeconds(percentile(staleTimes, 10)),
        p50Age: formatSeconds(percentile(staleTimes, 50)),
        p90Age: formatSeconds(percentile(staleTimes, 90)),
        p99Age: formatSeconds(percentile(staleTimes, 99)),
    }
}

function StatCard({
    label,
    value,
    tooltip,
}: {
    label: string
    value: string | number
    tooltip: string
}) {
    return (
        <Box style={{ flex: '1 1 0', minWidth: 0 }}>
            <Tooltip
                trigger={
                    <Card
                        elevation="mid"
                        p="sm"
                        flexDirection="column"
                        alignItems="flex-start"
                        gap="xxs"
                        w="100%"
                    >
                        <Text size="sm" color="content-neutral-secondary">
                            {label}
                        </Text>
                        <Heading size="lg">{String(value)}</Heading>
                    </Card>
                }
            >
                <TooltipContent title={tooltip} />
            </Tooltip>
        </Box>
    )
}

function LeaderCard() {
    const isLeader = useStore(viewsCountStore, (s) => s.isLeader)
    return (
        <Box style={{ flex: '1 1 0', minWidth: 0 }}>
            <Tooltip
                trigger={
                    <Card
                        elevation="mid"
                        p="sm"
                        flexDirection="column"
                        alignItems="flex-start"
                        gap="xxs"
                        w="100%"
                    >
                        <Text size="sm" color="content-neutral-secondary">
                            Leader
                        </Text>
                        <Box flexDirection="row" alignItems="center" gap="xs">
                            <Dot
                                color={isLeader ? 'green' : 'grey'}
                                size="md"
                            />
                            <Heading size="lg">
                                {isLeader ? 'Yes' : 'No'}
                            </Heading>
                        </Box>
                    </Card>
                }
            >
                <TooltipContent title="Whether this tab holds the scheduler lock (only one tab refreshes at a time)" />
            </Tooltip>
        </Box>
    )
}

function StatsBar({ rows, events }: { rows: Row[]; events: ViewEvent[] }) {
    const now = useNow()
    const stats = useMemo(
        () => computeStats(rows, events, now),
        [rows, events, now],
    )

    return (
        <Box flexDirection="column" gap="sm" mb="md">
            <Box flexDirection="row" gap="sm">
                <LeaderCard />
                <StatCard
                    label="Total"
                    value={stats.total}
                    tooltip="Total views"
                />
                <StatCard
                    label="Stale"
                    value={stats.stale}
                    tooltip={`Age ≥ ${DEFAULT_REFRESH_CONFIG.staleSeconds}s or never fetched`}
                />
                <StatCard
                    label="Visible"
                    value={stats.visible}
                    tooltip="Views in expanded sidebar sections"
                />
                <StatCard
                    label="In Viewport"
                    value={stats.inViewport}
                    tooltip="Views currently visible in the sidebar scroll area"
                />
                <StatCard
                    label="System"
                    value={stats.system}
                    tooltip="System views (Inbox, Unassigned, etc.)"
                />
                <StatCard
                    label="Realtime"
                    value={stats.realtime}
                    tooltip="Realtime views (chat channel)"
                />
                <StatCard
                    label="Recent"
                    value={stats.recent}
                    tooltip={`Viewed within the last ${DEFAULT_REFRESH_CONFIG.recentlyActiveWindowSeconds / 60}min`}
                />
            </Box>
            <Box flexDirection="row" gap="sm">
                <StatCard
                    label="Not fetched"
                    value={stats.notFetched}
                    tooltip="Views never fetched from server"
                />
                <StatCard
                    label="Deactivated"
                    value={stats.deactivated}
                    tooltip="Deactivated views (scored as 0)"
                />
                <StatCard
                    label="Large"
                    value={stats.largeCount}
                    tooltip={`Views with count ≥ ${DEFAULT_REFRESH_CONFIG.largeCountThreshold} (deprioritized)`}
                />
                <StatCard
                    label="Messages (5m)"
                    value={stats.messages5m}
                    tooltip="WS messages sent/received in the last 5 minutes"
                />
                <StatCard
                    label="p10 age"
                    value={stats.p10Age}
                    tooltip="10th percentile age"
                />
                <StatCard
                    label="p50 age"
                    value={stats.p50Age}
                    tooltip="Median age of tracked views"
                />
                <StatCard
                    label="p90 age"
                    value={stats.p90Age}
                    tooltip="90th percentile age"
                />
                <StatCard
                    label="p99 age"
                    value={stats.p99Age}
                    tooltip="99th percentile age"
                />
            </Box>
        </Box>
    )
}

function ColumnHeader({ label, tooltip }: { label: string; tooltip: string }) {
    return (
        <Tooltip
            delay={0}
            trigger={
                <Text variant="bold" size="sm">
                    {label}
                </Text>
            }
        >
            <TooltipContent title={tooltip} />
        </Tooltip>
    )
}

function BooleanCell({ value }: { value: boolean }) {
    return (
        <DataTableBaseCell>
            <Icon
                name={value ? 'circle-check' : 'close-circle'}
                color={
                    value ? 'content-success-default' : 'border-neutral-default'
                }
                size="sm"
            />
        </DataTableBaseCell>
    )
}

function getAgeColor(
    seconds: number,
): 'green' | 'teal' | 'blue' | 'orange' | 'red' | 'purple' {
    const { minRefreshIntervalSeconds, staleSeconds } = DEFAULT_REFRESH_CONFIG
    if (seconds < minRefreshIntervalSeconds) return 'green'
    if (seconds < minRefreshIntervalSeconds * 2) return 'teal'
    if (seconds < staleSeconds) return 'blue'
    if (seconds < staleSeconds * 2) return 'orange'
    if (seconds < staleSeconds * 4) return 'red'
    return 'purple'
}

function RecentCell({
    value,
    lastViewedAt,
}: {
    value: boolean
    lastViewedAt: string
}) {
    const now = useNow()
    return (
        <Tooltip
            trigger={
                <Icon
                    name={value ? 'circle-check' : 'close-circle'}
                    color={
                        value
                            ? 'content-success-default'
                            : 'border-neutral-default'
                    }
                    size="sm"
                />
            }
        >
            <TooltipContent title={formatAge(lastViewedAt, now)} />
        </Tooltip>
    )
}

function AgeCell({ value }: { value: string | null }) {
    const now = useNow()
    if (!value) {
        return (
            <DataTableBaseCell>
                <Tag color="red" size="sm">
                    24h+
                </Tag>
            </DataTableBaseCell>
        )
    }
    const seconds = Math.round((now - new Date(value).getTime()) / 1000)
    return (
        <DataTableBaseCell>
            <Tooltip
                trigger={
                    <Tag color={getAgeColor(seconds)} size="sm">
                        {formatAge(value, now)}
                    </Tag>
                }
            >
                <TooltipContent title={new Date(value).toISOString()} />
            </Tooltip>
        </DataTableBaseCell>
    )
}

function LeaderOnlyCell({ children }: { children: ReactNode }) {
    const isLeader = useStore(viewsCountStore, (s) => s.isLeader)
    if (!isLeader)
        return (
            <DataTableBaseCell>
                <Icon
                    name="remove-minus-circle"
                    color="border-neutral-default"
                    size="sm"
                />
            </DataTableBaseCell>
        )
    return <>{children}</>
}

function ScoreCell({ value }: { value: number | undefined }) {
    return (
        <LeaderOnlyCell>
            <DataTableBaseCell>
                <Tag size="sm">{String(Math.round(value ?? 0))}</Tag>
            </DataTableBaseCell>
        </LeaderOnlyCell>
    )
}

function LeaderBooleanCell({ value }: { value: boolean }) {
    return (
        <LeaderOnlyCell>
            <BooleanCell value={value} />
        </LeaderOnlyCell>
    )
}

function LeaderRecentCell({
    value,
    lastViewedAt,
}: {
    value: boolean
    lastViewedAt: string | null
}) {
    return (
        <LeaderOnlyCell>
            {!lastViewedAt ? (
                <BooleanCell value={false} />
            ) : (
                <DataTableBaseCell>
                    <RecentCell value={value} lastViewedAt={lastViewedAt} />
                </DataTableBaseCell>
            )}
        </LeaderOnlyCell>
    )
}

function buildColumns() {
    const columnHelper = createColumnHelper<Row>()

    return [
        columnHelper.accessor('viewId', {
            header: 'View ID',
            cell: (info) => <DataTableTextCell {...info} />,
            hug: true,
        }),
        columnHelper.accessor('name', {
            header: 'Name',
            cell: (info) => (
                <DataTableBaseCell
                    gap="xs"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Text size="sm" overflow="ellipsis">
                        {info.getValue()}
                    </Text>
                    {info.row.original.isDeactivated && (
                        <Box flexShrink={0}>
                            <Tooltip
                                trigger={
                                    <Icon
                                        name="octagon-error"
                                        size="sm"
                                        color="red"
                                    />
                                }
                            >
                                <TooltipContent title="Deactivated" />
                            </Tooltip>
                        </Box>
                    )}
                </DataTableBaseCell>
            ),
            minSize: 200,
            maxSize: 200,
        }),
        columnHelper.accessor('count', {
            header: 'Count',
            cell: (info) => (
                <DataTableBaseCell>
                    <Tag size="sm">{String(info.getValue() ?? 0)}</Tag>
                </DataTableBaseCell>
            ),
            hug: true,
        }),
        columnHelper.accessor((row) => row.lastFetchedAt ?? '', {
            id: 'lastFetchedAt',
            header: 'Age',
            cell: (info) => <AgeCell value={info.row.original.lastFetchedAt} />,
            hug: true,
        }),
        columnHelper.accessor('score', {
            header: 'Score',
            cell: (info) => <ScoreCell value={info.getValue()} />,
            hug: true,
        }),
        columnHelper.accessor('isActive', {
            header: () => (
                <ColumnHeader label="AC" tooltip="Active (current URL)" />
            ),
            cell: (info) => <LeaderBooleanCell value={info.getValue()} />,
            hug: true,
        }),
        columnHelper.accessor('isStale', {
            header: () => (
                <ColumnHeader label="ST" tooltip="Stale (age ≥ threshold)" />
            ),
            cell: (info) => <LeaderBooleanCell value={info.getValue()} />,
            hug: true,
        }),
        columnHelper.accessor('isRealtimeView', {
            header: () => <ColumnHeader label="RT" tooltip="Realtime (chat)" />,
            cell: (info) => <LeaderBooleanCell value={info.getValue()} />,
            hug: true,
        }),
        columnHelper.accessor('isVisible', {
            header: () => (
                <ColumnHeader label="VI" tooltip="Visible in sidebar" />
            ),
            cell: (info) => <LeaderBooleanCell value={info.getValue()} />,
            hug: true,
        }),
        columnHelper.accessor('isInViewport', {
            header: () => (
                <ColumnHeader label="VP" tooltip="In browser viewport" />
            ),
            cell: (info) => <LeaderBooleanCell value={info.getValue()} />,
            hug: true,
        }),
        columnHelper.accessor('isSystemView', {
            header: () => <ColumnHeader label="SY" tooltip="System view" />,
            cell: (info) => <LeaderBooleanCell value={info.getValue()} />,
            hug: true,
        }),
        columnHelper.accessor('isRecentlyViewed', {
            header: () => <ColumnHeader label="RC" tooltip="Recently viewed" />,
            cell: (info) => (
                <LeaderRecentCell
                    value={info.getValue()}
                    lastViewedAt={info.row.original.lastViewedAt}
                />
            ),
            hug: true,
        }),
    ]
}

let cachedColumns: ReturnType<typeof buildColumns> | null = null
function getColumns() {
    if (!cachedColumns) cachedColumns = buildColumns()
    return cachedColumns
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
