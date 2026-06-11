import { useMemo } from 'react'

import {
    useListAccountSettings,
    useListAllViews,
} from '@gorgias/helpdesk-queries'
import type { AccountSettingsItem } from '@gorgias/helpdesk-types'

import { VIEWS_STALE_TIME } from '../constants'
import { isViewsOrderingData, isViewsVisibilityData } from '../types'
import type { PublicViewsOrderingData, ViewsVisibilityData } from '../types'
import { selectSystemViews, SYSTEM_VIEWS_QUERY_PARAMS } from './useSystemViews'
import type { SystemView } from './useSystemViews'

type UseDefaultViewsOptions = {
    isVisible?: boolean
    isEnabled?: boolean
}

const VIEWS_VISIBILITY_QUERY_PARAMS = { type: 'views-visibility' } as const
const VIEWS_ORDERING_QUERY_PARAMS = { type: 'views-ordering' } as const

export function useDefaultViews(
    options: UseDefaultViewsOptions = {},
): SystemView[] {
    const isEnabled = options.isEnabled ?? true
    const isVisible = options.isVisible ?? false
    const { items: systemViews, isLoading: isLoadingViews } = useListAllViews(
        SYSTEM_VIEWS_QUERY_PARAMS,
        {
            query: {
                enabled: isEnabled,
                staleTime: VIEWS_STALE_TIME,
                refetchOnWindowFocus: false,
            },
        },
    )
    const ordering = useDefaultViewsOrdering(isEnabled)
    const { data: viewsVisibilitySetting } = useViewsVisibilitySettingQuery(
        isEnabled && isVisible,
    )

    const defaultViews = useMemo(() => {
        if (!isEnabled || isLoadingViews) {
            return []
        }

        return selectSystemViews(
            systemViews,
            ordering.views_top,
            ordering.views_bottom,
        )
    }, [
        isEnabled,
        isLoadingViews,
        systemViews,
        ordering.views_top,
        ordering.views_bottom,
    ])

    const visibilityData = isViewsVisibilityData(viewsVisibilitySetting?.data)
        ? viewsVisibilitySetting.data
        : undefined

    if (!isVisible) {
        return defaultViews
    }

    return getVisibleDefaultViews(defaultViews, visibilityData)
}

export function useDefaultViewsLoading(
    options: UseDefaultViewsOptions = {},
): boolean {
    const isEnabled = options.isEnabled ?? true
    const isVisible = options.isVisible ?? false
    const { isLoading: isLoadingViews } = useListAllViews(
        SYSTEM_VIEWS_QUERY_PARAMS,
        {
            query: {
                enabled: isEnabled,
                staleTime: VIEWS_STALE_TIME,
                refetchOnWindowFocus: false,
            },
        },
    )
    const { isLoading: isLoadingViewsOrdering } =
        useViewsOrderingQuery(isEnabled)
    const { isLoading: isLoadingViewsVisibility } =
        useViewsVisibilitySettingQuery(isEnabled && isVisible)

    return (
        isEnabled &&
        (isLoadingViews ||
            isLoadingViewsOrdering ||
            (isVisible && isLoadingViewsVisibility))
    )
}

export function useDefaultViewsError(
    options: UseDefaultViewsOptions = {},
): boolean {
    const isEnabled = options.isEnabled ?? true
    const isVisible = options.isVisible ?? false
    const { isError: isErrorViews } = useListAllViews(
        SYSTEM_VIEWS_QUERY_PARAMS,
        {
            query: {
                enabled: isEnabled,
                staleTime: VIEWS_STALE_TIME,
                refetchOnWindowFocus: false,
            },
        },
    )
    const { isError: isErrorViewsOrdering } = useViewsOrderingQuery(isEnabled)
    const { isError: isErrorViewsVisibility } = useViewsVisibilitySettingQuery(
        isEnabled && isVisible,
    )

    return (
        isEnabled &&
        (isErrorViews ||
            isErrorViewsOrdering ||
            (isVisible && isErrorViewsVisibility))
    )
}

function getVisibleDefaultViews(
    defaultSystemViews: SystemView[],
    visibilityData: ViewsVisibilityData | undefined,
) {
    return defaultSystemViews.filter(
        (view) => !visibilityData?.hidden_views.includes(view.id),
    )
}

const EMPTY_ORDERING: PublicViewsOrderingData = {
    views: {},
    views_top: {},
    views_bottom: {},
    view_sections: {},
}

function useDefaultViewsOrdering(isEnabled: boolean): PublicViewsOrderingData {
    const { data: cachedOrdering } = useViewsOrderingQuery(isEnabled)

    return isEnabled ? (cachedOrdering ?? EMPTY_ORDERING) : EMPTY_ORDERING
}

function useViewsOrderingQuery(enabled: boolean) {
    return useListAccountSettings(VIEWS_ORDERING_QUERY_PARAMS, {
        query: {
            enabled,
            staleTime: VIEWS_STALE_TIME,
            refetchOnWindowFocus: false,
            select: (response) => {
                const data = getFirstMatchingAccountSetting(
                    response?.data?.data,
                    isViewsOrderingData,
                )?.data

                return isViewsOrderingData(data)
                    ? { ...EMPTY_ORDERING, ...data }
                    : EMPTY_ORDERING
            },
        },
    })
}

function useViewsVisibilitySettingQuery(enabled: boolean) {
    return useListAccountSettings(VIEWS_VISIBILITY_QUERY_PARAMS, {
        query: {
            enabled,
            staleTime: VIEWS_STALE_TIME,
            refetchOnWindowFocus: false,
            select: (response) =>
                getFirstMatchingAccountSetting(
                    response?.data?.data,
                    isViewsVisibilityData,
                ),
        },
    })
}

function getFirstMatchingAccountSetting(
    settings: AccountSettingsItem[] | undefined,
    isMatchingSettingData: (data: unknown) => boolean,
) {
    return settings?.find((setting) => isMatchingSettingData(setting.data))
}
