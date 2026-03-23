import { Box, Button, Heading, Text } from '@gorgias/axiom'

import {
    EmptyViewsState,
    getViewAwareEmptyStateMessage,
} from '../../utils/views'
import type { ViewEmptyStateKind } from '../../utils/views'
import { TicketListItemSkeleton } from './TicketListItem/components/TicketListItemSkeleton'

import css from './TicketList.module.less'

type Props = {
    isLoading: boolean
    emptyStateVariant: ViewEmptyStateKind
    isInboxView?: boolean
    onFixFilters?: () => void
    onRefresh?: () => void
}

export function TicketListEmptyPlaceholder({
    isLoading,
    emptyStateVariant,
    isInboxView,
    onFixFilters,
    onRefresh,
}: Props) {
    if (isLoading) {
        return (
            <>
                {Array.from({ length: 10 }, (_, i) => (
                    <TicketListItemSkeleton key={i} />
                ))}
            </>
        )
    }

    const { heading, subText } = getViewAwareEmptyStateMessage({
        kind: emptyStateVariant,
        isInboxView,
    })

    return (
        <Box
            height="100%"
            px="lg"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap="md"
            className={css.emptyState}
        >
            <Box flexDirection="column" alignItems="center" gap="xxxs">
                <Heading size="xl" className={css.emptyStateHeading}>
                    {heading}
                </Heading>
                <Text
                    size="md"
                    variant="regular"
                    align="center"
                    color="content-neutral-default"
                >
                    {subText}
                </Text>
            </Box>
            {emptyStateVariant === EmptyViewsState.InvalidFilters &&
                onFixFilters && (
                    <Button onClick={onFixFilters}>Fix filters</Button>
                )}
            {emptyStateVariant === EmptyViewsState.Error && onRefresh && (
                <Button onClick={onRefresh}>Refresh</Button>
            )}
        </Box>
    )
}
