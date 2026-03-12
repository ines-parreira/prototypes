import { useState } from 'react'

import {
    Box,
    OverflowList,
    OverflowListShowLess,
    OverflowListShowMore,
    Skeleton,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import type { TicketCustomField } from '../types'
import { CustomFieldItem } from './CustomFieldItem'
import { ShowMoreContent } from './ShowMoreContent'

import css from '../TicketTimelineWidget.less'

type TicketFieldsOverflowListProps = {
    customFields: TicketCustomField[]
    isLoading: boolean
    nonExpandedLineCount?: number
}

export function TicketFieldsOverflowList({
    customFields,
    isLoading,
    nonExpandedLineCount = 2,
}: TicketFieldsOverflowListProps) {
    const [hiddenCount, setHiddenCount] = useState(0)
    const hasTicketFields = customFields.length > 0

    if (isLoading) {
        return <Skeleton count={2} />
    }

    if (!hasTicketFields) {
        return (
            <Box height="lg" alignItems="center">
                <Text size="sm" variant="regular">
                    No ticket fields yet
                </Text>
            </Box>
        )
    }

    const hiddenFields = customFields.slice(customFields.length - hiddenCount)

    return (
        <OverflowList nonExpandedLineCount={nonExpandedLineCount}>
            {customFields.map((field) => (
                <CustomFieldItem key={field.id} field={field} />
            ))}

            <Tooltip
                trigger={
                    <OverflowListShowMore className={css.overflowListShowMore}>
                        {({ hiddenCount: count }) => {
                            if (count !== hiddenCount) {
                                setHiddenCount(count)
                            }
                            return (
                                <Box
                                    flexDirection="row"
                                    alignItems="center"
                                    gap="xxxs"
                                >
                                    <Text
                                        className={css.secondaryText}
                                        size="sm"
                                    >
                                        +{count} more
                                    </Text>
                                </Box>
                            )
                        }}
                    </OverflowListShowMore>
                }
            >
                <TooltipContent>
                    <ShowMoreContent hiddenFields={hiddenFields} />
                </TooltipContent>
            </Tooltip>
            <OverflowListShowLess
                className={css.overflowListShowMore}
                leadingSlot="arrow-chevron-up"
            >
                <Text className={css.secondaryText} size="sm">
                    Show less
                </Text>
            </OverflowListShowLess>
        </OverflowList>
    )
}
