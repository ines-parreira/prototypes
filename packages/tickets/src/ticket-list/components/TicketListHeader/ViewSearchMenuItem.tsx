import { useViewCount, ViewCountBadge } from '@repo/views'

import { MenuItem } from '@gorgias/axiom'
import type { View } from '@gorgias/helpdesk-types'

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

    return (
        <MenuItem
            id={String(view.id)}
            label={getViewDisplayName(view)}
            textValue={getViewDisplayName(view)}
            caption={caption}
            trailingSlot={
                count === undefined ? undefined : (
                    <ViewCountBadge viewId={view.id} />
                )
            }
            onAction={() => onAction(view)}
        />
    )
}
