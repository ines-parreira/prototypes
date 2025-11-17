import { useCallback, useMemo, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useParams } from 'react-router-dom'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { useFlag } from 'core/flags'
import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { useDashboardById } from 'domains/reporting/hooks/dashboards/useDashboardById'
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
import { NewDashboard } from 'domains/reporting/pages/dashboards/NewDashboard'
import { PinnedFilterSyncProvider } from 'domains/reporting/pages/dashboards/PinnedFilterSyncProvider'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

export const DASHBOARD_SCHEMA_ERROR = 'Dashboard schema error'

export const DashboardPage = () => {
    const { id } = useParams<{ id: string }>()

    const dashboard = useDashboardById(Number(id))

    if (dashboard.isLoading) {
        return (
            <StatsPage title="">
                <LoadingSpinner />
            </StatsPage>
        )
    }

    if (dashboard.isError || !dashboard.data) {
        return (
            <StatsPage title="">
                <div>{DASHBOARD_SCHEMA_ERROR}</div>
            </StatsPage>
        )
    }

    const pinnedFilterId = dashboard.data.analytics_filter_id

    let content = (
        <DashboardPageContent
            key={dashboard.data.id}
            dashboard={dashboard.data}
        />
    )

    if (pinnedFilterId) {
        content = (
            <PinnedFilterSyncProvider savedFilterId={pinnedFilterId}>
                {content}
            </PinnedFilterSyncProvider>
        )
    }

    return content
}

const DashboardPageContent = ({
    dashboard,
}: {
    dashboard: DashboardSchema
}) => {
    const isDashboardResizeChartsEnabled = useFlag(
        FeatureFlagKey.ReportingDashboardResizeCharts,
        false,
    )

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

    const dashboardPinnedFilter = useMemo(() => {
        const handleUpdatePinnedFilter = (
            savedFilterId: number,
            filterName: string,
        ) => {
            const filterId =
                dashboard.analytics_filter_id === savedFilterId
                    ? null
                    : savedFilterId
            updateDashboardHandler({
                dashboard: {
                    ...dashboard,
                    analytics_filter_id: filterId,
                },
                successMessage: `${filterName} has been ${filterId ? 'set' : 'removed'} as ${dashboard.name}'s default filter.`,
                errorMessage: `${filterName} could not be set as default filter. Please try again.`,
            })
        }

        return Object.freeze({
            id: dashboard.analytics_filter_id,
            pin: handleUpdatePinnedFilter,
        })
    }, [dashboard, updateDashboardHandler])

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
                    isDashboardResizeChartsEnabled ? (
                        <NewDashboard
                            dashboard={dashboard}
                            pinnedFilter={dashboardPinnedFilter}
                        />
                    ) : (
                        <Dashboard
                            dashboard={dashboard}
                            pinnedFilter={dashboardPinnedFilter}
                            onChartMove={handleMoveCharts}
                            onChartMoveEnd={handleMoveChartsEnd}
                        />
                    )
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
