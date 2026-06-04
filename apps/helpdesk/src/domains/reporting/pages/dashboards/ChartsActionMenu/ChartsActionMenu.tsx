import type { ReactNode } from 'react'
import { useState } from 'react'

import { AnalyticsActionMenu } from '@repo/reporting'
import type { AnalyticsActionItem } from '@repo/reporting'

import { Button } from '@gorgias/axiom'

import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { AddChartToDashboardModal } from 'domains/reporting/pages/dashboards/ChartsActionMenu/AddChartToDashboardModal'
import { AddToDashboardPicker } from 'domains/reporting/pages/dashboards/ChartsActionMenu/AddToDashboardPicker'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

export const ADD_TO_DASHBOARD = 'Add to dashboard'
export const REMOVE_FROM_DASHBOARD = 'Remove chart from dashboard'
export const EXPORT_AS_CSV_LABEL = 'Export as CSV'
export {
    CREATE_NEW_DASHBOARD_LABEL,
    NO_DASHBOARDS_LABEL,
} from 'domains/reporting/pages/dashboards/ChartsActionMenu/AddToDashboardPicker'

export const ChartsActionMenu = ({
    chartName,
    chartId,
    dashboard,
    exportCsvAction,
}: {
    chartId: string
    chartName: ReactNode
    dashboard?: DashboardSchema
    exportCsvAction?: { onClick: () => void; isLoading?: boolean }
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const { removeChartFromDashboardHandler } = useDashboardActions()

    const currentUser = useAppSelector(getCurrentUser)
    const isCurrentUserTeamLead = isTeamLead(currentUser)

    if (!isCurrentUserTeamLead) {
        if (exportCsvAction) {
            return (
                <Button
                    variant="tertiary"
                    icon="download"
                    aria-label={EXPORT_AS_CSV_LABEL}
                    onClick={exportCsvAction.onClick}
                    isDisabled={exportCsvAction.isLoading}
                />
            )
        }
        return null
    }

    const hasMultipleActions = Boolean(exportCsvAction) || Boolean(dashboard)

    const actions: AnalyticsActionItem[] = [
        ...(exportCsvAction
            ? [
                  {
                      icon: 'download',
                      label: EXPORT_AS_CSV_LABEL,
                      onClick: exportCsvAction.onClick,
                      isDisabled: exportCsvAction.isLoading,
                  },
              ]
            : []),
        {
            icon: 'add-plus',
            label: ADD_TO_DASHBOARD,
            tooltip: 'Add to dashboard',
            dropdownContent: (close, goBack, defaultOpen) => (
                <AddToDashboardPicker
                    chartId={chartId}
                    close={close}
                    goBack={hasMultipleActions ? goBack : undefined}
                    openModal={() => setIsModalOpen(true)}
                    defaultOpen={defaultOpen}
                />
            ),
        },
        ...(dashboard
            ? [
                  {
                      icon: 'trash-empty',
                      label: REMOVE_FROM_DASHBOARD,
                      onClick: () =>
                          removeChartFromDashboardHandler({
                              dashboard,
                              chartId,
                          }),
                  },
              ]
            : []),
    ]

    return (
        <>
            <AnalyticsActionMenu actions={actions} />
            {isModalOpen && (
                <AddChartToDashboardModal
                    closeModal={() => setIsModalOpen(false)}
                    chartName={chartName}
                    chartId={chartId}
                />
            )}
        </>
    )
}
