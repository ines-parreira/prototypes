import { useCallback, useMemo, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { MetricOriginContext } from '@repo/reporting'
import { useParams } from 'react-router-dom'

import {
    Box,
    LegacyLoadingSpinner as LoadingSpinner,
    Text,
    ToggleField,
} from '@gorgias/axiom'

import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { useDashboardById } from 'domains/reporting/hooks/dashboards/useDashboardById'
import { useDashboardNameValidation } from 'domains/reporting/hooks/dashboards/useDashboardNameValidation'
import StatsPage, {
    StatsPageContent,
    StatsPageHeader,
    StatsPageWrapper,
} from 'domains/reporting/pages/common/layout/StatsPage'
import { AnalyticsCustomDashboard } from 'domains/reporting/pages/dashboards/AnalyticsCustomDashboard'
import { CreateDashboard } from 'domains/reporting/pages/dashboards/CreateDashboard/CreateDashboard'
import { DashboardActionButton } from 'domains/reporting/pages/dashboards/DashboardActionButton'
import { DashboardName } from 'domains/reporting/pages/dashboards/DashboardName'
import { DashboardsModal } from 'domains/reporting/pages/dashboards/DashboardsModal/DashboardsModal'
import { PinnedFilterSyncProvider } from 'domains/reporting/pages/dashboards/PinnedFilterSyncProvider'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { useShowMetricOrigin } from 'domains/reporting/pages/dashboards/useShowMetricOrigin'
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
    const currentUser = useAppSelector(getCurrentUser)
    const isCurrentUserTeamLead = isTeamLead(currentUser)

    const [isOpen, setIsOpen] = useState(false)
    const closeModal = useCallback(() => setIsOpen(false), [])

    const { updateDashboardHandler, isUpdateMutationLoading } =
        useDashboardActions()

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

    const [showMetricOrigin, setShowMetricOrigin] = useShowMetricOrigin(
        dashboard.id,
    )

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

    const handleActionButtonClick = (isOpen: boolean) => {
        setIsOpen(isOpen)
        logEvent(SegmentEvent.StatDashboardActionsMenuClicked)
    }

    return (
        <MetricOriginContext.Provider value={{ showMetricOrigin }}>
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
                        <Box alignItems="center" gap="sm">
                            <ToggleField
                                value={showMetricOrigin}
                                onChange={() => setShowMetricOrigin((v) => !v)}
                            />
                            <Text>Show metric origin</Text>
                            {isCurrentUserTeamLead && (
                                <DashboardActionButton
                                    setOpenModal={handleActionButtonClick}
                                    dashboard={dashboard}
                                />
                            )}
                        </Box>
                    }
                />
                <StatsPageContent>
                    {dashboard.children.length ? (
                        <AnalyticsCustomDashboard
                            dashboard={dashboard}
                            pinnedFilter={dashboardPinnedFilter}
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
        </MetricOriginContext.Provider>
    )
}
