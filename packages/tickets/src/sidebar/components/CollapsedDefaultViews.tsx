import { SidebarCollapsedItem } from '@repo/navigation'
import { history } from '@repo/routing'

import { Button, ButtonGroup, Tooltip, TooltipContent } from '@gorgias/axiom'

import { useTicketsLegacyBridge } from '../../utils/LegacyBridge'
import { SYSTEM_VIEW_DEFINITIONS } from '../constants/views'
import { useExpandableDefaultViews } from '../hooks/useExpandableDefaultViews'

export function CollapsedDefaultViews() {
    const { displayedViews, showToggle, isExpanded, toggleExpanded } =
        useExpandableDefaultViews()
    const { dtpToggle } = useTicketsLegacyBridge()

    const handleSelectionChange = (id: string) => {
        const view = displayedViews.find((v) => v.id?.toString() === id)

        if (!view) {
            return
        }

        history.push(
            dtpToggle.isEnabled
                ? `/app/views/${view.id}`
                : `/app/tickets/${view.id}/${encodeURIComponent(view.slug || '')}`,
        )
    }

    return (
        <ButtonGroup
            orientation="vertical"
            withoutBorder
            onSelectionChange={handleSelectionChange}
        >
            {displayedViews.map((view) => (
                <SidebarCollapsedItem
                    key={`view-${view.id}`}
                    id={view.id.toString()}
                    icon={SYSTEM_VIEW_DEFINITIONS[view.name].icon}
                    label={SYSTEM_VIEW_DEFINITIONS[view.name].label}
                />
            ))}
            {showToggle && (
                <Tooltip
                    placement="right"
                    trigger={
                        <Button
                            icon={
                                isExpanded
                                    ? 'arrow-chevron-up-duo'
                                    : 'dots-meatballs-horizontal'
                            }
                            onClick={toggleExpanded}
                            size="sm"
                            variant="tertiary"
                        />
                    }
                >
                    <TooltipContent title={isExpanded ? 'Less' : 'More'} />
                </Tooltip>
            )}
        </ButtonGroup>
    )
}
