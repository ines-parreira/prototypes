import classNames from 'classnames'

import { Box, Dot, Heading, Icon, Tag, Text } from '@gorgias/axiom'

import { SectionToggleButton } from '../SectionToggleButton'
import styles from './WidgetHeader.less'

type WidgetHeaderProps = {
    totalNumber: number
    openTicketsNumber: number
    snoozedTicketsNumber: number
    customerName?: string
    isLoading: boolean
    fetchLimit?: number
    isExpanded?: boolean
    onToggle?: () => void
    className?: string
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
    isExpanded,
    onToggle,
    className,
}: WidgetHeaderProps) {
    const showToggle = onToggle !== undefined && isExpanded !== undefined

    return (
        <Box
            flexDirection={showToggle ? 'row' : undefined}
            alignItems={showToggle ? 'center' : undefined}
            justifyContent={showToggle ? 'space-between' : undefined}
            gap={showToggle ? 'xs' : undefined}
            mb={!showToggle && totalNumber > 1 ? 'sm' : undefined}
            className={classNames(
                showToggle ? styles.clickableHeader : undefined,
                className,
            )}
            onClick={showToggle ? onToggle : undefined}
        >
            <Heading size="md">
                <Box gap="xs" flexDirection="row" alignItems="center">
                    <Box flexDirection="row" alignItems="center" gap="xxxs">
                        {showToggle && (
                            <Icon name="chat-conversation-circle" size="md" />
                        )}
                        <Text size="md" variant="bold">
                            Tickets
                        </Text>
                    </Box>
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
                                <Tag
                                    color="purple"
                                    className={styles.tag}
                                    leadingSlot={<Dot color="purple" />}
                                >
                                    {`${openTicketsNumber} open`}
                                </Tag>
                            )}

                            {totalNumber > 1 && snoozedTicketsNumber > 0 && (
                                <Tag
                                    color="blue"
                                    className={styles.tag}
                                    leadingSlot={<Dot color="blue" />}
                                >
                                    {`${snoozedTicketsNumber} snoozed`}
                                </Tag>
                            )}
                        </Box>
                    )}
                </Box>
            </Heading>
            {showToggle && (
                <SectionToggleButton
                    isExpanded={isExpanded}
                    onToggle={onToggle}
                    sectionLabel="Tickets"
                />
            )}
        </Box>
    )
}
