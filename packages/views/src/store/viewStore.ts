import { appQueryClient } from '@repo/api-resources'

import { queryKeys } from '@gorgias/helpdesk-queries'
import type { View } from '@gorgias/helpdesk-types'

import type { AllViewsQueryData } from '../hooks/allViewsQuery'
import {
    ALL_VIEWS_QUERY_PARAMS,
    getAllViewsFromQueryData,
} from '../hooks/allViewsQuery'

export function getView(viewId: number): View | undefined {
    return getAllViews().find((view) => view.id === viewId)
}

export function getAllViews(): View[] {
    const data = appQueryClient.getQueryData<AllViewsQueryData>(
        queryKeys.views.listAllViews(ALL_VIEWS_QUERY_PARAMS),
    )

    return getAllViewsFromQueryData(data)
}
