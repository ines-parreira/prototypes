import { Box, Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import { SortOrderDropdown } from './SortOrderDropdown'
import { ViewSearchMenu } from './ViewSearchMenu'

import css from './TicketListHeader.module.less'

type Props = {
    viewId: number
    onCollapse: () => void
    onEditView?: () => void
}

export function TicketListHeader({ viewId, onCollapse, onEditView }: Props) {
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
                <Box flex={1} minWidth={0}>
                    <ViewSearchMenu viewId={viewId} />
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
                <Tooltip
                    trigger={
                        <Button
                            variant="tertiary"
                            size="sm"
                            icon="close"
                            aria-label="Hide ticket panel"
                            onClick={onCollapse}
                        />
                    }
                >
                    <TooltipContent title="Hide ticket panel" />
                </Tooltip>
            </Box>
        </Box>
    )
}
