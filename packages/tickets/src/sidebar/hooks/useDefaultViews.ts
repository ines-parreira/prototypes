import { useMemo } from 'react'
import { Duration } from '@gorgias/toolkit'

import {
    useDefaultViewsSourceSdkFlagWithLoading,
    useHelpdeskV2WayfindingMS1Flag,
} from '@repo/feature-flags'
import {
    useDefaultViews as useSdkDefaultViews,
    useDefaultViewsError as useSdkDefaultViewsError,
    useDefaultViewsLoading as useSdkDefaultViewsLoading,
} from '@repo/views'

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

type DefaultViewsResult = {
    defaultSystemViews: SystemView[]
    visibleSystemViews: SystemView[]
    visibilitySettingId: number | undefined
    isLoading: boolean
    isError: boolean
}

const LOADING_DEFAULT_VIEWS: DefaultViewsResult = {
    defaultSystemViews: [],
    visibleSystemViews: [],
    visibilitySettingId: undefined,
    isLoading: true,
    isError: false,
}

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

export function useDefaultViews(): DefaultViewsResult {
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()
    const {
        isLoading: isDefaultViewsSourceSdkFlagLoading,
        value: hasDefaultViewsSourceSdkFlag,
    } = useDefaultViewsSourceSdkFlagWithLoading()
    const shouldUseSdkViews =
        hasWayfindingMS1Flag &&
        hasDefaultViewsSourceSdkFlag &&
        !isDefaultViewsSourceSdkFlagLoading
    const shouldHoldForSdkFlag =
        hasWayfindingMS1Flag && isDefaultViewsSourceSdkFlagLoading

    const sdkDefaultSystemViews = useSdkDefaultViews({
        isEnabled: shouldUseSdkViews,
    })
    const sdkVisibleSystemViews = useSdkDefaultViews({
        isVisible: true,
        isEnabled: shouldUseSdkViews,
    })
    const sdkVisibilitySettingId = useSdkDefaultViewsVisibilitySettingId({
        enabled: shouldUseSdkViews,
    })
    const isSdkLoading = useSdkDefaultViewsLoading({
        isVisible: true,
        isEnabled: shouldUseSdkViews,
    })
    const isSdkError = useSdkDefaultViewsError({
        isVisible: true,
        isEnabled: shouldUseSdkViews,
    })
    const sdkDefaultViews = useMemo<DefaultViewsResult>(
        () => ({
            defaultSystemViews: sdkDefaultSystemViews,
            visibleSystemViews: sdkVisibleSystemViews,
            visibilitySettingId: sdkVisibilitySettingId,
            isLoading: isSdkLoading,
            isError: isSdkError,
        }),
        [
            isSdkError,
            isSdkLoading,
            sdkDefaultSystemViews,
            sdkVisibilitySettingId,
            sdkVisibleSystemViews,
        ],
    )
    const legacyDefaultViews = useLegacyDefaultViews({
        enabled: !shouldUseSdkViews && !shouldHoldForSdkFlag,
    })

    if (shouldHoldForSdkFlag) {
        return LOADING_DEFAULT_VIEWS
    }

    return shouldUseSdkViews ? sdkDefaultViews : legacyDefaultViews
}

function useSdkDefaultViewsVisibilitySettingId({
    enabled,
}: {
    enabled: boolean
}): number | undefined {
    const { data: viewsVisibilityResponse } = useListAccountSettings(
        {
            type: 'views-visibility',
        },
        {
            query: {
                enabled,
                staleTime: Duration.minutes(10),
                refetchOnWindowFocus: false,
                select: (data) =>
                    data?.data?.data?.find((setting) =>
                        isViewsVisibilityData(setting.data),
                    ),
            },
        },
    )

    return viewsVisibilityResponse?.id
}

function useLegacyDefaultViews({
    enabled,
}: {
    enabled: boolean
}): DefaultViewsResult {
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
                enabled,
                staleTime: Duration.minutes(10),
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

        return defaultSystemViews.filter((view) => {
            return !!view.id && !visibilityData?.hidden_views.includes(view.id)
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

function isViewsVisibilityData(data: unknown): data is ViewsVisibilityData {
    return (
        typeof data === 'object' &&
        data !== null &&
        'hidden_views' in data &&
        Array.isArray(data.hidden_views) &&
        data.hidden_views.every((id) => typeof id === 'number')
    )
}
