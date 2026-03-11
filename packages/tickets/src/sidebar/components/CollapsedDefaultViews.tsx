import { history } from '@repo/routing'

import { Button, ButtonGroup, ButtonGroupItem } from '@gorgias/axiom'

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
                <ButtonGroupItem
                    key={`view-${view.id}`}
                    id={view.id.toString()}
                    icon={SYSTEM_VIEW_DEFINITIONS[view.name].icon}
                >
                    {SYSTEM_VIEW_DEFINITIONS[view.name].label}
                </ButtonGroupItem>
            ))}
            {showToggle && (
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
            )}
        </ButtonGroup>
    )
}
