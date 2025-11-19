import { Box, Card, Heading, Icon, Text } from '@gorgias/axiom'

import css from './AnalyticsMetricCard.less'

type AnalyticsMetricCardProps = {
    title: string
    value: string
    trend: number
}

export const AnalyticsMetricCard = ({
    title,
    value,
    trend,
}: AnalyticsMetricCardProps) => {
    const isPositive = trend > 0
    const isNegative = trend < 0
    const trendIcon = isPositive
        ? 'trending-up'
        : isNegative
          ? 'trending-down'
          : 'trending-up'
    const trendTextColor = isPositive
        ? 'var(--content-success-primary)'
        : isNegative
          ? 'var(--content-error-primary)'
          : 'var(--content-neutral-secondary)'
    const trendTextClassName = isPositive
        ? css.trendTextPositive
        : isNegative
          ? css.trendTextNegative
          : css.trendTextNeutral

    return (
        <Card elevation="mid" w="100%" h="100%" p="lg">
            <Box
                flexDirection="column"
                alignItems="flex-start"
                gap="md"
                flex="1 0 0"
            >
                <Box flexDirection="column" gap="xxxs" w="100%">
                    <Box gap="xxxs" h="24px" alignItems="center" w="100%">
                        <Text
                            size="sm"
                            variant="medium"
                            className={css.titleText}
                        >
                            {title}
                        </Text>
                        <Icon
                            name="info"
                            size="sm"
                            color="var(--content-neutral-secondary)"
                        />
                    </Box>
                    <Box gap="xxxs" alignItems="center" w="100%">
                        <Heading size="xl">{value}</Heading>
                        <Box gap="xxxs" alignItems="center">
                            <Icon
                                name={trendIcon}
                                size="xs"
                                color={trendTextColor}
                            />
                            <Text
                                size="sm"
                                variant="medium"
                                className={trendTextClassName}
                            >
                                {Math.abs(trend)}%
                            </Text>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Card>
    )
}
