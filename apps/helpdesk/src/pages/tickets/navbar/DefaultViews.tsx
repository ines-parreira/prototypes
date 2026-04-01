import {
    DefaultViewsMenu,
    SYSTEM_VIEW_DEFINITIONS,
    useExpandableDefaultViews,
} from '@repo/tickets'
import { useCurrentUserRole } from '@repo/users'

import { Box, Button, Text } from '@gorgias/axiom'

import { TicketNavbarViewLinkItem } from './TicketNavbarViewLinkItem'

type Props = {
    viewCount: Record<number, number>
}

export function DefaultViews({ viewCount }: Props) {
    const { isAdmin } = useCurrentUserRole()
    const { displayedViews, showToggle, isExpanded, toggleExpanded } =
        useExpandableDefaultViews()

    return (
        <Box flexDirection="column" gap="xxxxs">
            <Box
                alignItems="center"
                justifyContent="space-between"
                width="100%"
                gap="xs"
                paddingLeft="xs"
                paddingRight="xxxs"
                paddingBottom="xxxs"
                paddingTop="xxxs"
            >
                <Text variant="medium">Default views</Text>
                {isAdmin && <DefaultViewsMenu />}
            </Box>
            <Box flexDirection="column" gap="xxxxs">
                {displayedViews.map(
                    (view) =>
                        !!view.id &&
                        view.name && (
                            <TicketNavbarViewLinkItem
                                key={`view-${view.id}`}
                                view={view}
                                viewCount={viewCount[view.id]}
                                icon={SYSTEM_VIEW_DEFINITIONS[view.name].icon}
                                label={SYSTEM_VIEW_DEFINITIONS[view.name].label}
                            />
                        ),
                )}
            </Box>
            {showToggle && (
                <Button
                    leadingSlot={
                        isExpanded
                            ? 'arrow-chevron-up-duo'
                            : 'dots-meatballs-horizontal'
                    }
                    onClick={toggleExpanded}
                    variant="tertiary"
                    size="sm"
                >
                    {isExpanded ? 'Less' : 'More'}
                </Button>
            )}
        </Box>
    )
}
