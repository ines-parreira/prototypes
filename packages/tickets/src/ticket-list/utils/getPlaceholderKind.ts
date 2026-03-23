import type { View } from '@gorgias/helpdesk-types'

import { EmptyViewsState } from '../../utils/views'
import type { ViewEmptyStateKind } from '../../utils/views'

type Params = {
    view?: View | null
    hasError: boolean
    isEmpty: boolean
}

export function getPlaceholderKind({
    view,
    hasError,
    isEmpty,
}: Params): ViewEmptyStateKind | null {
    if (view?.deactivated_datetime) return EmptyViewsState.InvalidFilters
    if (view === null) return EmptyViewsState.Inaccessible
    if (hasError) return EmptyViewsState.Error
    if (isEmpty) return EmptyViewsState.Empty

    return null
}
