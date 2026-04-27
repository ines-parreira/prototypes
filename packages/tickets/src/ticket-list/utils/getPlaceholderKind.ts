import type { View } from '@gorgias/helpdesk-types'

import { EmptyViewsState } from '../../utils/views'
import type { ViewEmptyStateKind } from '../../utils/views'
import { isInaccessibleViewItemsError } from './isInaccessibleViewItemsError'

type Params = {
    view?: View | null
    error: unknown
    isEmpty: boolean
}

export function getPlaceholderKind({
    view,
    error,
    isEmpty,
}: Params): ViewEmptyStateKind | null {
    if (view?.deactivated_datetime) return EmptyViewsState.InvalidFilters
    if (view === null || isInaccessibleViewItemsError(error)) {
        return EmptyViewsState.Inaccessible
    }
    if (error) return EmptyViewsState.Error
    if (isEmpty) return EmptyViewsState.Empty

    return null
}
