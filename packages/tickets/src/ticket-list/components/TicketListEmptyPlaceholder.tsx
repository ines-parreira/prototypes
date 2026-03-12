import { Box, Button, Heading, Text } from '@gorgias/axiom'

import { TicketListItemSkeleton } from './TicketListItem/components/TicketListItemSkeleton'

import css from './TicketList.module.less'

export type EmptyStateVariant =
    | 'default'
    | 'invalidFilters'
    | 'inaccessible'
    | 'error'

const emptyStateContent: Record<
    EmptyStateVariant,
    { heading: string; subText: string }
> = {
    default: {
        heading: 'No open tickets',
        subText: "You've closed all your tickets!",
    },
    invalidFilters: {
        heading: 'Invalid filters',
        subText: 'This view is deactivated as at least one filter is invalid.',
    },
    inaccessible: {
        heading: "Can't access view",
        subText:
            'This view does not exist or you do not have the correct permissions',
    },
    error: {
        heading: 'Network error',
        subText: 'Unable to load this view currently',
    },
}

type Props = {
    isLoading: boolean
    emptyStateVariant: EmptyStateVariant
    onFixFilters?: () => void
    onRefresh?: () => void
}

export function TicketListEmptyPlaceholder({
    isLoading,
    emptyStateVariant,
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

    const { heading, subText } = emptyStateContent[emptyStateVariant]

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
            {emptyStateVariant === 'invalidFilters' && onFixFilters && (
                <Button onClick={onFixFilters}>Fix filters</Button>
            )}
            {emptyStateVariant === 'error' && onRefresh && (
                <Button onClick={onRefresh}>Refresh</Button>
            )}
        </Box>
    )
}
