import { Box, Button, MultiSelect, MultiSelectItem, Text } from '@gorgias/axiom'

import { SYSTEM_VIEW_DEFINITIONS } from '../constants/views'
import { useDefaultViews } from '../hooks/useDefaultViews'
import { useUpdateDefaultViewsVisibility } from '../hooks/useUpdateDefaultViewsVisibility'
import type { SystemView } from '../types/views'

export function DefaultViewsMenu() {
    const {
        defaultSystemViews,
        visibleSystemViews,
        visibilitySettingId,
        isLoading,
        isError,
    } = useDefaultViews()
    const updateVisibility = useUpdateDefaultViewsVisibility()

    const handleSelect = (selected: SystemView[]) => {
        if (!visibilitySettingId) {
            return
        }

        const selectedIds = new Set(selected.map((view) => view.id))
        const hiddenViewIds = defaultSystemViews
            .filter((view) => !selectedIds.has(view.id))
            .map((view) => view.id)

        updateVisibility({
            id: visibilitySettingId,
            data: {
                type: 'views-visibility',
                data: { hidden_views: hiddenViewIds },
            },
        })
    }

    return (
        <Box width="auto">
            <MultiSelect
                items={defaultSystemViews}
                selectedItems={visibleSystemViews}
                onSelect={handleSelect}
                selectionBehavior="toggle"
                aria-label="Filter default views"
                trigger={() => (
                    <Button
                        icon="slider-filter"
                        size="sm"
                        variant="tertiary"
                        isDisabled={isLoading || isError}
                    />
                )}
                footer={
                    <Box pl="xs" pr="xs" pb="xxxs" pt="xxxs">
                        <Text
                            variant="italic"
                            color="content-neutral-tertiary"
                            wrap="wrap"
                        >
                            Visible to all users in the account.
                        </Text>
                    </Box>
                }
            >
                {(view) => (
                    <MultiSelectItem
                        label={
                            SYSTEM_VIEW_DEFINITIONS[view.name]?.label ??
                            view.name
                        }
                    />
                )}
            </MultiSelect>
        </Box>
    )
}
