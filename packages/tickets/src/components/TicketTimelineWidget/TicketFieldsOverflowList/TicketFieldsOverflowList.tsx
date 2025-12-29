import { useState } from 'react'

import {
    OverflowList,
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
}

export function TicketFieldsOverflowList({
    customFields,
    isLoading,
}: TicketFieldsOverflowListProps) {
    const [hiddenCount, setHiddenCount] = useState(0)
    const hasTicketFields = customFields.length > 0

    if (isLoading) {
        return <Skeleton count={2} />
    }

    if (!hasTicketFields) {
        return (
            <Text size="sm" variant="regular">
                No ticket fields yet
            </Text>
        )
    }

    const hiddenFields = customFields.slice(customFields.length - hiddenCount)

    return (
        <OverflowList gap="xxxs" nonExpandedLineCount={2} isExpanded={false}>
            {customFields.map((field) => (
                <CustomFieldItem key={field.id} field={field} />
            ))}

            {/* Structure: Tooltip wraps both OverflowListShowMore and TooltipContent as siblings.
                The button (span) must be inside OverflowListShowMore to trigger the tooltip,
                and TooltipContent must be at the same level to display the tooltip content. */}
            <Tooltip>
                <OverflowListShowMore className={css.overflowListShowMore}>
                    {({ hiddenCount: count }) => {
                        if (count !== hiddenCount) {
                            setHiddenCount(count)
                        }
                        return <span>+{count} more</span>
                    }}
                </OverflowListShowMore>
                <TooltipContent>
                    <ShowMoreContent hiddenFields={hiddenFields} />
                </TooltipContent>
            </Tooltip>
        </OverflowList>
    )
}
