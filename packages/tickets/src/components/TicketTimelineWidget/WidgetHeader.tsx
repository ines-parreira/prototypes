import { Box, Heading, Tag, Text } from '@gorgias/axiom'

import styles from './WidgetHeader.less'

type WidgetHeaderProps = {
    totalNumber: number
    openTicketsNumber: number
    snoozedTicketsNumber: number
    customerName?: string
    isLoading: boolean
    fetchLimit?: number
}

function formatCount(count: number, limit?: number): string {
    if (limit && count >= limit) {
        return `${limit}+`
    }
    return String(count)
}

export function WidgetHeader({
    totalNumber,
    openTicketsNumber,
    snoozedTicketsNumber,
    customerName,
    isLoading,
    fetchLimit,
}: WidgetHeaderProps) {
    return (
        <Box mb={totalNumber > 1 ? 'sm' : undefined}>
            <Heading size="md">
                <Box gap="xs" flexDirection="row" alignItems="center">
                    <Text size="md" variant="bold">
                        Tickets
                    </Text>
                    {!isLoading && (
                        <Box gap="xs" alignItems="center">
                            <Tag color="grey" className={styles.tag}>
                                {formatCount(totalNumber, fetchLimit)}
                            </Tag>

                            {totalNumber === 1 && (
                                <Text size="sm" variant="regular" color="grey">
                                    {customerName
                                        ? `This is ${customerName}'s first ticket`
                                        : `This is customer's first ticket`}
                                </Text>
                            )}

                            {totalNumber > 1 && openTicketsNumber > 0 && (
                                <Tag color="purple" className={styles.tag}>
                                    {`${openTicketsNumber} Open`}
                                </Tag>
                            )}

                            {totalNumber > 1 && snoozedTicketsNumber > 0 && (
                                <Tag color="blue" className={styles.tag}>
                                    {`${snoozedTicketsNumber} Snoozed`}
                                </Tag>
                            )}
                        </Box>
                    )}
                </Box>
            </Heading>
        </Box>
    )
}
