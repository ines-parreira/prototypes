import { SYSTEM_VIEW_DEFINITIONS } from '@repo/tickets'

import {
    Box,
    Button,
    OverflowTooltip,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import { useGetView } from '@gorgias/helpdesk-queries'

import { SortOrderDropdown } from './SortOrderDropdown'

import css from './TicketListHeader.module.less'

type Props = {
    viewId: number
    onCollapse: () => void
    onEditView?: () => void
}

export function TicketListHeader({ viewId, onCollapse, onEditView }: Props) {
    const { data: viewResponse } = useGetView(viewId)
    const viewName = viewResponse?.data?.name
    const displayName =
        /* v8 ignore next -- codecov incorrectly reporting partial coverage */
        viewName && viewName in SYSTEM_VIEW_DEFINITIONS
            ? SYSTEM_VIEW_DEFINITIONS[viewName].label
            : viewName

    return (
        <Box
            className={css.header}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            gap="xs"
        >
            <Box
                flexDirection="row"
                alignItems="center"
                gap="xs"
                flex={1}
                minWidth={0}
            >
                <Box flexShrink={0}>
                    <Tooltip
                        trigger={
                            <Button
                                variant="secondary"
                                size="sm"
                                icon="system-bar-left-collapse"
                                aria-label="Hide ticket panel"
                                onClick={onCollapse}
                            />
                        }
                    >
                        <TooltipContent title="Hide ticket panel" />
                    </Tooltip>
                </Box>
                <Box flex={1} minWidth={0}>
                    <OverflowTooltip>
                        <Text
                            overflow="ellipsis"
                            className={css.viewName}
                            color="content-neutral-default"
                        >
                            {displayName}
                        </Text>
                    </OverflowTooltip>
                </Box>
            </Box>
            <Box
                flexDirection="row"
                alignItems="center"
                gap="xs"
                flexShrink={0}
            >
                <Tooltip
                    trigger={
                        <Button
                            variant="tertiary"
                            size="sm"
                            icon="slider-filter"
                            aria-label="Edit view"
                            onClick={onEditView}
                        />
                    }
                >
                    <TooltipContent title="Edit view" />
                </Tooltip>
                <SortOrderDropdown viewId={viewId} />
            </Box>
        </Box>
    )
}
