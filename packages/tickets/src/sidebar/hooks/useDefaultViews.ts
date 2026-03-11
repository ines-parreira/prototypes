import { useMemo } from 'react'

import { useListAccountSettings, useListViews } from '@gorgias/helpdesk-queries'
import type { ListViews200, View } from '@gorgias/helpdesk-types'

import { SYSTEM_VIEW_DEFINITIONS } from '../constants/views'
import type { SystemView, ViewsVisibilityData } from '../types/views'

type WindowWithGorgiasState = Window & {
    GORGIAS_STATE?: {
        views?: {
            items?: View[]
        }
    }
}

const systemViews =
    (window as WindowWithGorgiasState).GORGIAS_STATE?.views?.items?.filter(
        (view: View) => view.category === 'system',
    ) ?? []

export function getOrderedSystemViews(views: View[] | undefined): SystemView[] {
    if (!views) {
        return []
    }

    return Object.values(SYSTEM_VIEW_DEFINITIONS)
        .map((definition) =>
            views.find((view) => view.name === definition.name),
        )
        .filter((view) => !!view) as SystemView[]
}

export function useDefaultViews() {
    const {
        data: viewsResponse,
        isLoading: isLoadingViews,
        isError: isErrorViews,
    } = useListViews(undefined, {
        query: {
            refetchOnWindowFocus: false,
            staleTime: Infinity,
            initialData: {
                data: {
                    data: systemViews,
                    meta: { next_cursor: null, prev_cursor: null },
                } as ListViews200,
            } as any,
            enabled: false,
            select: (data) => data?.data?.data,
        },
    })
    const {
        data: viewsVisibilityResponse,
        isLoading: isLoadingViewsVisibility,
        isError: isErrorViewsVisibility,
    } = useListAccountSettings(
        {
            type: 'views-visibility',
        },
        {
            query: {
                staleTime: Infinity,
                refetchOnWindowFocus: false,
                select: (data) => data?.data?.data?.[0],
            },
        },
    )

    const defaultSystemViews = useMemo(
        () => getOrderedSystemViews(viewsResponse as unknown as View[]),
        [viewsResponse],
    )

    const visibleSystemViews = useMemo(() => {
        const visibilityData = viewsVisibilityResponse?.data as
            | ViewsVisibilityData
            | undefined

        if (!visibilityData) {
            return []
        }

        return defaultSystemViews.filter((view) => {
            return !!view.id && !visibilityData.hidden_views.includes(view.id)
        })
    }, [defaultSystemViews, viewsVisibilityResponse])

    return {
        defaultSystemViews,
        visibleSystemViews,
        visibilitySettingId: viewsVisibilityResponse?.id,
        isLoading: isLoadingViews || isLoadingViewsVisibility,
        isError: isErrorViews || isErrorViewsVisibility,
    }
}
