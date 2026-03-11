import {
    DefaultViewsMenu,
    SYSTEM_VIEW_DEFINITIONS,
    useExpandableDefaultViews,
} from '@repo/tickets'

import { Box, Button } from '@gorgias/axiom'

import { Navigation } from 'components/Navigation/Navigation'

import { TicketNavbarViewLinkItem } from './TicketNavbarViewLinkItem'

type Props = {
    viewCount: Record<number, number>
}

export function DefaultViews({ viewCount }: Props) {
    const { displayedViews, showToggle, isExpanded, toggleExpanded } =
        useExpandableDefaultViews()

    return (
        <Box flexDirection="column" gap="xs">
            <Navigation.SectionItem>
                <div>Default views</div>
                <DefaultViewsMenu />
            </Navigation.SectionItem>
            <Box flexDirection="column">
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
                >
                    {isExpanded ? 'Less' : 'More'}
                </Button>
            )}
        </Box>
    )
}
