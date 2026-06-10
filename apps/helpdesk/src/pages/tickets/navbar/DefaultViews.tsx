import {
    DefaultViewsMenu,
    SYSTEM_VIEW_DEFINITIONS,
    useExpandableDefaultViews,
} from '@repo/tickets'
import { useCurrentUserRole } from '@repo/users'
import classnames from 'classnames'
import { useIsMobileResolution } from '@gorgias/toolkit-react'

import { Box, Button, Text } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { activeViewIdSet } from 'state/ui/views/actions'

import { TicketNavbarViewLinkItem } from './TicketNavbarViewLinkItem'

import css from './DefaultViews.less'

export function DefaultViews() {
    const { isAdmin } = useCurrentUserRole()
    const { displayedViews, showToggle, isExpanded, toggleExpanded } =
        useExpandableDefaultViews()
    const dispatch = useAppDispatch()
    const isMobileResolution = useIsMobileResolution()

    return (
        <Box flexDirection="column" gap="xxxxs">
            <Box
                className={classnames(css.header, {
                    [css.headerMobile]: isMobileResolution,
                })}
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
                                icon={SYSTEM_VIEW_DEFINITIONS[view.name].icon}
                                label={SYSTEM_VIEW_DEFINITIONS[view.name].label}
                                onClick={() =>
                                    dispatch(activeViewIdSet(view.id))
                                }
                                additionalActivePaths={
                                    SYSTEM_VIEW_DEFINITIONS[view.name]
                                        .additionalPaths
                                }
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
