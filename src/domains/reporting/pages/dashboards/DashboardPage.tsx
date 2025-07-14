import { useCallback, useState } from 'react'

import { useParams } from 'react-router-dom'

import { useGetAnalyticsCustomReport } from '@gorgias/helpdesk-queries'
import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { useDashboardNameValidation } from 'domains/reporting/hooks/dashboards/useDashboardNameValidation'
import { useUpdateDashboardCache } from 'domains/reporting/hooks/dashboards/useUpdateDashboardCache'
import StatsPage, {
    StatsPageContent,
    StatsPageHeader,
    StatsPageWrapper,
} from 'domains/reporting/pages/common/layout/StatsPage'
import { CreateDashboard } from 'domains/reporting/pages/dashboards/CreateDashboard/CreateDashboard'
import { Dashboard } from 'domains/reporting/pages/dashboards/Dashboard'
import { DashboardActionButton } from 'domains/reporting/pages/dashboards/DashboardActionButton'
import { DashboardName } from 'domains/reporting/pages/dashboards/DashboardName'
import { DashboardsModal } from 'domains/reporting/pages/dashboards/DashboardsModal/DashboardsModal'
import { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { dashboardFromApi } from 'domains/reporting/pages/dashboards/utils'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

export const DASHBOARD_SCHEMA_ERROR = 'Dashboard schema error'

export const DashboardPage = () => {
    const { id } = useParams<{ id: string }>()

    const { data, isLoading, isError } = useGetAnalyticsCustomReport(Number(id))

    const dashboard = dashboardFromApi(data?.data)

    if (isLoading) {
        return (
            <StatsPage title="">
                <LoadingSpinner />
            </StatsPage>
        )
    }

    if (isError || !dashboard) {
        return (
            <StatsPage title="">
                <div>{DASHBOARD_SCHEMA_ERROR}</div>
            </StatsPage>
        )
    }

    return <DashboardPageContent key={dashboard.id} dashboard={dashboard} />
}

const DashboardPageContent = ({
    dashboard,
}: {
    dashboard: DashboardSchema
}) => {
    const currentUser = useAppSelector(getCurrentUser)
    const isCurrentUserTeamLead = isTeamLead(currentUser)

    const [isOpen, setIsOpen] = useState(false)
    const closeModal = useCallback(() => setIsOpen(false), [])

    const { updateDashboardHandler, isUpdateMutationLoading } =
        useDashboardActions()

    const updateDashboardCache = useUpdateDashboardCache(dashboard.id)

    const handleUpdateCharts = (chartIds: string[]) => {
        updateDashboardHandler({
            dashboard,
            chartIds,
            onSuccess: closeModal,
        })
    }

    const [details, setDetails] = useState({
        name: dashboard.name,
        emoji: dashboard.emoji || '',
    })

    const successMessage = `Successfully updated ${details.name}`

    const { error } = useDashboardNameValidation(details.name, dashboard.name)

    const handleUpdateName = () =>
        updateDashboardHandler({
            dashboard: {
                ...dashboard,
                name: details.name,
                emoji: details.emoji,
            },
            successMessage,
        })

    const handleMoveCharts = (dashboard: DashboardSchema) => {
        updateDashboardCache(dashboard)
    }

    const handleMoveChartsEnd = () =>
        updateDashboardHandler({ dashboard, successMessage })

    const handleActionButtonClick = (isOpen: boolean) => {
        setIsOpen(isOpen)
        logEvent(SegmentEvent.StatDashboardActionsMenuClicked)
    }

    return (
        <StatsPageWrapper>
            <StatsPageHeader
                left={
                    <DashboardName
                        value={details}
                        onChange={setDetails}
                        onBlur={handleUpdateName}
                        error={error}
                    />
                }
                right={
                    isCurrentUserTeamLead && (
                        <DashboardActionButton
                            setOpenModal={handleActionButtonClick}
                            dashboard={dashboard}
                        />
                    )
                }
            />
            <StatsPageContent>
                {dashboard.children.length ? (
                    <Dashboard
                        dashboard={dashboard}
                        onChartMove={handleMoveCharts}
                        onChartMoveEnd={handleMoveChartsEnd}
                    />
                ) : (
                    <CreateDashboard />
                )}
                <DashboardsModal
                    isOpen={isOpen}
                    onCancel={closeModal}
                    onSave={handleUpdateCharts}
                    charts={dashboard.children}
                    isLoading={isUpdateMutationLoading}
                />
            </StatsPageContent>
        </StatsPageWrapper>
    )
}
