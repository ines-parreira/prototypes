import { useViewCount, ViewCountBadge } from '@repo/views'

import { MenuItem } from '@gorgias/axiom'
import type { View } from '@gorgias/helpdesk-types'

import { SYSTEM_VIEW_DEFINITIONS } from '../../../sidebar/constants/views'
import { getViewDisplayName } from './useViewSearchMenuData'

type ViewSearchMenuItemProps = {
    view: View
    caption?: string
    onAction: (view: View) => void
}

export function ViewSearchMenuItem({
    view,
    caption,
    onAction,
}: ViewSearchMenuItemProps) {
    const count = useViewCount(view.id)
    const leadingSlot =
        view.category === 'system' && typeof view.name === 'string'
            ? SYSTEM_VIEW_DEFINITIONS[view.name]?.icon
            : undefined

    return (
        <MenuItem
            id={String(view.id)}
            label={getViewDisplayName(view)}
            textValue={getViewDisplayName(view)}
            caption={caption}
            leadingSlot={leadingSlot}
            trailingSlot={
                count === undefined ? undefined : (
                    <ViewCountBadge viewId={view.id} />
                )
            }
            onAction={() => onAction(view)}
        />
    )
}
