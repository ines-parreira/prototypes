import {useGetAnalyticsCustomReport} from '@gorgias/api-queries'
import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import React, {useCallback, useState} from 'react'
import {useParams} from 'react-router-dom'

import {logEvent, SegmentEvent} from 'common/segment'
import {useCustomReportActions} from 'hooks/reporting/custom-reports/useCustomReportActions'
import {useDashboardNameValidation} from 'hooks/reporting/custom-reports/useDashboardNameValidation'
import {useUpdateDashboardCache} from 'hooks/reporting/custom-reports/useUpdateDashboardCache'
import useAppSelector from 'hooks/useAppSelector'
import {CreateCustomReport} from 'pages/stats/custom-reports/CreateCustomReport/CreateCustomReport'
import {CustomReport} from 'pages/stats/custom-reports/CustomReport'
import {CustomReportActionButton} from 'pages/stats/custom-reports/CustomReportActionButton'
import {CustomReportsModal} from 'pages/stats/custom-reports/CustomReportsModal/CustomReportsModal'
import {DashboardName} from 'pages/stats/custom-reports/DashboardName'
import {CustomReportSchema} from 'pages/stats/custom-reports/types'
import {customReportFromApi} from 'pages/stats/custom-reports/utils'
import StatsPage, {
    StatsPageContent,
    StatsPageHeader,
    StatsPageWrapper,
} from 'pages/stats/StatsPage'
import {getCurrentUser} from 'state/currentUser/selectors'
import {isTeamLead} from 'utils'

export const CUSTOM_REPORT_SCHEMA_ERROR = 'Custom report schema error'
export const CUSTOM_REPORT_ID_CTA = 'Actions'

export const CustomReportPage = () => {
    const {id} = useParams<{id: string}>()

    const {data, isLoading, isError} = useGetAnalyticsCustomReport(Number(id))

    const dashboard = customReportFromApi(data?.data)

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
                <div>{CUSTOM_REPORT_SCHEMA_ERROR}</div>
            </StatsPage>
        )
    }

    return <DashboardPage key={dashboard.id} dashboard={dashboard} />
}

const DashboardPage = ({dashboard}: {dashboard: CustomReportSchema}) => {
    const currentUser = useAppSelector(getCurrentUser)
    const isCurrentUserTeamLead = isTeamLead(currentUser)

    const [isOpen, setIsOpen] = useState(false)
    const closeModal = useCallback(() => setIsOpen(false), [])

    const {updateDashboardHandler, isUpdateMutationLoading} =
        useCustomReportActions()

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

    const {error} = useDashboardNameValidation(details.name, dashboard.name)

    const handleUpdateName = () =>
        updateDashboardHandler({
            dashboard: {
                ...dashboard,
                name: details.name,
                emoji: details.emoji,
            },
            successMessage,
        })

    const handleMoveCharts = (dashboard: CustomReportSchema) => {
        updateDashboardCache(dashboard)
    }

    const handleMoveChartsEnd = () =>
        updateDashboardHandler({dashboard, successMessage})

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
                        <CustomReportActionButton
                            setOpenModal={handleActionButtonClick}
                            customReport={dashboard}
                        />
                    )
                }
            />
            <StatsPageContent>
                {dashboard.children.length ? (
                    <CustomReport
                        customReport={dashboard}
                        onChartMove={handleMoveCharts}
                        onChartMoveEnd={handleMoveChartsEnd}
                    />
                ) : (
                    <CreateCustomReport />
                )}
                <CustomReportsModal
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
