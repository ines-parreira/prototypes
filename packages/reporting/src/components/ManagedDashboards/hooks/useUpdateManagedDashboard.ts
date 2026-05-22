import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { useUpdateAnalyticsManagedDashboard } from '@gorgias/helpdesk-queries'
import type { AnalyticsManagedDashboard } from '@gorgias/helpdesk-types'

import type { DashboardLayoutConfig, LayoutSection } from '../types'
import { buildDashboardConfig } from '../utils/managedDashboardMappers'
import { managedDashboardKeys } from './constants'
import { useManagedDashboardMutationOptions } from './useManagedDashboardMutationOptions'

type Options = {
    silent?: boolean
}

export function useUpdateManagedDashboard(options?: Options) {
    const queryClient = useQueryClient()
    const { mutate: saveDashboard, isLoading } =
        useUpdateAnalyticsManagedDashboard({
            mutation: useManagedDashboardMutationOptions(options),
        })

    const updateSection = useCallback(
        <TChart extends string>(
            dashboardId: string,
            tabId: string,
            tabName: string,
            layoutConfig: DashboardLayoutConfig<TChart>,
            sectionId: string,
            sectionUpdater: (
                section: LayoutSection<TChart>,
            ) => LayoutSection<TChart>,
            onSuccess?: () => void,
        ) => {
            const updatedLayoutConfig: DashboardLayoutConfig<TChart> = {
                sections: layoutConfig.sections.map((section) =>
                    section.id === sectionId
                        ? sectionUpdater(section)
                        : section,
                ),
            }

            const cachedList = queryClient.getQueryData<{
                data: { data: AnalyticsManagedDashboard[] }
            }>(managedDashboardKeys.listAnalyticsManagedDashboards())

            const existingDashboard = cachedList?.data?.data?.find(
                (d) => d.id === dashboardId,
            )

            const dashboardConfig = buildDashboardConfig(
                dashboardId,
                tabId,
                tabName,
                updatedLayoutConfig,
                existingDashboard?.config,
            )

            saveDashboard(
                { id: dashboardId, data: { config: dashboardConfig } },
                { onSuccess },
            )
        },
        [queryClient, saveDashboard],
    )

    return { updateSection, isLoading }
}
