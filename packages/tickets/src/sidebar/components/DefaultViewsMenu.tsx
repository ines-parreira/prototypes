import { Button, CheckBoxField, Menu, MenuItem } from '@gorgias/axiom'

import { SYSTEM_VIEW_DEFINITIONS } from '../constants/views'
import { useDefaultViews } from '../hooks/useDefaultViews'
import { useUpdateDefaultViewsVisibility } from '../hooks/useUpdateDefaultViewsVisibility'
import type { SystemView } from '../types/views'

const extractKeys = (views: SystemView[]) =>
    views.map((view) => view.id.toString())

export function DefaultViewsMenu() {
    const {
        defaultSystemViews,
        visibleSystemViews,
        visibilitySettingId,
        isLoading,
        isError,
    } = useDefaultViews()
    const updateVisibility = useUpdateDefaultViewsVisibility()

    const handleChange = (newSelection: string[]) => {
        if (!visibilitySettingId) {
            return
        }

        const hiddenViewIds = defaultSystemViews
            .filter((view) => !newSelection.includes(view.id.toString()))
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
        <Menu
            trigger={
                <Button
                    icon="slider-filter"
                    size="sm"
                    variant="tertiary"
                    aria-label="Filter default views"
                    isDisabled={isLoading || isError}
                />
            }
            selectionMode="multiple"
            selectedKeys={extractKeys(visibleSystemViews)}
            onSelectionChange={(keys) =>
                handleChange(
                    keys === 'all'
                        ? extractKeys(defaultSystemViews)
                        : [...keys].map(String),
                )
            }
        >
            {defaultSystemViews.map((view) => (
                <MenuItem
                    id={view.id.toString()}
                    key={view.id}
                    label={
                        SYSTEM_VIEW_DEFINITIONS[view.name]?.label ?? view.name
                    }
                    leadingSlot={({ isSelected }) => (
                        <CheckBoxField value={isSelected} />
                    )}
                />
            ))}
        </Menu>
    )
}
