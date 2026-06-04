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

export function syncViewCreated(view: View) {
    updateAllViewsQuery((data) => upsertView(data, view))
}

export function syncViewUpdated(view: View) {
    updateAllViewsQuery((data) => upsertView(data, view))
}

export function syncViewDeleted(viewId: number) {
    updateAllViewsQuery((data) => deleteView(data, viewId))
}

function updateAllViewsQuery(
    updateQueryData: (
        data: AllViewsQueryData | undefined,
    ) => AllViewsQueryData | undefined,
) {
    const viewListQueryKey = queryKeys.views.listAllViews(
        ALL_VIEWS_QUERY_PARAMS,
    )

    appQueryClient.setQueryData<AllViewsQueryData>(
        viewListQueryKey,
        updateQueryData,
    )
    void appQueryClient.invalidateQueries({
        queryKey: queryKeys.views.listAllViews(),
    })
}

function upsertView(
    data: AllViewsQueryData | undefined,
    view: View,
): AllViewsQueryData | undefined {
    if (!data?.pages.length) {
        return data
    }

    const viewExists = data.pages.some((page) =>
        page.data.data.some((cachedView) => cachedView.id === view.id),
    )

    if (viewExists) {
        return {
            ...data,
            pages: data.pages.map((page) => ({
                ...page,
                data: {
                    ...page.data,
                    data: page.data.data.map((cachedView) =>
                        cachedView.id === view.id ? view : cachedView,
                    ),
                },
            })),
        }
    }

    return {
        ...data,
        pages: data.pages.map((page, pageIndex) =>
            pageIndex === 0
                ? {
                      ...page,
                      data: {
                          ...page.data,
                          data: [...page.data.data, view],
                      },
                  }
                : page,
        ),
    }
}

function deleteView(
    data: AllViewsQueryData | undefined,
    viewId: number,
): AllViewsQueryData | undefined {
    if (!data?.pages.length) {
        return data
    }

    return {
        ...data,
        pages: data.pages.map((page) => ({
            ...page,
            data: {
                ...page.data,
                data: page.data.data.filter((view) => view.id !== viewId),
            },
        })),
    }
}
