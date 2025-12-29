import { Box, Heading, Tag, Text } from '@gorgias/axiom'

type WidgetHeaderProps = {
    totalNumber: number
    openTicketsNumber: number
    snoozedTicketsNumber: number
    customerName?: string
    isLoading: boolean
}

export function WidgetHeader({
    totalNumber,
    openTicketsNumber,
    snoozedTicketsNumber,
    customerName,
    isLoading,
}: WidgetHeaderProps) {
    return (
        <Box mb="sm">
            <Heading size="md">
                <Box gap="xs" flexDirection="row" alignItems="center">
                    <Text size="md" variant="bold">
                        Tickets
                    </Text>
                    {!isLoading && (
                        <Box gap="xs" alignItems="center">
                            <Tag color="grey">{totalNumber}</Tag>

                            {totalNumber === 1 && (
                                <Text size="sm" variant="regular" color="grey">
                                    {customerName
                                        ? `This is ${customerName}'s first ticket`
                                        : `This is customer's first ticket`}
                                </Text>
                            )}

                            {totalNumber > 1 && openTicketsNumber > 0 && (
                                <Tag color="purple">
                                    {`${openTicketsNumber} Open`}
                                </Tag>
                            )}

                            {totalNumber > 1 && snoozedTicketsNumber > 0 && (
                                <Tag color="blue">
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
