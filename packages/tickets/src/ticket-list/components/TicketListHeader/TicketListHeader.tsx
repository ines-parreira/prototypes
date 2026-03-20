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
                            {viewName}
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
