import {
    Box,
    Icon,
    OverflowListShowMore,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { TicketTag } from '@gorgias/helpdesk-queries'

import css from './TagsMultiSelect.less'

export type TagsMultiSelectShowMoreProps = {
    value: TicketTag[]
}

export function TagsMultiSelectShowMore({
    value,
}: TagsMultiSelectShowMoreProps) {
    return (
        <OverflowListShowMore>
            {({ hiddenCount: count }) => {
                const safeCount = Math.min(count, value.length)
                const hiddenTags =
                    safeCount > 0 ? value.slice(value.length - safeCount) : []

                return (
                    <Tooltip
                        placement="bottom"
                        trigger={
                            <div className={css.overflowButtonContent}>
                                <span>+{count}</span>
                                <Icon name="arrow-chevron-down" />
                            </div>
                        }
                    >
                        <TooltipContent maxWidth={256}>
                            <Box
                                className={css.overflowTooltipContent}
                                flexDirection="column"
                                alignItems="flex-start"
                                gap="xxxxs"
                            >
                                {hiddenTags.map((tag) => (
                                    <Text
                                        key={tag.id}
                                        className={css.overflowTooltipTag}
                                        size="sm"
                                        variant="bold"
                                        wrap="wrap"
                                    >
                                        {tag.name}
                                    </Text>
                                ))}
                            </Box>
                        </TooltipContent>
                    </Tooltip>
                )
            }}
        </OverflowListShowMore>
    )
}
