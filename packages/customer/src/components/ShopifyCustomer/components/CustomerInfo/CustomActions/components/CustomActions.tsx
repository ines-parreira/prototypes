import {
    Box,
    Link,
    OverflowList,
    OverflowListItem,
    OverflowListShowLess,
    OverflowListShowMore,
} from '@gorgias/axiom'

import { useCustomActions } from '../hooks/useCustomActions'
import type { WidgetPath } from '../utils/customActionWidgetUtils'
import { ActionButton } from './ActionButton'
import { useTemplateResolver } from './TemplateResolverContext'

import css from './CustomActions.less'

type CustomActionsProps = {
    integrationId?: number
    customerId?: number
    ticketId?: string
    widgetPath?: WidgetPath
    compact?: boolean
}

export function CustomActions({
    integrationId,
    customerId,
    ticketId,
    widgetPath = 'customer',
    compact = false,
}: CustomActionsProps) {
    const { links, buttons } = useCustomActions({ widgetPath })
    const resolve = useTemplateResolver()

    if (links.length === 0 && buttons.length === 0) {
        return null
    }

    return (
        <Box
            flexWrap="wrap"
            gap={compact ? 'xxs' : 'sm'}
            pb={compact ? undefined : 'md'}
        >
            <Box gap="xs" flexWrap="wrap">
                {buttons.map((button, index) => (
                    <Box
                        key={`button-${index}-${button.label}-${button.action.url}`}
                    >
                        <ActionButton
                            config={button}
                            integrationId={integrationId}
                            customerId={customerId}
                            ticketId={ticketId}
                        />
                    </Box>
                ))}
            </Box>

            {links.length > 0 && (
                <OverflowList nonExpandedLineCount={3} gap="sm">
                    {links.map((link, index) => (
                        <OverflowListItem
                            key={`link-${index}-${link.label}-${link.url}`}
                            className={css.overflowListItem}
                        >
                            <Link
                                href={resolve(link.url)}
                                target="_blank"
                                trailingSlot="external-link"
                            >
                                {resolve(link.label)}
                            </Link>
                        </OverflowListItem>
                    ))}
                    <OverflowListShowMore>
                        {({ hiddenCount }) => `+${hiddenCount}`}
                    </OverflowListShowMore>
                    <OverflowListShowLess />
                </OverflowList>
            )}
        </Box>
    )
}
