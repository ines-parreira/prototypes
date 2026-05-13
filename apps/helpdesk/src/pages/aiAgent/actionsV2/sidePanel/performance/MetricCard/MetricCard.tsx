import {
    Box,
    Card,
    Heading,
    Icon,
    ProgressBar,
    Skeleton,
    Tag,
    Text,
} from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import { ProviderIcon } from '../../shared/ProviderIcon'
import type { MetricTrend } from '../../types'

import css from './MetricCard.less'

type Props = {
    label: string
    value: string | number
    /** Hint to consumers — they format the value themselves. */
    format?: 'number' | 'percentage' | 'rating'
    trend?: MetricTrend
    actionChip?: { iconUrl?: string; name: string }
    /** Inline progress display (e.g. share of total). 0–100. */
    progress?: { value: number; ariaLabel?: string }
    isLoading?: boolean
}

const TREND_ICON: Record<MetricTrend['direction'], IconName> = {
    up: 'trending-up',
    down: 'trending-down',
    flat: 'arrow-right',
}

export const MetricCard = ({
    label,
    value,
    trend,
    actionChip,
    progress,
    isLoading = false,
}: Props) => {
    if (isLoading) {
        return (
            <Card gap="xs" p="md">
                <Skeleton height={16} width={120} />
                <Skeleton height={28} width={80} />
            </Card>
        )
    }

    return (
        <Card gap="xxxs" p="md">
            <Text size="sm" color="content-neutral-secondary">
                {label}
            </Text>
            <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                gap="xs"
                width="100%"
            >
                <Box flexDirection="row" alignItems="center" gap="sm">
                    <Heading size="md">{value}</Heading>
                    {trend && (
                        <span
                            className={css.trend}
                            data-direction={trend.direction}
                            aria-label={`Trend ${trend.direction} ${trend.value}`}
                        >
                            <Icon
                                name={TREND_ICON[trend.direction]}
                                size="xs"
                            />
                            <Text size="sm" color="content-neutral-secondary">
                                {trend.value}
                            </Text>
                        </span>
                    )}
                    {progress && (
                        <Box
                            flexDirection="column"
                            gap="xxxs"
                            minWidth={80}
                            flexGrow={1}
                        >
                            <Text size="sm" color="content-neutral-secondary">
                                {progress.value}%
                            </Text>
                            <ProgressBar
                                value={progress.value}
                                aria-label={
                                    progress.ariaLabel ?? `${label} progress`
                                }
                            />
                        </Box>
                    )}
                </Box>
                {actionChip && (
                    <Tag
                        leadingSlot={
                            actionChip.iconUrl ? (
                                <ProviderIcon
                                    iconUrl={actionChip.iconUrl}
                                    alt={actionChip.name}
                                    size="sm"
                                    variant="plain"
                                />
                            ) : undefined
                        }
                    >
                        {actionChip.name}
                    </Tag>
                )}
            </Box>
        </Card>
    )
}
